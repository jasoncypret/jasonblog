# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

set :fonts_dir,  'fonts'
set :css_dir, 'stylesheets'
set :markdown_engine, :redcarpet
set :markdown, fenced_code_blocks: true, smartypants: true

# Add video files to the list of binary files
set :binary_files, %w(.m4v .mp4 .webm .ogv)

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
  
  # Generate thumbnails when server starts
  after_configuration do
    require 'mini_magick'
    
    # Define thumbnail size (2x the display size for retina)
    thumbnail_size = "400x500"
    
    # Find all images in the companies directory
    Dir.glob("source/images/companies/**/*.{jpg,jpeg,png}").each do |image_path|
      next if image_path.include?('_thumb') # Skip existing thumbnails
      
      # Generate thumbnail path
      thumbnail_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_thumb\0')
      
      # Skip if thumbnail already exists
      next if File.exist?(thumbnail_path)
      
      # Create thumbnail
      puts "Generating thumbnail for #{image_path}"
      image = MiniMagick::Image.open(image_path)
      image.resize thumbnail_size
      image.quality 90 # Higher quality for thumbnails
      image.write thumbnail_path
    end
  end
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

  def gallery_image(path, title: nil, description: nil, alt: nil)
    content_tag(:div, class: 'gallery-item') do
      # Add data-lightbox attribute to the image
      image = image_tag(path, 
        class: 'gallery-thumbnail lazyload', 
        alt: alt,
        data: { lightbox: "/images/#{path}" }
      )
      content = []
      content << image
      
      if title
        content << content_tag(:h5, title, class: 'gallery-item-title')
      end
      
      if description
        content << content_tag(:p, description, class: 'gallery-item-description')
      end
      
      content.join.html_safe
    end
  end

  def process_image(path, options = {})
    # Default options
    options = {
      width: 300,
      height: 300,
      quality: 80,
      format: 'webp'
    }.merge(options)

    # Generate the processed image path
    processed_path = path.gsub(/\.(jpg|jpeg|png)$/, ".#{options[:format]}")
    
    # Return the path for the processed image
    processed_path
  end

  def age_in_completed_years (bd, d)
    # Difference in years, less one if you have not had a birthday this year.
    a = d.year - bd.year
    a = a - 1 if (
         bd.month >  d.month or 
        (bd.month >= bd.month and bd.day > d.day)
    )
    a
  end
end

activate :blog do |blog|
  blog.layout = "post"
  blog.permalink = "{title}.html"
  blog.sources = "articles/:title.html"
  blog.publish_future_dated = true

  # Enable pagination
  blog.paginate = true
  blog.per_page = 10
  blog.page_link = "page/{num}"

  blog.tag_template = "tag_template.html"
  blog.calendar_template = "calendar_template.html"
end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings
configure :build do
  activate :asset_hash
  activate :minify_css
  activate :minify_javascript
  activate :relative_assets
  
  # Generate thumbnails during build
  after_build do |builder|
    require 'mini_magick'
    
    # Define thumbnail size (2x the display size for retina)
    thumbnail_size = "400x500"
    
    # Find all images in the companies directory
    Dir.glob("source/images/companies/**/*.{jpg,jpeg,png}").each do |image_path|
      next if image_path.include?('_thumb') # Skip existing thumbnails
      
      # Generate thumbnail path
      thumbnail_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_thumb\0')
      
      # Skip if thumbnail already exists
      next if File.exist?(thumbnail_path)
      
      # Create thumbnail
      puts "Generating thumbnail for #{image_path}"
      image = MiniMagick::Image.open(image_path)
      image.resize thumbnail_size
      image.quality 90 # Higher quality for thumbnails
      image.write thumbnail_path
    end
  end

  # Copy video files to build directory
  after_build do |builder|
    FileUtils.cp_r Dir.glob('source/videos/*'), 'build/videos/'
  end
end

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end
