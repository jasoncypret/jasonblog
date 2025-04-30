loadSite();
function loadSite() {
  document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded");

    // Initialize video loading for stats masonry
    initializeStatsVideos();

    // Initialize lightbox for all gallery items
    const galleryItems = document.querySelectorAll(".gallery-item");
    console.log("Found gallery items:", galleryItems.length);

    if (galleryItems.length === 0) return;

    let currentGalleryItems = [];
    let currentIndex = 0;
    let scrollPosition = 0;
    const isMobile = window.innerWidth <= 768;

    // Create lightbox element
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML = `
    <div class="lightbox-content">
      <div class="lightbox-media-container">
        <img class="lightbox-image lazyload" src="" alt="">
        <video class="lightbox-video" playsinline>
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
    const prevButton = lightbox.querySelector(".lightbox-nav.prev");
    const nextButton = lightbox.querySelector(".lightbox-nav.next");
    const closeButton = lightbox.querySelector(".lightbox-close");

    // Helper functions
    function getTextContent(element) {
      return element ? element.textContent : null;
    }

    function getMediaType(element) {
      const src = element.getAttribute("data-lightbox") || element.src;
      return src.match(/\.(mp4|m4v|webm)$/i) ? "video" : "image";
    }

    function updateNavigation() {
      const showNav = currentGalleryItems.length > 1;
      prevButton.style.display = showNav ? "" : "none";
      nextButton.style.display = showNav ? "" : "none";
    }

    // Stats video loading management
    function initializeStatsVideos() {
      const videoContainers = document.querySelectorAll('.stats-item--video');
      
      if (!videoContainers.length) return;

      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const container = entry.target;
            const video = container.querySelector('video');
            const poster = container.querySelector('.video-poster');
            
            if (container.dataset.videoLoaded === 'false') {
              // Set up video
              video.muted = true;
              video.loop = true;
              video.autoplay = true;
              
              // Load and play video
              video.load();
              
              // Handle video loaded
              video.addEventListener('loadeddata', () => {
                container.dataset.videoLoaded = 'true';
                // Fade in video
                video.style.opacity = '1';
                // Fade out poster
                if (poster) {
                  poster.style.opacity = '0';
                  // Remove poster from DOM after transition
                  poster.addEventListener('transitionend', () => {
                    poster.style.display = 'none';
                  }, { once: true });
                }
                video.play().catch(err => {
                  console.warn('Auto-play failed:', err);
                  // Keep poster visible if autoplay fails
                  if (poster) {
                    poster.style.opacity = '1';
                    poster.style.display = 'block';
                    video.style.opacity = '0';
                  }
                });
              });
            } else if (video.paused) {
              video.play().catch(() => {});
            }
          } else {
            const video = entry.target.querySelector('video');
            if (video && !video.paused) {
              video.pause();
            }
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '50px'
      });

      videoContainers.forEach(container => {
        videoObserver.observe(container);
      });
    }

    // Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const preloadVideo = item.querySelector('.lightbox-video-preload');
          
          if (preloadVideo) {
            // Start preloading video when thumbnail is visible
            preloadVideo.preload = 'metadata';
          }
          
          observer.unobserve(item);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observe all gallery items
    galleryItems.forEach(item => {
      imageObserver.observe(item);
    });

    function showMedia(item) {
      const media = item.querySelector(".gallery-thumbnail");
      const titleElement = item.querySelector(".gallery-item-title");
      const descriptionElement = item.querySelector(".gallery-item-description");
      const title = getTextContent(titleElement);
      const description = getTextContent(descriptionElement);

      const lightboxImg = lightbox.querySelector(".lightbox-image");
      const lightboxVideo = lightbox.querySelector(".lightbox-video");
      const lightboxTitle = lightbox.querySelector(".lightbox-caption-title");
      const lightboxDescription = lightbox.querySelector(".lightbox-caption-description");

      const originalPath = media.getAttribute("data-lightbox");
      const mediaType = getMediaType(media);

      lightboxImg.style.display = "none";
      lightboxVideo.style.display = "none";

      if (mediaType === "video") {
        const videoSource = lightboxVideo.querySelector("source");
        const mobilePath = originalPath.replace('.mp4', '_mobile.mp4');
        
        // Use mobile version if on mobile device
        videoSource.src = isMobile ? mobilePath : originalPath;
        lightboxVideo.load();
        
        // Set video attributes based on device
        lightboxVideo.controls = true;
        lightboxVideo.autoplay = !isMobile; // Don't autoplay on mobile
        lightboxVideo.loop = !isMobile; // Don't loop on mobile
        lightboxVideo.muted = !isMobile; // Don't mute on mobile (better UX)
        
        lightboxVideo.style.display = "block";
      } else {
        const mobilePath = originalPath.replace(/\.(jpg|jpeg|png|webp)$/, '_mobile\$1');
        lightboxImg.src = isMobile ? mobilePath : originalPath;
        lightboxImg.alt = media.alt;
        if (window.lazySizes) {
          window.lazySizes.loader.unveil(lightboxImg);
        }
        lightboxImg.style.display = "block";
      }

      if (title) {
        lightboxTitle.textContent = title;
        lightboxTitle.style.display = "block";
      } else {
        lightboxTitle.style.display = "none";
      }

      if (description) {
        lightboxDescription.textContent = description;
        lightboxDescription.style.display = "block";
      } else {
        lightboxDescription.style.display = "none";
      }
    }

    function closeLightbox() {
      const lightboxVideo = lightbox.querySelector(".lightbox-video");

      if (lightboxVideo.style.display === "block") {
        lightboxVideo.pause();
        lightboxVideo.currentTime = 0;
      }

      lightbox.classList.remove("active");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollPosition);
    }

    // Add click handlers to gallery items
    galleryItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();

        scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        const grid = this.closest(".media-showcase-grid, .image-gallery");
        currentGalleryItems = Array.from(grid.querySelectorAll(".gallery-item"));
        currentIndex = currentGalleryItems.indexOf(this);

        showMedia(this);
        updateNavigation();
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.width = "100%";
      });
    });

    // Navigation handlers
    prevButton.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
      showMedia(currentGalleryItems[currentIndex]);
    });

    nextButton.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % currentGalleryItems.length;
      showMedia(currentGalleryItems[currentIndex]);
    });

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Handle keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;

      switch (e.key) {
        case "ArrowLeft":
          prevButton.click();
          break;
        case "ArrowRight":
          nextButton.click();
          break;
        case "Escape":
          closeLightbox();
          break;
      }
    });
  });
}

