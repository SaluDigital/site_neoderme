/* ═══════════════════════════════════════════════════════════════════════════
   Neoderme – Script.js
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── HEADER – Scroll + menu-open state ─────────────────────────────────── */
  const header     = document.getElementById('header');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function updateHeader () {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ─── MOBILE MENU ────────────────────────────────────────────────────────── */
  function openMenu () {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.classList.add('is-active');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    header.classList.add('menu-open');
    document.body.classList.add('no-scroll');
  }

  function closeMenu () {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('is-active');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    header.classList.remove('menu-open');
    document.body.classList.remove('no-scroll');
  }

  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Fechar ao clicar em link
  mobileMenu.querySelectorAll('.mobile-nav__link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Fechar com Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  /* ─── HERO SLIDER ────────────────────────────────────────────────────────── */
  const slides      = document.querySelectorAll('.hero__slide');
  const dots        = document.querySelectorAll('.hero__dot');
  const counterCur  = document.querySelector('.hero__counter-cur');
  const SLIDE_DELAY = 6500;

  let currentSlide  = 0;
  let sliderTimer   = null;
  let isTransitioning = false;

  function pad (n) { return n < 10 ? '0' + n : String(n); }

  function goToSlide (index) {
    if (isTransitioning || index === currentSlide) return;
    isTransitioning = true;

    // Remove active
    slides[currentSlide].classList.remove('is-active');
    dots[currentSlide].classList.remove('is-active');

    currentSlide = (index + slides.length) % slides.length;

    // Add active
    slides[currentSlide].classList.add('is-active');
    dots[currentSlide].classList.add('is-active');

    if (counterCur) counterCur.textContent = pad(currentSlide + 1);

    // Parallax reset
    resetParallax();

    setTimeout(function () { isTransitioning = false; }, 900);
  }

  function nextSlide () {
    goToSlide(currentSlide + 1);
  }

  function startAutoplay () {
    stopAutoplay();
    sliderTimer = setInterval(nextSlide, SLIDE_DELAY);
  }

  function stopAutoplay () {
    if (sliderTimer) clearInterval(sliderTimer);
  }

  // Dots
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const target = parseInt(dot.getAttribute('data-target'), 10);
      goToSlide(target);
      startAutoplay(); // Reinicia timer ao clicar
    });
  });

  // Pausa ao hover no hero
  var heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);
  }

  // Suporte a swipe mobile
  var touchStartX = 0;
  var touchEndX   = 0;

  document.querySelector('.hero__track').addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.querySelector('.hero__track').addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
      startAutoplay();
    }
  }, { passive: true });

  startAutoplay();

  /* ─── PARALLAX SUAVE (hero bg) ──────────────────────────────────────────── */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resetParallax () {
    slides.forEach(function (slide) {
      var bg = slide.querySelector('.hero__bg');
      if (bg) bg.style.transform = '';
    });
  }

  function handleParallax () {
    if (prefersReduced) return;
    var scrollY = window.pageYOffset;
    var heroH   = heroSection ? heroSection.offsetHeight : 0;
    if (scrollY > heroH) return;

    var activeBg = slides[currentSlide] ? slides[currentSlide].querySelector('.hero__bg') : null;
    if (activeBg) {
      activeBg.style.transform = 'translateY(' + (scrollY * 0.28) + 'px)';
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  /* ─── SCROLL SUAVE PARA ÂNCORAS ─────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var headerH = header ? header.offsetHeight : 0;
      var targetY = target.getBoundingClientRect().top + window.pageYOffset - headerH;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  /* ─── ANIMAÇÕES ON-SCROLL (IntersectionObserver) ────────────────────────── */
  if ('IntersectionObserver' in window) {

    var animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animObserver.unobserve(entry.target); // Anima apenas 1x
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('[data-animate]').forEach(function (el) {
      animObserver.observe(el);
    });

  } else {
    // Fallback: mostra tudo sem animação
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ─── HOVER MICROINTERAÇÕES – treatment cards ───────────────────────────── */
  document.querySelectorAll('.t-card').forEach(function (card) {
    // Acessibilidade por teclado: Enter / Space ativa link/âncora
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var link = card.querySelector('a');
        if (link) link.click();
        else window.location.href = '#contato';
      }
    });
  });

  /* ─── GALLERY – hover zoom já feito via CSS, nada extra necessário ───────── */

  /* ─── ACTIVE NAV LINK ao rolar ─────────────────────────────────────────── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('is-current', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(function (s) { sectionObserver.observe(s); });

  /* ─── LAZY LOADING de imagens ───────────────────────────────────────────── */
  // Nativo — HTML já usa loading="lazy"
  // Suporte adicional para browsers antigos via IntersectionObserver
  if (!('loading' in HTMLImageElement.prototype) && 'IntersectionObserver' in window) {
    var lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    var lazyObs  = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.dataset.src || img.src;
          lazyObs.unobserve(img);
        }
      });
    });
    lazyImgs.forEach(function (img) { lazyObs.observe(img); });
  }

  var diffSection = document.querySelector('.differentials');
  if (diffSection && !prefersReduced) {
    function updateDiffParallax () {
      var rect = diffSection.getBoundingClientRect();
      var viewportH = window.innerHeight || document.documentElement.clientHeight;

      if (rect.bottom < 0 || rect.top > viewportH) return;

      var sectionCenter = rect.top + (rect.height / 2);
      var viewportCenter = viewportH / 2;
      var offset = (sectionCenter - viewportCenter) * -0.08;

      diffSection.style.setProperty('--diff-parallax', offset.toFixed(1) + 'px');
    }

    window.addEventListener('scroll', updateDiffParallax, { passive: true });
    window.addEventListener('resize', updateDiffParallax);
    updateDiffParallax();
  }

  var photoCarousel = document.querySelector('.photo-carousel');
  var photoTrack = document.querySelector('.photo-carousel__track');
  var photoPrev = document.querySelector('.photo-carousel__arrow--prev');
  var photoNext = document.querySelector('.photo-carousel__arrow--next');

  if (photoCarousel && photoTrack && photoPrev && photoNext) {
    var photoSlides = Array.prototype.slice.call(photoTrack.querySelectorAll('.photo-carousel__slide'));
    var photoIndex = 0;
    var photoTimer = null;
    var PHOTO_DELAY = 3600;

    function loopPhotoIndex (index) {
      return (index + photoSlides.length) % photoSlides.length;
    }

    function renderPhotoCarousel () {
      if (!photoSlides.length) return;

      var visibleIndexes = [
        loopPhotoIndex(photoIndex - 1),
        loopPhotoIndex(photoIndex),
        loopPhotoIndex(photoIndex + 1)
      ];

      photoSlides.forEach(function (slide) {
        slide.classList.remove('is-visible', 'is-active');
        slide.setAttribute('aria-hidden', 'true');
      });

      visibleIndexes.forEach(function (slideIndex, position) {
        var slide = photoSlides[slideIndex];
        photoTrack.appendChild(slide);
        slide.classList.add('is-visible');
        slide.setAttribute('aria-hidden', 'false');

        if (position === 1) {
          slide.classList.add('is-active');
        }
      });
    }

    function goToPhoto (offset) {
      photoIndex = loopPhotoIndex(photoIndex + offset);
      renderPhotoCarousel();
    }

    function startPhotoAutoplay () {
      stopPhotoAutoplay();
      photoTimer = setInterval(function () {
        goToPhoto(1);
      }, PHOTO_DELAY);
    }

    function stopPhotoAutoplay () {
      if (photoTimer) clearInterval(photoTimer);
    }

    photoPrev.addEventListener('click', function () {
      goToPhoto(-1);
      startPhotoAutoplay();
    });

    photoNext.addEventListener('click', function () {
      goToPhoto(1);
      startPhotoAutoplay();
    });

    photoCarousel.addEventListener('mouseenter', stopPhotoAutoplay);
    photoCarousel.addEventListener('mouseleave', startPhotoAutoplay);
    photoCarousel.addEventListener('focusin', stopPhotoAutoplay);
    photoCarousel.addEventListener('focusout', startPhotoAutoplay);

    renderPhotoCarousel();
    startPhotoAutoplay();
  }

  var testCarousel = document.querySelector('.test__carousel');
  var testTrack = document.querySelector('.test__track');
  var testViewport = document.querySelector('.test__viewport');
  var testDotsWrap = document.querySelector('.test__dots');

  if (testCarousel && testTrack && testViewport && testDotsWrap) {
    var testCards = Array.prototype.slice.call(testTrack.querySelectorAll('.test-card'));
    var testIndex = 0;
    var testTimer = null;
    var TEST_DELAY = 4800;
    var testDots = [];

    function getCardsPerView () {
      if (window.innerWidth <= 868) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getPageCount () {
      return Math.max(1, Math.ceil(testCards.length / getCardsPerView()));
    }

    function renderTestDots () {
      var pages = getPageCount();
      testDotsWrap.innerHTML = '';
      testDots = [];

      for (var i = 0; i < pages; i += 1) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'test__dot' + (i === testIndex ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Ir para grupo de depoimentos ' + (i + 1));
        dot.addEventListener('click', (function (index) {
          return function () {
            testIndex = index;
            updateTestimonials();
            startTestimonialsAutoplay();
          };
        })(i));
        testDotsWrap.appendChild(dot);
        testDots.push(dot);
      }
    }

    function updateTestimonials () {
      var pages = getPageCount();
      var safeIndex = testIndex % pages;
      var offset = safeIndex * testViewport.clientWidth;

      testIndex = safeIndex;
      testTrack.style.transform = 'translateX(-' + offset + 'px)';

      testDots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === testIndex);
      });
    }

    function nextTestimonials () {
      testIndex = (testIndex + 1) % getPageCount();
      updateTestimonials();
    }

    function startTestimonialsAutoplay () {
      stopTestimonialsAutoplay();
      testTimer = setInterval(nextTestimonials, TEST_DELAY);
    }

    function stopTestimonialsAutoplay () {
      if (testTimer) clearInterval(testTimer);
    }

    renderTestDots();
    updateTestimonials();
    startTestimonialsAutoplay();

    testCarousel.addEventListener('mouseenter', stopTestimonialsAutoplay);
    testCarousel.addEventListener('mouseleave', startTestimonialsAutoplay);
    window.addEventListener('resize', function () {
      renderTestDots();
      updateTestimonials();
    });
  }

})();
