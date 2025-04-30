require 'middleman-gh-pages'
require 'fileutils'
require 'mini_magick'

namespace :images do
  desc "Convert images to webp and generate thumbnails"
  task :convert_to_webp, [:force] do |t, args|
    # Define sizes
    sizes = {
      mobile: "300x300",
      desktop: "600x500"
    }
    force = args[:force] == 'true'
    
    # Find all images in the companies directory
    Dir.glob("source/media/companies/**/*.{jpg,jpeg,png}").each do |image_path|
      # Skip thumbnails and webp files
      next if image_path.include?('_thumb') || image_path.include?('_mobile') || image_path.end_with?('.webp')
      
      # Generate paths
      webp_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '.webp')
      mobile_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_mobile\0')
      mobile_webp_path = mobile_path.gsub(/\.(jpg|jpeg|png)$/, '.webp')
      thumb_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_thumb\0')
      thumb_webp_path = thumb_path.gsub(/\.(jpg|jpeg|png)$/, '.webp')
      
      # Skip if all versions exist and not forcing
      if !force && File.exist?(webp_path) && File.exist?(mobile_path) && 
         File.exist?(mobile_webp_path) && File.exist?(thumb_webp_path)
        puts "Skipping #{image_path} - already converted"
        next
      end
      
      puts "Processing #{image_path}"
      image = MiniMagick::Image.open(image_path)
      
      # Generate mobile version
      puts "Generating mobile version"
      mobile = image.clone
      mobile.resize sizes[:mobile] + '^'
      mobile.gravity 'center'
      mobile.extent sizes[:mobile]
      mobile.quality 85  # Slightly lower quality for mobile
      FileUtils.mkdir_p(File.dirname(mobile_path))
      mobile.write(mobile_path) { |file| file.overwrite = true }
      mobile.format 'webp'
      FileUtils.mkdir_p(File.dirname(mobile_webp_path))
      mobile.write(mobile_webp_path) { |file| file.overwrite = true }
      
      # Generate desktop thumbnail
      puts "Generating desktop thumbnail"
      thumb = image.clone
      thumb.resize sizes[:desktop] + '^'
      thumb.gravity 'center'
      thumb.extent sizes[:desktop]
      thumb.quality 95
      thumb.format 'webp'
      FileUtils.mkdir_p(File.dirname(thumb_webp_path))
      thumb.write(thumb_webp_path) { |file| file.overwrite = true }
      
      # Convert original to webp
      puts "Converting to webp"
      image.format 'webp'
      image.quality 95
      FileUtils.mkdir_p(File.dirname(webp_path))
      image.write(webp_path) { |file| file.overwrite = true }
      
      # Remove original thumbnail if it exists
      File.delete(thumb_path) if File.exist?(thumb_path)
    end

    # Generate thumbnails and mobile versions for videos
    Dir.glob("source/media/companies/**/*.mp4").each do |video_path|
      next if video_path.include?('_thumb') || video_path.include?('_mobile')
      
      # Generate paths
      mobile_video_path = video_path.gsub('.mp4', '_mobile.mp4')
      thumbnail_path = video_path.gsub('.mp4', '_thumb.webp')
      mobile_thumb_path = video_path.gsub('.mp4', '_mobile.webp')
      
      # Skip if files exist and not forcing
      if !force && File.exist?(mobile_video_path) && File.exist?(thumbnail_path) && File.exist?(mobile_thumb_path)
        puts "Skipping #{video_path} - already converted"
        next
      end
      
      puts "Processing #{video_path}"
      
      # Ensure output directories exist
      FileUtils.mkdir_p(File.dirname(mobile_video_path))
      FileUtils.mkdir_p(File.dirname(thumbnail_path))
      FileUtils.mkdir_p(File.dirname(mobile_thumb_path))
      
      # Generate mobile video version (lower bitrate, smaller size)
      puts "Generating mobile video version"
      system("ffmpeg -y -i #{video_path} -vf scale='-2:720' -b:v 800k -maxrate 800k -bufsize 1600k -c:v libx264 -profile:v main -level:v 3.1 -movflags +faststart #{mobile_video_path}")
      
      # Generate thumbnails
      puts "Generating thumbnails"
      system("ffmpeg -y -i #{video_path} -ss 00:00:01 -vframes 1 -vf scale=#{sizes[:desktop]}:force_original_aspect_ratio=decrease,format=rgb24 -sws_flags lanczos -q:v 1 -qscale:v 1 #{thumbnail_path}")
      system("ffmpeg -y -i #{video_path} -ss 00:00:01 -vframes 1 -vf scale=#{sizes[:mobile]}:force_original_aspect_ratio=decrease,format=rgb24 -sws_flags lanczos -q:v 1 -qscale:v 1 #{mobile_thumb_path}")
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