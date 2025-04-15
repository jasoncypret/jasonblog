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
    '<img class="lightbox-image lazyload" src="" alt="">' +
    '<h3 class="lightbox-title"></h3>' +
    '<p class="lightbox-description"></p>' +
    '</div>';
  
  document.body.appendChild(lightbox);
  console.log('Created lightbox element');

  // Helper function to safely get text content
  function getTextContent(element) {
    return element ? element.textContent : null;
  }

  // Add click handlers to gallery items
  Array.prototype.forEach.call(galleryItems, function(item) {
    item.addEventListener('click', function() {
      const img = this.querySelector('.gallery-thumbnail');
      const titleElement = this.querySelector('.gallery-item-title');
      const descriptionElement = this.querySelector('.gallery-item-description');
      const title = getTextContent(titleElement);
      const description = getTextContent(descriptionElement);
      
      const lightboxImg = lightbox.querySelector('.lightbox-image');
      const lightboxTitle = lightbox.querySelector('.lightbox-title');
      const lightboxDescription = lightbox.querySelector('.lightbox-description');
      
      // Get the original image path from the data attribute
      const originalPath = img.getAttribute('data-lightbox');
      if (originalPath) {
        lightboxImg.src = originalPath;
      } else {
        lightboxImg.src = img.src;
      }
      lightboxImg.alt = img.alt;
      
      // Add lazyload class and trigger the library
      lightboxImg.classList.add('lazyload');
      if (window.lazySizes) {
        window.lazySizes.loader.unveil(lightboxImg);
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
      // Remove lazyload class when closing
      lightboxImg.classList.remove('lazyload', 'lazyloaded', 'ls-is-cached');
      lightbox.classList.remove('active');
    }
  });

  // Add keyboard handler for escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      const lightboxImg = lightbox.querySelector('.lightbox-image');
      // Remove lazyload class when closing with escape
      lightboxImg.classList.remove('lazyload', 'lazyloaded', 'ls-is-cached');
      lightbox.classList.remove('active');
    }
  });
}); 