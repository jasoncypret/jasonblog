document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  // Initialize lightbox for all gallery items
  const galleryItems = document.querySelectorAll('.gallery-item');
  console.log('Found gallery items:', galleryItems.length);
  
  if (galleryItems.length === 0) return;

  let currentGalleryItems = [];
  let currentIndex = 0;
  let scrollPosition = 0;

  // Create lightbox element
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <div class="lightbox-media-container">
        <img class="lightbox-image lazyload" src="" alt="">
        <video class="lightbox-video" controls autoplay loop playsinline>
          <source src="" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
      <div class="lightbox-caption">
        <h3 class="lightbox-caption-title"></h3>
        <p class="lightbox-caption-description"></p>
      </div>
    </div>
    <button class="lightbox-nav prev" aria-label="Previous image">
      <i class="icon-arrow-left"></i>
    </button>
    <button class="lightbox-nav next" aria-label="Next image">
      <i class="icon-arrow-right"></i>
    </button>
    <button class="lightbox-close" aria-label="Close modal">
      <i class="icon-angle-left"></i>
    </button>
  `;
  document.body.appendChild(lightbox);

  // Get navigation elements
  const prevButton = lightbox.querySelector('.lightbox-nav.prev');
  const nextButton = lightbox.querySelector('.lightbox-nav.next');
  const closeButton = lightbox.querySelector('.lightbox-close');

  // Helper functions
  function getTextContent(element) {
    return element ? element.textContent : null;
  }

  function getMediaType(element) {
    const src = element.getAttribute('data-lightbox') || element.src;
    return src.match(/\.(mp4|m4v|webm)$/i) ? 'video' : 'image';
  }

  function updateNavigation() {
    const showNav = currentGalleryItems.length > 1;
    prevButton.style.display = showNav ? '' : 'none';
    nextButton.style.display = showNav ? '' : 'none';
  }

  function showMedia(item) {
    const media = item.querySelector('.gallery-thumbnail');
    const titleElement = item.querySelector('.gallery-item-title');
    const descriptionElement = item.querySelector('.gallery-item-description');
    const title = getTextContent(titleElement);
    const description = getTextContent(descriptionElement);
    
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxVideo = lightbox.querySelector('.lightbox-video');
    const lightboxTitle = lightbox.querySelector('.lightbox-caption-title');
    const lightboxDescription = lightbox.querySelector('.lightbox-caption-description');
    
    const originalPath = media.getAttribute('data-lightbox');
    const mediaType = getMediaType(media);
    
    lightboxImg.style.display = 'none';
    lightboxVideo.style.display = 'none';
    
    if (mediaType === 'video') {
      lightboxVideo.querySelector('source').src = originalPath || media.src;
      lightboxVideo.load();
      lightboxVideo.style.display = 'block';
    } else {
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

  function closeLightbox() {
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxVideo = lightbox.querySelector('.lightbox-video');
    
    if (lightboxVideo.style.display === 'block') {
      lightboxVideo.pause();
    }
    
    lightboxImg.classList.remove('lazyload', 'lazyloaded', 'ls-is-cached');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
  }

  // Add click handlers to gallery items
  galleryItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      const grid = this.closest('.media-showcase-grid, .image-gallery');
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