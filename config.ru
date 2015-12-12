Encoding.default_external = "utf-8"

require 'rubygems'
require 'bundler'

Bundler.require

require './app.rb'

map App.assets_prefix do
  run App.sprockets
end

map "/" do
  run App
end
