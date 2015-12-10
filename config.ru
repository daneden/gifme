require './app.rb'

map App.assets_prefix do
  run App.sprockets
end

map "/" do
  run App
end
