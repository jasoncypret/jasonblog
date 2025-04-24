document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  // Only initialize if we have gallery items
  const galleryItems = document.querySelectorAll('.gallery-item');
  console.log('Found gallery items:', galleryItems.length);
  
  if (galleryItems.length === 0) return;

  let currentGalleryItems = [];
  let currentIndex = 0;

  // Create lightbox element
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  
  // Create lightbox content structure with navigation
  lightbox.innerHTML = '<div class="lightbox-content">' +
    '<button class="lightbox-nav prev" aria-label="Previous image">' +
    '<i class="icon-arrow-left"></i>' +
    '</button>' +
    '<div class="lightbox-media-container">' +
    '<img class="lightbox-image lazyload" src="" alt="">' +
    '<video class="lightbox-video" controls autoplay loop playsinline>' +
    '<source src="" type="video/mp4">' +
    'Your browser does not support the video tag.' +
    '</video>' +
    '</div>' +
    '<button class="lightbox-nav next" aria-label="Next image">' +
    '<i class="icon-arrow-right"></i>' +
    '</button>' +
    '<button class="lightbox-close" aria-label="Close modal">' +
    '<i class="icon-angle-left"></i>' +
    '</button>' +
    '<div class="lightbox-caption">' +
    '<h3 class="lightbox-title"></h3>' +
    '<p class="lightbox-description"></p>' +
    '</div>' +
    '</div>';
  
  // Store the current scroll position
  let scrollPosition = 0;
  
  // Add lightbox to body
  document.body.appendChild(lightbox);
  console.log('Created lightbox element');

  // Get navigation elements
  const prevButton = lightbox.querySelector('.lightbox-nav.prev');
  const nextButton = lightbox.querySelector('.lightbox-nav.next');
  const closeButton = lightbox.querySelector('.lightbox-close');

  // Helper function to safely get text content
  function getTextContent(element) {
    return element ? element.textContent : null;
  }

  // Helper function to get media type
  function getMediaType(element) {
    const src = element.getAttribute('data-lightbox') || element.src;
    return src.match(/\.(mp4|m4v|webm)$/i) ? 'video' : 'image';
  }

  // Helper function to update navigation visibility
  function updateNavigation() {
    const showNav = currentGalleryItems.length > 1;
    prevButton.style.display = showNav ? '' : 'none';
    nextButton.style.display = showNav ? '' : 'none';
  }

  // Helper function to show media in lightbox
  function showMedia(item) {
    const media = item.querySelector('.gallery-thumbnail');
    const titleElement = item.querySelector('.gallery-item-title');
    const descriptionElement = item.querySelector('.gallery-item-description');
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
  }

  // Helper function to close lightbox
  function closeLightbox() {
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxVideo = lightbox.querySelector('.lightbox-video');
    
    // Pause video if playing
    if (lightboxVideo.style.display === 'block') {
      lightboxVideo.pause();
    }
    
    // Remove lazyload class when closing
    lightboxImg.classList.remove('lazyload', 'lazyloaded', 'ls-is-cached');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
  }

  // Add click handlers to gallery items
  Array.prototype.forEach.call(galleryItems, function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Store current scroll position
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      // Get all items in the same grid
      const grid = this.closest('.media-showcase-grid');
      currentGalleryItems = Array.from(grid.querySelectorAll('.gallery-item'));
      currentIndex = currentGalleryItems.indexOf(this);
      
      showMedia(this);
      updateNavigation();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = '100%';
    });
  });

  // Navigation handlers
  prevButton.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
    showMedia(currentGalleryItems[currentIndex]);
  });

  nextButton.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % currentGalleryItems.length;
    showMedia(currentGalleryItems[currentIndex]);
  });

  // Close button handler
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  // Add click handler to lightbox overlay
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Prevent closing when clicking content
  lightbox.querySelector('.lightbox-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Add keyboard handler for navigation and escape
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;

    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevButton.click();
        break;
      case 'ArrowRight':
        nextButton.click();
        break;
    }
  });
}); 