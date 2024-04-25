# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

set :fonts_dir,  'fonts'
set :css_dir, 'stylesheets'
set :markdown_engine, :redcarpet
set :markdown, fenced_code_blocks: true, smartypants: true

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

# Syntax highlighting
activate :syntax

# Pretty URLs - Creates a directory structure without the .html extension
activate :directory_indexes

# Layouts
# https://middlemanapp.com/basics/layouts/
# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false


# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

helpers do
  def image_tag( path, params = {} )
   classes = params[:class].try(:split, " ") || []
   classes << "lazyload"
   params[:class] = classes.try(:join, " ")
   super( path, params )
 end


 def age_in_completed_years (bd, d)
  # Difference in years, less one if you have not had a birthday this year.
  a = d.year - bd.year
  a = a - 1 if (
       bd.month >  d.month or 
      (bd.month >= d.month and bd.day > d.day)
  )
  a
end

end


activate :blog do |blog|
  blog.layout = "post"
  blog.permalink = "{title}.html"
  blog.sources = "articles/:title.html"
end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings
configure :build do
  activate :minify_css
  # activate :minify_javascript, compressor: Terser.new
  activate :asset_hash # Enable cache buster
  activate :relative_assets # Use relative URLs
end
