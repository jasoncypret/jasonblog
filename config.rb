# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

set :fonts_dir,  'fonts'
set :css_dir, 'stylesheets'
set :markdown_engine, :redcarpet
set :markdown, fenced_code_blocks: true, smartypants: true, tables: true

# Add video files to the list of binary files
set :binary_files, %w(.m4v .mp4 .webm .ogv)

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
  
  # Generate thumbnails when server starts
  after_configuration do
    require 'mini_magick'
    
    # Define thumbnail size (2x the display size for retina)
    thumbnail_size = "500x600"
    
    # Find all images in the companies directory
    Dir.glob("source/media/companies/**/*.{jpg,jpeg,png,webp}").each do |image_path|
      next if image_path.include?('_thumb') # Skip existing thumbnails
      
      # Generate thumbnail path
      thumbnail_path = image_path.gsub(/\.(jpg|jpeg|png|webp)$/, '_thumb\0')
      
      # Skip if thumbnail already exists
      next if File.exist?(thumbnail_path)
      
      # Create thumbnail
      puts "Generating thumbnail for #{image_path}"
      image = MiniMagick::Image.open(image_path)
      image.resize thumbnail_size
      image.quality 96 # Higher quality for thumbnails
      image.write thumbnail_path

      unless image_path.end_with?('.webp')
        webp_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '.webp')
        original = MiniMagick::Image.open(image_path)
        original.format 'webp'
        original.write webp_path
        desktop_path = File.expand_path("~/Desktop")
        backup_path = File.join(desktop_path, File.basename(image_path))
        FileUtils.mv(image_path, backup_path) if File.exist?(image_path)
      end
    end


    # Generate thumbnails for videos on startup
    require 'open3'

    Dir.glob("source/media/**/*.{mov,m4v,avi}").each do |video_path|
      output_path = video_path.gsub(/\.(mov|m4v|avi)$/, ".mp4")
      
      # Skip if already exists
      next if File.exist?(output_path)
    
      puts "Converting #{video_path} to MP4..."
      cmd = [
        "ffmpeg", "-i", video_path,
        "-vcodec", "libx264", "-crf", "23", "-preset", "veryfast",
        "-acodec", "aac", "-strict", "-2",
        output_path
      ]
    
      Open3.popen3(*cmd) do |_stdin, _stdout, stderr, wait_thr|
        unless wait_thr.value.success?
          puts "Error converting #{video_path}: #{stderr.read}"
        else
          desktop_path = File.expand_path("~/Desktop")
          backup_path = File.join(desktop_path, File.basename(video_path))
          FileUtils.mv(video_path, backup_path) if File.exist?(video_path)
        end
      end

      # Generate thumbnail image from video
      thumbnail_output = video_path.gsub(/\.(mov|m4v|avi)$/, '_thumb.jpg')

      unless File.exist?(thumbnail_output)
        puts "Generating thumbnail for #{output_path}"
        thumb_cmd = [
          "ffmpeg", "-i", output_path, "-ss", "00:00:01.000",
          "-vframes", "1", thumbnail_output
        ]

        Open3.popen3(*thumb_cmd) do |_stdin, _stdout, stderr, wait_thr|
          unless wait_thr.value.success?
            puts "Error generating thumbnail for #{output_path}: #{stderr.read}"
          end
        end
      end
    end

    # Process article images
    Dir.glob("source/articles/**/*.{jpg,jpeg,png}").each do |image_path|
      next if image_path.include?('_thumb') # Skip existing thumbnails
      next if image_path.end_with?('.webp') # Skip webp files
      
      # Create webp version
      webp_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '.webp')
      
      # Skip if webp already exists
      next if File.exist?(webp_path)
      
      puts "Converting article image to webp: #{image_path}"
      original = MiniMagick::Image.open(image_path)
      original.format 'webp'
      original.write webp_path
      
      # Backup original to desktop
      desktop_path = File.expand_path("~/Desktop")
      backup_path = File.join(desktop_path, File.basename(image_path))
      FileUtils.mv(image_path, backup_path) if File.exist?(image_path)
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
  blog.new_article_template = File.expand_path("source/article.tt", __dir__)

  # Enable pagination
  blog.paginate = true
  blog.per_page = 10
  blog.page_link = "page/{num}"

  blog.tag_template = "tag_template.html"
  blog.calendar_template = "calendar_template.html"
end

# SEO Configuration
set :url_root, 'https://jasoncypret.com'
activate :search_engine_sitemap
activate :meta_tags

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings
configure :build do
  activate :asset_hash
  activate :minify_css
  # activate :minify_javascript
  activate :relative_assets
  
  # Generate thumbnails during build
  after_build do |builder|
    require 'mini_magick'
    
    # Define thumbnail size (2x the display size for retina)
    thumbnail_size = "400x500"
    
    # Find all images in the companies directory
    Dir.glob("source/media/companies/**/*.{jpg,jpeg,png,webp}").each do |image_path|
      next if image_path.include?('_thumb') # Skip existing thumbnails
      
      # Generate thumbnail path
      thumbnail_path = image_path.gsub(/\.(jpg|jpeg|png|webp)$/, '_thumb\0')
      
      # Skip if thumbnail already exists
      next if File.exist?(thumbnail_path)
      
      # Create thumbnail
      puts "Generating thumbnail for #{image_path}"
      image = MiniMagick::Image.open(image_path)
      image.resize thumbnail_size
      image.quality 90 # Higher quality for thumbnails
      image.write thumbnail_path

      unless image_path.end_with?('.webp')
        webp_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '.webp')
        original = MiniMagick::Image.open(image_path)
        original.format 'webp'
        original.write webp_path
        desktop_path = File.expand_path("~/Desktop")
        backup_path = File.join(desktop_path, File.basename(image_path))
        FileUtils.mv(image_path, backup_path) if File.exist?(image_path)
      end
    end

    # Generate thumbnails for videos during build
    require 'open3'

    Dir.glob("source/media/**/*.{mov,m4v,avi}").each do |video_path|
      output_path = video_path.gsub(/\.(mov|m4v|avi)$/, ".mp4")
      
      # Skip if already exists
      next if File.exist?(output_path)
    
      puts "Converting #{video_path} to MP4..."
      cmd = [
        "ffmpeg", "-i", video_path,
        "-vcodec", "libx264", "-crf", "23", "-preset", "veryfast",
        "-acodec", "aac", "-strict", "-2",
        output_path
      ]
    
      Open3.popen3(*cmd) do |_stdin, _stdout, stderr, wait_thr|
        unless wait_thr.value.success?
          puts "Error converting #{video_path}: #{stderr.read}"
        else
          desktop_path = File.expand_path("~/Desktop")
          backup_path = File.join(desktop_path, File.basename(video_path))
          FileUtils.mv(video_path, backup_path) if File.exist?(video_path)
        end
      end

      # Generate thumbnail image from video
      thumbnail_output = video_path.gsub(/\.(mov|m4v|avi)$/, '_thumb.jpg')

      unless File.exist?(thumbnail_output)
        puts "Generating thumbnail for #{output_path}"
        thumb_cmd = [
          "ffmpeg", "-i", output_path, "-ss", "00:00:01.000",
          "-vframes", "1", thumbnail_output
        ]

        Open3.popen3(*thumb_cmd) do |_stdin, _stdout, stderr, wait_thr|
          unless wait_thr.value.success?
            puts "Error generating thumbnail for #{output_path}: #{stderr.read}"
          end
        end
      end
    end
  end

  # Copy video files to build/media directory while retaining structure
  after_build do |builder|
    Dir.glob("source/media/**/*.{mp4,webm,m4v,ogv}").each do |video_path|
      relative_path = video_path.sub(/^source\//, '')
      output_path = File.join("build", relative_path)
      FileUtils.mkdir_p(File.dirname(output_path))
      FileUtils.cp(video_path, output_path)
    end
  end
end

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end
