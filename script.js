/* ════════════════════════════════════════
   offgrid3d — script.js
   ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Ano no footer ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ═══════════════════════════════════════
     HEADER — scroll + nav ativo
     ═══════════════════════════════════════ */
  const header    = document.getElementById('header');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    /* sombra ao scrollar */
    header.classList.toggle('scrolled', window.scrollY > 20);

    /* destaca link ativo */
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
  }, { passive: true });


  /* ═══════════════════════════════════════
     MENU HAMBURGER
     ═══════════════════════════════════════ */
  const navToggle = document.getElementById('navToggle');
  const nav       = document.getElementById('nav');

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu de navegação');
  });

  /* fecha ao clicar num link */
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu de navegação');
    });
  });


  /* ═══════════════════════════════════════
     CAROUSEL
     ═══════════════════════════════════════ */
  const track    = document.getElementById('carouselTrack');
  const slides   = document.querySelectorAll('.carousel-slide');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');

  if (!track || slides.length === 0) return;

  const total       = slides.length;
  let current       = 0;
  let autoplayTimer = null;
  let isDragging    = false;
  let dragStart     = 0;

  /* calcula slides visíveis conforme largura */
  function getSlidesVisible() {
    if (window.innerWidth >= 1025) return 3;
    if (window.innerWidth >= 769)  return 2;
    return 1;
  }

  /* calcula largura de cada slide no track */
  function getSlideWidth() {
    const visible   = getSlidesVisible();
    const trackW    = track.parentElement.offsetWidth;
    const gapPx     = visible > 1 ? 16 : 0;    /* 1rem gap entre slides */
    return (trackW - gapPx * (visible - 1)) / visible;
  }

  /* máximo índice de scroll */
  function getMaxIndex() {
    return Math.max(0, total - getSlidesVisible());
  }

  /* ── redimensiona slides dinamicamente ── */
  function updateSlideWidths() {
    const w       = getSlideWidth();
    const visible = getSlidesVisible();
    const gapPx   = visible > 1 ? 16 : 0;
    slides.forEach(slide => {
      slide.style.flex       = `0 0 ${w}px`;
      slide.style.marginRight = `${gapPx}px`;
    });
    goTo(Math.min(current, getMaxIndex()), false);
  }

  /* ── navega para índice ── */
  function goTo(index, animate = true) {
    current = Math.max(0, Math.min(index, getMaxIndex()));
    const w      = getSlideWidth();
    const visible= getSlidesVisible();
    const gapPx  = visible > 1 ? 16 : 0;
    const offset = current * (w + gapPx);

    track.style.transition = animate ? 'transform .5s cubic-bezier(0.4,0,0.2,1)' : 'none';
    track.style.transform  = `translateX(-${offset}px)`;

    updateDots();
    updateAria();
  }

  /* ── dots ── */
  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= getMaxIndex(); i++) {
      const btn = document.createElement('button');
      btn.className   = 'dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Ir para produto ${i + 1}`);
      btn.addEventListener('click', () => { goTo(i); resetAutoplay(); });
      dotsWrap.appendChild(btn);
    }
    updateDots();
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll('.dot');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current);
    });
  }

  function updateAria() {
    slides.forEach((slide, i) => {
      const visible = getSlidesVisible();
      const inView  = i >= current && i < current + visible;
      slide.setAttribute('aria-hidden', !inView);
    });
  }

  /* ── autoplay ── */
  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      const next = current + 1 > getMaxIndex() ? 0 : current + 1;
      goTo(next);
    }, 4500);
  }
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  /* ── botões ── */
  prevBtn.addEventListener('click', () => {
    goTo(current === 0 ? getMaxIndex() : current - 1);
    resetAutoplay();
  });
  nextBtn.addEventListener('click', () => {
    goTo(current + 1 > getMaxIndex() ? 0 : current + 1);
    resetAutoplay();
  });

  /* ── teclado ── */
  document.addEventListener('keydown', e => {
    if (document.getElementById('lightbox') && !document.getElementById('lightbox').hidden) return;
    if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAutoplay(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); resetAutoplay(); }
  });

  /* ── swipe (toque e mouse) ── */
  function onDragStart(x) { isDragging = true; dragStart = x; }
  function onDragEnd(x) {
    if (!isDragging) return;
    isDragging = false;
    const diff = dragStart - x;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      resetAutoplay();
    }
  }

  track.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend',   e => onDragEnd(e.changedTouches[0].clientX), { passive: true });
  track.addEventListener('mousedown',  e => onDragStart(e.clientX));
  track.addEventListener('mouseup',    e => onDragEnd(e.clientX));
  track.addEventListener('mouseleave', e => { if (isDragging) onDragEnd(e.clientX); });

  /* pausa ao hover */
  track.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  track.addEventListener('mouseleave', () => { if (!isDragging) startAutoplay(); });

  /* ── inicializar ── */
  updateSlideWidths();
  buildDots();
  startAutoplay();

  /* rebuild ao redimensionar */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { updateSlideWidths(); buildDots(); }, 120);
  });


  /* ═══════════════════════════════════════
     LIGHTBOX
     ═══════════════════════════════════════ */
  const lightbox         = document.getElementById('lightbox');
  const lightboxImg      = document.getElementById('lightboxImg');
  const lightboxClose    = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lbPrev           = document.getElementById('lbPrev');
  const lbNext           = document.getElementById('lbNext');
  const lightboxCounter  = document.getElementById('lightboxCounter');

  const allImages = Array.from(slides).map(s => ({
    src: s.querySelector('img').src,
    alt: s.querySelector('img').alt,
  }));
  let lbIndex = 0;

  function openLightbox(index) {
    lbIndex = index;
    renderLightbox();
    lightbox.hidden = false;
    lightboxBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lightboxBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
  function renderLightbox() {
    lightboxImg.src = allImages[lbIndex].src;
    lightboxImg.alt = allImages[lbIndex].alt;
    lightboxCounter.textContent = `${lbIndex + 1} / ${allImages.length}`;
  }

  slides.forEach((slide, i) => {
    slide.querySelector('.slide-inner').addEventListener('click', () => openLightbox(i));
    slide.querySelector('.slide-inner').setAttribute('tabindex', '0');
    slide.querySelector('.slide-inner').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);

  lbPrev.addEventListener('click', () => {
    lbIndex = lbIndex === 0 ? allImages.length - 1 : lbIndex - 1;
    renderLightbox();
  });
  lbNext.addEventListener('click', () => {
    lbIndex = lbIndex === allImages.length - 1 ? 0 : lbIndex + 1;
    renderLightbox();
  });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  { lbIndex = lbIndex === 0 ? allImages.length - 1 : lbIndex - 1; renderLightbox(); }
    if (e.key === 'ArrowRight') { lbIndex = lbIndex === allImages.length - 1 ? 0 : lbIndex + 1; renderLightbox(); }
  });


  /* ═══════════════════════════════════════
     REVEAL ON SCROLL
     ═══════════════════════════════════════ */
  const revealEls = document.querySelectorAll(
    '.feature-card, .step, .social-card, .section-header, .sobre-text, .sobre-features, .hero-stats'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

});
