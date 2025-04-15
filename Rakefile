require 'middleman-gh-pages'
require 'fileutils'
require 'mini_magick'

namespace :images do
  desc "Generate thumbnails for gallery images"
  task :generate_thumbnails do
    # Define thumbnail size
    thumbnail_size = "300x300"
    
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
      image.write thumbnail_path
    end
  end

  desc "Regenerate all thumbnails for gallery images"
  task :regenerate_thumbnails do
    # Define thumbnail size (2x the display size for retina)
    thumbnail_size = "400x500"
    
    # Find all images in the companies directory
    Dir.glob("source/images/companies/**/*.{jpg,jpeg,png}").each do |image_path|
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