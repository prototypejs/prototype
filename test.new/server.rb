require 'sinatra/base'
require 'pathname'
require 'json'

require 'pp'

class UnitTests < Sinatra::Application

  PWD = Pathname.new( File.expand_path( File.dirname(__FILE__) ) )

  set :root, PWD
  set :public_folder, PWD.join('static')

  PATH_TO_PROTOTYPE = PWD.join('..', 'dist', 'prototype.js')

  unless PATH_TO_PROTOTYPE.file?
    raise "You must run `rake dist` before starting the server."
  end

  PATH_TO_TEST_JS = PWD.join('tests')


  SUITES = []

  PATH_TO_TEST_JS.each_entry do |e|
    next if e.directory?
    basename = e.basename('.*').to_s
    next if basename.start_with?('.')
    SUITES << basename.sub('.test', '')
  end

  SUITES_WITH_VIEWS = []

  PWD.join('views', 'tests').each_entry do |e|
    next if e.directory?
    basename = e.basename('.*').to_s
    SUITES_WITH_VIEWS << basename
  end


  def self.get_or_post(url, &block)
    get(url, &block)
    post(url, &block)
  end

  get '/test/:names?' do
    names = params[:names]
    @suites = names.nil? ? SUITES : names.split(/,/).uniq
    erb :tests, :locals => { :suites => @suites }
  end

  get '/prototype.js' do
    content_type 'text/javascript'
    send_file PATH_TO_PROTOTYPE
  end

  get '/js/tests/:filename' do
    filename = params[:filename]
    path = PATH_TO_TEST_JS.join(filename)
    if path.file?
      content_type 'text/javascript'
      send_file PATH_TO_TEST_JS.join(filename)
    else
      status 404
    end
  end


  # Routes for Ajax tests

  get_or_post '/inspect' do
    response = {
      :headers => request_headers(request.env),
      :method  => request.request_method,
      :body    => request.body.read
    }

    pp response[:headers]

    content_type 'application/json'
    JSON.dump(response)
  end

  get '/response' do
    header_params = {}
    params.each do |k, v|
      v = v.gsub(/[\r\n]/, '')
      header_params[k] = v
    end
    headers(header_params)

    if params[:'Content-Type']
      content_type params[:'Content-Type'].strip
    else
      content_type 'application/json'
    end

    params[:responseBody] || ""
  end

  # Collect all the headers that were sent with a request. (This is harder than
  # it seems because of how Rack normalizes headers.)
  def request_headers(env)
    results = {}

    env.each do |k, v|
      next unless k.start_with?('HTTP_') || k == 'CONTENT_TYPE'
      key = k.sub('HTTP_', '').gsub('_', '-').downcase
      results[key] = v
    end

    results
  end


  not_found do
    "File not found."
  end


  helpers do

    def suite_has_html?(suite)
      SUITES_WITH_VIEWS.include?(suite)
    end

  end

  # run! if app_file == $0
end