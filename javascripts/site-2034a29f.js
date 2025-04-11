document.addEventListener("DOMContentLoaded", function() {
  // Carousel elements
  const carouselWrapper = document.querySelector('.carousel__wrapper');
  const slides = document.querySelectorAll('.carousel__slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const totalSlides = slides.length;
  let currentSlide = 0;
  let isTransitioning = false;
  let scrollPosition = 0;

  // Lightbox elements
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  // Initialize carousel
  function initCarousel() {
    // Set initial active slide
    slides[0].classList.add('active');
    slides[0].style.opacity = '1';
    
    // Add data-large attributes if not present
    slides.forEach(slide => {
      const img = slide.querySelector('img');
      if (img && !slide.hasAttribute('data-large')) {
        slide.setAttribute('data-large', img.src);
      }
    });
  }

  // Update slides with smooth transition
  function updateCarousel() {
    if (isTransitioning) return;
    isTransitioning = true;

    // Fade out current slide
    const currentActive = document.querySelector('.carousel__slide.active');
    if (currentActive) {
      currentActive.style.opacity = '0';
      setTimeout(() => {
        currentActive.classList.remove('active');
      }, 500);
    }

    // Fade in new slide
    slides[currentSlide].classList.add('active');
    setTimeout(() => {
      slides[currentSlide].style.opacity = '1';
      isTransitioning = false;
    }, 50);
  }

  // Next/Prev functionality with smooth transition
  function goToSlide(index) {
    if (isTransitioning) return;
    currentSlide = (index + totalSlides) % totalSlides;
    updateCarousel();
  }

  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));

  // Lightbox functionality
  function openLightbox(imgSrc) {
    // Store current scroll position
    scrollPosition = window.pageYOffset;
    
    // Prevent scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    
    // Open lightbox
    lightboxImg.src = imgSrc;
    lightbox.style.display = "flex";
  }

  function closeLightbox() {
    // Close lightbox
    lightbox.style.display = "none";
    
    // Restore scrolling
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    // window.scrollTo(0, scrollPosition);
  }

  // Open lightbox when clicking on slides
  slides.forEach(slide => {
    slide.addEventListener('click', function() {
      const largeImgSrc = this.getAttribute('data-large');
      if (largeImgSrc) {
        openLightbox(largeImgSrc);
      }
    });
  });

  // Close lightbox
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(event) {
    if (lightbox.style.display === "flex") {
      if (event.key === "Escape") {
        closeLightbox();
      }
    } else {
      if (event.key === "ArrowRight") {
        goToSlide(currentSlide + 1);
      } else if (event.key === "ArrowLeft") {
        goToSlide(currentSlide - 1);
      }
    }
  });

  // Initialize carousel
  initCarousel();
});