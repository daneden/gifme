require 'rubygems'
require 'bundler'

Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

require_relative 'secrets'

class App < Sinatra::Base
  set :sprockets, Sprockets::Environment.new(root)
  set :assets_prefix, '/assets'
  set :digest_assets, false
  set :logging, true

  configure do
    # Setup Sprockets
    sprockets.append_path File.join(root, 'assets', 'css')
    sprockets.append_path File.join(root, 'assets', 'js')
    sprockets.append_path File.join(root, 'assets', 'images')

    # Configure Sprockets::Helpers (if necessary)
    Sprockets::Helpers.configure do |config|
      config.environment = sprockets
      config.prefix      = assets_prefix
      config.digest      = digest_assets
      config.public_path = public_folder

      # Force to debug mode in development mode
      # Debug mode automatically sets
      # expand = true, digest = false, manifest = false
      config.debug       = true if development?
    end
  end

  require "autoprefixer-rails"
  AutoprefixerRails.install(sprockets)

  helpers do
    include Sprockets::Helpers

    # Alternative method for telling Sprockets::Helpers which
    # Sprockets environment to use.
    # def assets_environment
    #   settings.sprockets
    # end
  end

  get '/' do
    cache_control :public, max_age: 86400
    dir = settings.public_folder + "/gifs"
    gifs = Dir.foreach(dir).select { |x| File.file?("#{dir}/#{x}") }
    gifs = gifs.shuffle
    erb :index, :locals => {:images => gifs}
  end

  get '/random' do
    dir  = settings.public_folder + "/gifs"
    gifs = Dir.foreach(dir).select { |x| File.file?("#{dir}/#{x}") }
    gif  = gifs.sample
    erb :random, :locals => {:gif => gif}
  end

  get '/slack' do
    cache_control :public, max_age: 86400
    erb :slack
  end

  get '/slack/callback' do
    api_result = RestClient.get "https://slack.com/api/oauth.access?client_id=#{$client_id}&client_secret=#{$client_secret}&code=#{params[:code]}"
    jhash = JSON.parse(api_result)

    puts jhash

    redirect '/slack/success'
  end

  get '/slack/success' do
    erb :slackSuccess
  end

  # Any request that isn't '/' we can probably assume is trying to direct-link an image.
  get '/:file' do
    cache_control :public, max_age: 86400
    ext = params[:file].split('.')[1]
    file = File.join(settings.public_folder, "gifs", params[:file])
    puts ext
    headers["Content-Type"] = "image/" + ext
    headers["Cache-Control"] = "public, max-age=2678400"
    headers["Content-Length"] = File.size?(file)
    puts headers
    send_file file
  end

  post '/api/v0/sample' do
    content_type :json
    query = params[:text]
    token = params[:token]

    unless $tokens.include?(token)
     json(
      "response_type": "ephemeral",
      "text": "Hmm. Looks like this was an unauthorized request. I'm just going to ignore you."
     )
     abort("Unauthorized token")
    end

    dir = settings.public_folder + "/gifs"
    gifs = Dir.foreach(dir).select { |x| File.file?("#{dir}/#{x}") }

    if query != nil
      gif = gifs.select{ |i| i[/#{query}/] }
    end

    gif = gif.sample

    if gif != nil
      response = "<https://gif.daneden.me/" + gif + ">"
      json(
        "response_type": "in_channel",
        "text": response,
        "unfurl_links": true,
        "unfurl_media": true
      )
    else
      json(
        "response_type": "ephemeral",
        "text": "Ugh. There weren't any gifs matching '" + query + "'. My bad. \nYou could always go to <https://gif.daneden.me> and look for one yourself."
      )
    end

  end

  get '/api/v0/all' do
    content_type :json

    dir = settings.public_folder + "/gifs"
    gifs = Dir.foreach(dir).select { |x| File.file?("#{dir}/#{x}") }

    if gifs != nil
      json(
        "images": gifs
      )
    else
      json(
        "error": "Something went wrong"
      )
    end
  end

end
