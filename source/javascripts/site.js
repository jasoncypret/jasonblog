document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  // Only initialize if we have gallery items
  const galleryItems = document.querySelectorAll('.gallery-item');
  console.log('Found gallery items:', galleryItems.length);
  
  if (galleryItems.length === 0) return;

  // Create lightbox element
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  
  // Create lightbox content structure
  lightbox.innerHTML = '<div class="lightbox-content">' +
    '<div class="lightbox-media-container">' +
    '<img class="lightbox-image lazyload" src="" alt="">' +
    '<video class="lightbox-video" controls autoplay loop playsinline>' +
    '<source src="" type="video/mp4">' +
    'Your browser does not support the video tag.' +
    '</video>' +
    '</div>' +
    '<h3 class="lightbox-title"></h3>' +
    '<p class="lightbox-description"></p>' +
    '</div>';
  
  document.body.appendChild(lightbox);
  console.log('Created lightbox element');

  // Helper function to safely get text content
  function getTextContent(element) {
    return element ? element.textContent : null;
  }

  // Helper function to get media type
  function getMediaType(element) {
    const src = element.getAttribute('data-lightbox') || element.src;
    return src.match(/\.(mp4|m4v|webm)$/i) ? 'video' : 'image';
  }

  // Add click handlers to gallery items
  Array.prototype.forEach.call(galleryItems, function(item) {
    item.addEventListener('click', function() {
      const media = this.querySelector('.gallery-thumbnail');
      const titleElement = this.querySelector('.gallery-item-title');
      const descriptionElement = this.querySelector('.gallery-item-description');
      const title = getTextContent(titleElement);
      const description = getTextContent(descriptionElement);
      
      const lightboxImg = lightbox.querySelector('.lightbox-image');
      const lightboxVideo = lightbox.querySelector('.lightbox-video');
      const lightboxTitle = lightbox.querySelector('.lightbox-title');
      const lightboxDescription = lightbox.querySelector('.lightbox-description');
      
      // Get the original media path from the data attribute
      const originalPath = media.getAttribute('data-lightbox');
      const mediaType = getMediaType(media);
      
      // Hide both media elements first
      lightboxImg.style.display = 'none';
      lightboxVideo.style.display = 'none';
      
      if (mediaType === 'video') {
        // Handle video
        lightboxVideo.querySelector('source').src = originalPath || media.src;
        lightboxVideo.load(); // Reload the video
        lightboxVideo.style.display = 'block';
      } else {
        // Handle image
        lightboxImg.src = originalPath || media.src;
        lightboxImg.alt = media.alt;
        lightboxImg.classList.add('lazyload');
        if (window.lazySizes) {
          window.lazySizes.loader.unveil(lightboxImg);
        }
        lightboxImg.style.display = 'block';
      }
      
      if (title) {
        lightboxTitle.textContent = title;
        lightboxTitle.style.display = 'block';
      } else {
        lightboxTitle.style.display = 'none';
      }
      
      if (description) {
        lightboxDescription.textContent = description;
        lightboxDescription.style.display = 'block';
      } else {
        lightboxDescription.style.display = 'none';
      }
      
      lightbox.classList.add('active');
    });
  });

  // Add click handler to lightbox
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      const lightboxImg = lightbox.querySelector('.lightbox-image');
      const lightboxVideo = lightbox.querySelector('.lightbox-video');
      
      // Pause video if playing
      if (lightboxVideo.style.display === 'block') {
        lightboxVideo.pause();
      }
      
      // Remove lazyload class when closing
      lightboxImg.classList.remove('lazyload', 'lazyloaded', 'ls-is-cached');
      lightbox.classList.remove('active');
    }
  });

  // Add keyboard handler for escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      const lightboxImg = lightbox.querySelector('.lightbox-image');
      const lightboxVideo = lightbox.querySelector('.lightbox-video');
      
      // Pause video if playing
      if (lightboxVideo.style.display === 'block') {
        lightboxVideo.pause();
      }
      
      // Remove lazyload class when closing with escape
      lightboxImg.classList.remove('lazyload', 'lazyloaded', 'ls-is-cached');
      lightbox.classList.remove('active');
    }
  });
}); 