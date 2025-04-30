require 'middleman-gh-pages'
require 'fileutils'
require 'mini_magick'

namespace :images do
  desc "Convert images to webp and generate thumbnails"
  task :convert_to_webp, [:force] do |t, args|
    # Define thumbnail size
    thumbnail_size = "400x500"
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
      
      # Convert to webp
      puts "Converting #{image_path} to webp"
      image = MiniMagick::Image.open(image_path)
      image.format 'webp'
      image.write webp_path
      
      # Generate webp thumbnail
      puts "Generating thumbnail for #{webp_path}"
      image.resize thumbnail_size
      image.quality 90
      image.write webp_thumb_path
      
      # Remove original thumbnail if it exists
      File.delete(original_thumb_path) if File.exist?(original_thumb_path)
    end
  end

  desc "Generate thumbnails for gallery images"
  task :generate_thumbnails do
    # Define thumbnail size
    thumbnail_size = "300x300"
    
    # Find all images in the companies directory
    Dir.glob("source/media/companies/**/*.{jpg,jpeg,png}").each do |image_path|
      next if image_path.include?('_thumb') # Skip existing thumbnails
      
      # Generate thumbnail path
      thumbnail_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_thumb\0')
      
      # Skip if thumbnail already exists
      next if File.exist?(thumbnail_path)
      
      # Create thumbnail
      puts "Generating thumbnail for #{image_path}"
      image = MiniMagick::Image.open(image_path)
      image.resize thumbnail_size
      image.write thumbnail_path
    end
  end

  desc "Regenerate all thumbnails for gallery images"
  task :regenerate_thumbnails do
    # Define thumbnail size (2x the display size for retina)
    thumbnail_size = "400x500"
    
    # Find all images in the companies directory
    Dir.glob("source/media/companies/**/*.{jpg,jpeg,png}").each do |image_path|
      # Skip if not an original image
      next if image_path.include?('_thumb')
      
      # Generate thumbnail path
      thumbnail_path = image_path.gsub(/\.(jpg|jpeg|png)$/, '_thumb\0')
      
      # Remove existing thumbnail if it exists
      File.delete(thumbnail_path) if File.exist?(thumbnail_path)
      
      # Create new thumbnail
      puts "Regenerating thumbnail for #{image_path}"
      image = MiniMagick::Image.open(image_path)
      image.resize thumbnail_size
      image.quality 90 # Higher quality for thumbnails
      image.write thumbnail_path
    end
  end
end