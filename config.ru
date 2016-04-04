Encoding.default_external = "utf-8"

require './app.rb'

# Defined in ENV on Heroku. To try locally, start memcached and uncomment:
# ENV["MEMCACHE_SERVERS"] = "localhost"
if memcache_servers = ENV["MEMCACHE_SERVERS"]
  use Rack::Cache,
    verbose: true,
    metastore:   "memcached://#{memcache_servers}",
    entitystore: "memcached://#{memcache_servers}"
end

map App.assets_prefix do
  run App.sprockets
end

map "/" do
  run App
end
