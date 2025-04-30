require 'middleman-gh-pages'
require 'fileutils'
require 'mini_magick'

namespace :images do
  desc "Convert images to webp and generate thumbnails"
  task :convert_to_webp, [:force] do |t, args|
    # Define thumbnail size (increased width for better quality)
    thumbnail_size = "600x500"
    force = args[:force] == 'true'
    
    # Find all images in the companies directory
    Dir.glob("source/media/companies/**/*.{jpg,jpeg,png}").each do |image_path|
      # Skip thumbnails and webp files
      next if image_path.include?('_thumb') || image_path.end_with?('.webp')
      
      # Generate webp path
      webp_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '.webp')
      
      # Generate thumbnail paths
      original_thumb_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_thumb\0')
      webp_thumb_path = webp_path.gsub(/\.webp$/, '_thumb.webp')
      
      # Skip if webp and thumbnail exist and not forcing
      if !force && File.exist?(webp_path) && File.exist?(webp_thumb_path)
        puts "Skipping #{image_path} - already converted"
        next
      end
      
      # Convert to webp with high quality
      puts "Converting #{image_path} to webp"
      image = MiniMagick::Image.open(image_path)
      image.format 'webp'
      image.quality 95  # Increased quality for main webp
      image.write webp_path
      
      # Generate webp thumbnail with high quality
      puts "Generating thumbnail for #{webp_path}"
      image.resize thumbnail_size + '^'  # ^ ensures minimum size while maintaining aspect ratio
      image.gravity 'center'
      image.extent thumbnail_size  # Crop to exact size from center
      image.quality 95  # Increased quality for thumbnail
      image.write webp_thumb_path
      
      # Remove original thumbnail if it exists
      File.delete(original_thumb_path) if File.exist?(original_thumb_path)
    end

    # Generate thumbnails for videos
    Dir.glob("source/media/companies/**/*.mp4").each do |video_path|
      next if video_path.include?('_thumb') # Skip existing thumbnails
      
      # Generate thumbnail path
      thumbnail_path = video_path.gsub(/\.mp4$/, '_thumb.webp')
      
      # Skip if thumbnail exists and not forcing
      if !force && File.exist?(thumbnail_path)
        puts "Skipping #{video_path} - thumbnail exists"
        next
      end
      
      # Create high-quality thumbnail from video
      puts "Generating thumbnail for #{video_path}"
      # Using higher quality settings:
      # -q:v 1 = highest quality (range is 1-31, lower is better)
      # -qscale:v 1 = highest quality for the frame extraction
      # -vf scale with high-quality lanczos scaling
      system("ffmpeg -i #{video_path} -ss 00:00:01 -vframes 1 -vf \"scale=#{thumbnail_size}:force_original_aspect_ratio=decrease,format=rgb24\" -sws_flags lanczos -q:v 1 -qscale:v 1 #{thumbnail_path}")
    end
  end

  desc "Generate thumbnails for gallery images"
  task :generate_thumbnails do
    # Define thumbnail size
    thumbnail_size = "600x500"
    
    # Find all images in the companies directory
    Dir.glob("source/media/companies/**/*.{jpg,jpeg,png}").each do |image_path|
      next if image_path.include?('_thumb') # Skip existing thumbnails
      
      # Generate thumbnail path
      thumbnail_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_thumb\0')
      
      # Skip if thumbnail already exists
      next if File.exist?(thumbnail_path)
      
      # Create high-quality thumbnail
      puts "Generating thumbnail for #{image_path}"
      image = MiniMagick::Image.open(image_path)
      image.resize thumbnail_size + '^'
      image.gravity 'center'
      image.extent thumbnail_size
      image.quality 95
      image.write thumbnail_path
    end
  end

  desc "Regenerate all thumbnails for gallery images"
  task :regenerate_thumbnails do
    # Define thumbnail size
    thumbnail_size = "600x500"
    
    # Find all images in the companies directory
    Dir.glob("source/media/companies/**/*.{jpg,jpeg,png}").each do |image_path|
      # Skip if not an original image
      next if image_path.include?('_thumb')
      
      # Generate thumbnail path
      thumbnail_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_thumb\0')
      
      # Remove existing thumbnail if it exists
      File.delete(thumbnail_path) if File.exist?(thumbnail_path)
      
      # Create new high-quality thumbnail
      puts "Regenerating thumbnail for #{image_path}"
      image = MiniMagick::Image.open(image_path)
      image.resize thumbnail_size + '^'
      image.gravity 'center'
      image.extent thumbnail_size
      image.quality 95
      image.write thumbnail_path
    end
  end
end