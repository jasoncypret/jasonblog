const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sizes = {
  mobile: { width: 300, height: 300 },
  desktop: { width: 600, height: 500 }
};

async function processImage(imagePath, force = false) {
  // Skip thumbnails and webp files
  if (imagePath.includes('_thumb') || imagePath.includes('_mobile') || imagePath.endsWith('.webp')) {
    return;
  }

  const ext = path.extname(imagePath);
  const basePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
  const dir = path.dirname(imagePath);

  // Generate paths
  const webpPath = `${basePath}.webp`;
  const mobilePath = `${basePath}_mobile${ext}`;
  const mobileWebpPath = `${basePath}_mobile.webp`;
  const thumbPath = `${basePath}_thumb${ext}`;
  const thumbWebpPath = `${basePath}_thumb.webp`;

  // Skip if all versions exist and not forcing
  if (!force && 
      fs.existsSync(webpPath) && 
      fs.existsSync(mobilePath) && 
      fs.existsSync(mobileWebpPath) && 
      fs.existsSync(thumbWebpPath)) {
    console.log(`Skipping ${imagePath} - already converted`);
    return;
  }

  console.log(`Processing ${imagePath}`);
  
  try {
    const image = sharp(imagePath);

    // Generate mobile version
    console.log('Generating mobile version');
    await image
      .clone()
      .resize(sizes.mobile.width, sizes.mobile.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(mobilePath);

    await image
      .clone()
      .resize(sizes.mobile.width, sizes.mobile.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(mobileWebpPath);

    // Generate desktop thumbnail
    console.log('Generating desktop thumbnail');
    await image
      .clone()
      .resize(sizes.desktop.width, sizes.desktop.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 95 })
      .toFile(thumbWebpPath);

    // Convert original to webp
    console.log('Converting to webp');
    await image
      .webp({ quality: 95 })
      .toFile(webpPath);

    // Remove original thumbnail if it exists
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
    console.log(`Completed processing ${imagePath}`);
  } catch (err) {
    console.error(`Error processing ${imagePath}:`, err);
  }
}

function processVideo(videoPath, force = false) {
  // Skip thumbnails and mobile variants
  if (videoPath.includes('_thumb') || videoPath.includes('_mobile')) {
    return;
  }

  const basePath = videoPath.replace(/\.(mp4|mov|m4v|avi)$/i, '');
  const mobileVideoPath = `${basePath}_mobile.mp4`;
  const thumbnailPath = `${basePath}_thumb.webp`;
  const mobileThumbPath = `${basePath}_mobile.webp`;

  // Skip if files exist and not forcing
  if (!force && 
      fs.existsSync(mobileVideoPath) && 
      fs.existsSync(thumbnailPath) && 
      fs.existsSync(mobileThumbPath)) {
    console.log(`Skipping ${videoPath} - already converted`);
    return;
  }

  console.log(`Processing ${videoPath}`);

  // Generate mobile video version (lower bitrate, smaller size)
  console.log('Generating mobile video version');
  try {
    execSync(`ffmpeg -y -i "${videoPath}" -vf scale='-2:720' -b:v 800k -maxrate 800k -bufsize 1600k -c:v libx264 -profile:v main -level:v 3.1 -movflags +faststart "${mobileVideoPath}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error generating mobile video for ${videoPath}:`, err);
    return;
  }

  // Generate thumbnails
  console.log('Generating thumbnails');
  try {
    // Desktop thumbnail
    execSync(`ffmpeg -y -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf scale=${sizes.desktop.width}:${sizes.desktop.height}:force_original_aspect_ratio=decrease,format=rgb24 -sws_flags lanczos -q:v 1 -qscale:v 1 "${thumbnailPath}"`, { stdio: 'inherit' });
    
    // Mobile thumbnail
    execSync(`ffmpeg -y -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf scale=${sizes.mobile.width}:${sizes.mobile.height}:force_original_aspect_ratio=decrease,format=rgb24 -sws_flags lanczos -q:v 1 -qscale:v 1 "${mobileThumbPath}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error generating thumbnails for ${videoPath}:`, err);
  }
}

// Main execution
const force = process.argv.includes('--force') || process.argv.includes('-f');
const glob = require('glob');

// Process images
const imagePattern = path.join(process.cwd(), 'src/media/companies/**/*.{jpg,jpeg,png}');
const imageFiles = glob.sync(imagePattern, { absolute: true });

(async () => {
  for (const imagePath of imageFiles) {
    await processImage(imagePath, force);
  }

  // Process videos
  const videoPattern = path.join(process.cwd(), 'src/media/companies/**/*.mp4');
  const videoFiles = glob.sync(videoPattern, { absolute: true });

  for (const videoPath of videoFiles) {
    processVideo(videoPath, force);
  }

  console.log('Portfolio image processing complete!');
})();
