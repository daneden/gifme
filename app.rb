require 'rubygems'
require 'bundler'

require 'sinatra/asset_pipeline'

Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

require_relative 'secrets'

class App < Sinatra::Base
  register Sinatra::AssetPipeline

  get '/' do
    cache_control :public, max_age: 86400
    erb :index
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
        gifs
      )
    else
      json(
        "error": "Something went wrong"
      )
    end
  end

end
