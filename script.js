(() => {
  const doc = document.documentElement;
  const body = document.body;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const translations = {
    smartSystems: { en: ['smart systems.', 'live dashboards.', 'event machines.', 'workflow clarity.', 'operational control.'], ar: ['أنظمة ذكية.', 'داشبورد مباشرة.', 'فعاليات منظمة.', 'وضوح تشغيلي.', 'تحكم كامل.'] }
  };

  window.addEventListener('load', () => {
    $('.preloader')?.classList.add('done');
  });

  $('#year').textContent = new Date().getFullYear();

  const cursor = $('.cursor-glow');
  window.addEventListener('pointermove', (e) => {
    if (!cursor) return;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, { passive: true });

  const header = $('.site-header');
  const progress = $('.progress span');
  const sections = $$('section[id]');
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = max > 0 ? (y / max * 100) + '%' : '0%';
    let current = '';
    sections.forEach(section => {
      if (y >= section.offsetTop - 140) current = section.id;
    });
    $$('.desktop-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuToggle = $('.menu-toggle');
  const mobilePanel = $('.mobile-panel');
  menuToggle?.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    mobilePanel.classList.toggle('open');
    mobilePanel.setAttribute('aria-hidden', mobilePanel.classList.contains('open') ? 'false' : 'true');
  });
  $$('.mobile-panel a').forEach(a => a.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    mobilePanel.classList.remove('open');
    mobilePanel.setAttribute('aria-hidden', 'true');
  }));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  $$('[data-reveal]').forEach(el => revealObserver.observe(el));

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: .55 });
  $$('.counter').forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1450;
    const start = performance.now();
    const formatter = new Intl.NumberFormat(currentLang === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatter.format(target * eased);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = formatter.format(target);
    }
    requestAnimationFrame(frame);
  }

  let currentLang = localStorage.getItem('portfolio-lang') || 'en';
  const langToggle = $('#langToggle');
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('portfolio-lang', lang);
    doc.lang = lang;
    body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    doc.dir = body.dir;
    $$('[data-en][data-ar]').forEach(el => {
      const val = el.dataset[lang];
      if (typeof val === 'string') el.textContent = val;
    });
    langToggle.textContent = lang === 'ar' ? 'EN' : 'AR';
    setTypewriterWords();
  }

  let typeIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let typeTimer;
  const typeTarget = $('.type-target');
  let words = translations.smartSystems.en;
  function setTypewriterWords() {
    words = translations.smartSystems[currentLang];
    typeIndex = 0;
    charIndex = 0;
    deleting = false;
    if (typeTimer) clearTimeout(typeTimer);
    typeLoop();
  }
  function typeLoop() {
    if (!typeTarget) return;
    const word = words[typeIndex % words.length];
    if (!deleting) {
      charIndex++;
      typeTarget.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        deleting = true;
        typeTimer = setTimeout(typeLoop, 1300);
        return;
      }
    } else {
      charIndex--;
      typeTarget.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        typeIndex++;
      }
    }
    typeTimer = setTimeout(typeLoop, deleting ? 36 : 70);
  }
  langToggle?.addEventListener('click', () => applyLang(currentLang === 'en' ? 'ar' : 'en'));
  applyLang(currentLang);

  const themeToggle = $('#themeToggle');
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') body.classList.add('light-theme');
  themeToggle.querySelector('span').textContent = body.classList.contains('light-theme') ? '☀' : '☾';
  themeToggle?.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    localStorage.setItem('portfolio-theme', body.classList.contains('light-theme') ? 'light' : 'dark');
    themeToggle.querySelector('span').textContent = body.classList.contains('light-theme') ? '☀' : '☾';
  });

  const filters = $$('.work-filters .filter');
  const cards = $$('.erp-gallery .screen-card');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const cats = (card.dataset.category || '').split(' ');
      card.classList.toggle('is-hidden', filter !== 'all' && !cats.includes(filter));
    });
  }));

  const eventFilters = $$('.event-filter');
  const eventCards = $$('.external-event-card');
  const eventGrid = $('.social-events-grid');
  let activeEventFilter = '';
  function applyEventFilter(filter) {
    activeEventFilter = activeEventFilter === filter ? '' : filter;
    eventFilters.forEach(btn => {
      const isActive = btn.dataset.eventFilter === activeEventFilter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    eventGrid?.classList.toggle('has-active-filter', Boolean(activeEventFilter));
    eventCards.forEach(card => {
      const categories = (card.dataset.eventCategory || '').split(' ');
      const matches = activeEventFilter && categories.includes(activeEventFilter);
      card.classList.toggle('is-active-category', Boolean(matches));
      card.classList.toggle('is-muted-category', Boolean(activeEventFilter && !matches));
    });
  }
  eventFilters.forEach(btn => btn.addEventListener('click', () => applyEventFilter(btn.dataset.eventFilter)));


  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox img');
  const lightboxCaption = $('#lightbox p');
  function openLightbox(src, caption, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || caption || '';
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 180);
  }
  $$('.screen-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = $('img', card);
      openLightbox(card.dataset.src || img.src, card.dataset.caption || $('h3,strong', card)?.textContent || '', img.alt);
    });
  });
  $('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - .5) * -9;
    const ry = ((x / rect.width) - .5) * 9;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  }
  $$('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', e => applyTilt(card, e));
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) * .16;
      const dy = (e.clientY - rect.top - rect.height / 2) * .16;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  const canvas = $('#particles');
  const ctx = canvas?.getContext('2d');
  let particles = [];
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = innerWidth < 700 ? 34 : 68;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - .5) * .42,
      vy: (Math.random() - .5) * .42,
      r: Math.random() * 2 + 1
    }));
  }
  function drawParticles() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,173,77,.42)';
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 125) {
          ctx.strokeStyle = `rgba(255,107,34,${(1 - dist / 125) * .15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(drawParticles);
  }
  if (canvas && ctx && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resizeCanvas();
    drawParticles();
    window.addEventListener('resize', resizeCanvas, { passive: true });
  }
})();
