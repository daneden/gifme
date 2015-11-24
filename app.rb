require 'sinatra'

get '/' do
  erb :index
end

# Any request that isn't '/' we can probably assume is trying to direct-link an image.
get '/:file' do
  send_file File.join(settings.public_folder, "gifs", params[:file])
end
