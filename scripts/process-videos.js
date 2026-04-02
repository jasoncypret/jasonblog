const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

function processVideo(videoPath, force = false) {
  const ext = path.extname(videoPath);
  const basePath = videoPath.replace(/\.(mov|m4v|avi|mp4)$/i, '');
  const outputPath = `${basePath}.mp4`;
  const thumbnailPath = `${basePath}_thumb.jpg`;
  const mobileVideoPath = `${basePath}_mobile.mp4`;

  // Skip if already exists and not forcing
  if (!force && fs.existsSync(outputPath)) {
    console.log(`Skipping ${videoPath} - already converted`);
    return;
  }

  console.log(`Converting ${videoPath} to MP4...`);
  
  try {
    execSync(`ffmpeg -y -i "${videoPath}" -vcodec libx264 -crf 23 -preset veryfast -acodec aac -strict -2 "${outputPath}"`, { stdio: 'inherit' });
    
    // Generate thumbnail image from video
    if (!fs.existsSync(thumbnailPath)) {
      console.log(`Generating thumbnail for ${outputPath}`);
      execSync(`ffmpeg -y -i "${outputPath}" -ss 00:00:01.000 -vframes 1 "${thumbnailPath}"`, { stdio: 'inherit' });
    }

    // Generate mobile video variant
    if (!fs.existsSync(mobileVideoPath)) {
      console.log(`Generating mobile video variant for ${outputPath}`);
      execSync(`ffmpeg -y -i "${outputPath}" -vf scale='-2:720' -b:v 800k -maxrate 800k -bufsize 1600k -c:v libx264 -profile:v main -level:v 3.1 -movflags +faststart "${mobileVideoPath}"`, { stdio: 'inherit' });
    }

    console.log(`Completed processing ${videoPath}`);
  } catch (err) {
    console.error(`Error processing ${videoPath}:`, err);
  }
}

// Main execution
const force = process.argv.includes('--force') || process.argv.includes('-f');

// Find all video files
const videoPattern = path.join(process.cwd(), 'src/media/**/*.{mov,m4v,avi}');
const videoFiles = glob.sync(videoPattern, { absolute: true });

if (videoFiles.length === 0) {
  console.log('No video files found to process.');
  process.exit(0);
}

videoFiles.forEach(videoPath => {
  processVideo(videoPath, force);
});

console.log('Video processing complete!');
