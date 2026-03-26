// Hero loaded animation
window.addEventListener('load', () => {
  document.querySelector('.hero').classList.add('loaded');
});

// Nav scroll effect
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Menu tabs with aria-live announcement
const menuAnnounce = document.getElementById('menu-announce');
document.querySelectorAll('.menu-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.menu-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    panel.classList.add('active');
    if (menuAnnounce) menuAnnounce.textContent = tab.textContent + ' sélectionné';
  });
});

// Lightbox avec navigation prev/next
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const galerieItems    = Array.from(document.querySelectorAll('.galerie-item'));
let currentIndex      = 0;

function openLightbox(index) {
  currentIndex = index;
  const item = galerieItems[index];
  const img  = item.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = item.dataset.caption || '';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lightboxPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
  lightboxNext.style.visibility = index === galerieItems.length - 1 ? 'hidden' : 'visible';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

galerieItems.forEach((item, idx) => {
  item.addEventListener('click', () => openLightbox(idx));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); if (currentIndex > 0) openLightbox(currentIndex - 1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); if (currentIndex < galerieItems.length - 1) openLightbox(currentIndex + 1); });

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft'  && currentIndex > 0) openLightbox(currentIndex - 1);
  if (e.key === 'ArrowRight' && currentIndex < galerieItems.length - 1) openLightbox(currentIndex + 1);
});

// Reveal on scroll with stagger
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

// Subtle parallax on scroll — disabled if prefers-reduced-motion
const parallaxEls = document.querySelectorAll('[data-parallax]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax);
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }, { passive: true });
}

// ─────────────────────────────────────────────
// HORAIRES DYNAMIQUES — Statut ouvert / fermé
// Inclut les jours fériés français
// ─────────────────────────────────────────────
(function() {
  // Algorithme de Meeus/Jones/Butcher pour le calcul de Pâques
  function easterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 1=Jan
    const day   = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function isFrenchHoliday(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1; // 1-based
    const d = date.getDate();

    // Jours fériés fixes
    const fixed = [
      [1,  1],  // Jour de l'An
      [5,  1],  // Fête du Travail
      [5,  8],  // Victoire 1945
      [7,  14], // Fête Nationale
      [8,  15], // Assomption
      [11, 1],  // Toussaint
      [11, 11], // Armistice
      [12, 25], // Noël
    ];
    if (fixed.some(([fm, fd]) => m === fm && d === fd)) return true;

    // Jours fériés mobiles basés sur Pâques
    const easter = easterDate(y);
    const movable = [
      new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1),   // Lundi de Pâques
      new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 39),  // Ascension
      new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 50),  // Lundi de Pentecôte
    ];
    return movable.some(h => h.getFullYear() === y && h.getMonth() + 1 === m && h.getDate() === d);
  }

  // Schedule: Days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const schedule = {
    0: { lunch: [12, 14] },                         // Dimanche
    1: null,                                         // Lundi fermé
    2: { lunch: [12, 14], dinner: [19, 22] },        // Mardi
    3: { lunch: [12, 14] },                          // Mercredi
    4: { lunch: [12, 14], dinner: [19, 22] },        // Jeudi
    5: { lunch: [12, 14], dinner: [19, 22] },        // Vendredi
    6: { dinner: [19, 22] },                         // Samedi
  };

  const badge = document.getElementById('statut-horaires');
  if (!badge) return;

  const now = new Date();
  const day  = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;

  // Fermé les jours fériés
  const todaySchedule = isFrenchHoliday(now) ? null : schedule[day];

  let isOpen  = false;
  let nextMsg = '';

  if (todaySchedule) {
    const { lunch, dinner } = todaySchedule;
    if (lunch  && hour >= lunch[0]  && hour < lunch[1])  isOpen = true;
    if (dinner && hour >= dinner[0] && hour < dinner[1]) isOpen = true;

    if (!isOpen) {
      if (lunch && hour < lunch[0]) nextMsg = `Ouvre à ${lunch[0]}h`;
      else if (lunch && dinner && hour >= lunch[1] && hour < dinner[0]) nextMsg = `Réouvre à ${dinner[0]}h`;
      else if (dinner && hour < dinner[0]) nextMsg = `Ouvre à ${dinner[0]}h`;
    } else {
      if (lunch  && hour >= lunch[0]  && hour < lunch[1])  nextMsg = `Ferme à ${lunch[1]}h`;
      if (dinner && hour >= dinner[0] && hour < dinner[1]) nextMsg = `Ferme à ${dinner[1]}h`;
    }
  }

  const holidayMsg = isFrenchHoliday(now) ? 'Fermé — Jour férié' : null;
  badge.className  = 'statut-badge ' + (isOpen ? 'ouvert' : 'ferme');
  badge.textContent = isOpen
    ? `Ouvert · ${nextMsg}`
    : (holidayMsg || (nextMsg ? `Fermé · ${nextMsg}` : 'Fermé aujourd\'hui'));

  // Highlight today's row
  const dayRowIndex = [1,2,3,4,5,6,0][day]; // Mon=0 in HTML order
  const todayRow = document.getElementById('day-' + dayRowIndex);
  if (todayRow) todayRow.classList.add('today');
})();

// ─────────────────────────────────────────────
// GALERIE — Navigation clavier + tabindex
// ─────────────────────────────────────────────
document.querySelectorAll('.galerie-item').forEach((item, idx, all) => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', item.dataset.caption || `Photo ${idx + 1}`);

  // Open on Enter or Space
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(idx);
    }
    // Arrow navigation between gallery items
    if (e.key === 'ArrowRight' && all[idx + 1]) all[idx + 1].focus();
    if (e.key === 'ArrowLeft' && all[idx - 1]) all[idx - 1].focus();
  });
});

// ─────────────────────────────────────────────
// FORMULAIRE DE RÉSERVATION — avec validation inline
// ─────────────────────────────────────────────
const resaForm = document.getElementById('resa-form');
const resaSuccess = document.getElementById('resa-success');

// Messages d'erreur en français
const errorMessages = {
  'resa-nom':      'Veuillez indiquer votre nom',
  'resa-prenom':   'Veuillez indiquer votre prénom',
  'resa-tel':      'Veuillez indiquer un numéro de téléphone valide',
  'resa-date':     'Veuillez choisir une date',
  'resa-heure':    'Veuillez choisir un service (déjeuner ou dîner)',
  'resa-couverts': 'Veuillez indiquer le nombre de personnes',
};

function showFieldError(field, msg) {
  field.classList.add('field-error');
  let err = document.getElementById('err-' + field.id);
  if (!err) {
    err = document.createElement('span');
    err.id = 'err-' + field.id;
    err.className = 'field-error-msg';
    err.setAttribute('role', 'alert');
    field.parentNode.appendChild(err);
  }
  err.textContent = msg;
  field.setAttribute('aria-describedby', err.id);
  field.setAttribute('aria-invalid', 'true');
}

function clearFieldError(field) {
  field.classList.remove('field-error');
  field.removeAttribute('aria-invalid');
  const err = document.getElementById('err-' + field.id);
  if (err) err.textContent = '';
}

if (resaForm) {
  // Set min date to today
  const dateInput = document.getElementById('resa-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  // Real-time validation on blur
  Object.keys(errorMessages).forEach(id => {
    const field = document.getElementById(id);
    if (!field) return;
    field.addEventListener('blur', () => {
      if (!field.validity.valid || !field.value.trim()) {
        showFieldError(field, errorMessages[id]);
      } else {
        clearFieldError(field);
      }
    });
    field.addEventListener('input', () => {
      if (field.validity.valid && field.value.trim()) clearFieldError(field);
    });
  });

  resaForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all required fields
    let hasError = false;
    Object.entries(errorMessages).forEach(([id, msg]) => {
      const field = document.getElementById(id);
      if (!field) return;
      if (!field.validity.valid || !field.value.trim()) {
        showFieldError(field, msg);
        if (!hasError) { field.focus(); hasError = true; }
      } else {
        clearFieldError(field);
      }
    });
    if (hasError) return;

    const nom     = document.getElementById('resa-nom').value.trim();
    const prenom  = document.getElementById('resa-prenom').value.trim();
    const tel     = document.getElementById('resa-tel').value.trim();
    const email   = document.getElementById('resa-email').value.trim();
    const date    = document.getElementById('resa-date').value;
    const service = document.getElementById('resa-heure').value;
    const couverts = document.getElementById('resa-couverts').value;
    const occasion = document.getElementById('resa-occasion').value;
    const message  = document.getElementById('resa-message').value.trim();

    // Envoi via Formspree (remplacer YOUR_FORM_ID par l'ID Formspree réel)
    const FORMSPREE_ID = 'YOUR_FORM_ID';
    const submitBtn = resaForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    const payload = {
      nom, prenom, tel, date,
      service: service === 'midi' ? 'Déjeuner (12h–14h)' : 'Dîner (19h–22h)',
      couverts,
      ...(email    && { email }),
      ...(occasion && { occasion }),
      ...(message  && { message }),
      _subject: `Demande de réservation — ${prenom} ${nom}`,
      _replyto: email || '',
    };

    fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (res.ok) {
          resaForm.style.display = 'none';
          resaSuccess.style.display = 'block';
          resaSuccess.focus();
        } else {
          return res.json().then(data => { throw new Error(data.error || 'Erreur réseau'); });
        }
      })
      .catch(() => {
        // Fallback mailto si Formspree indisponible
        const bodyLines = [
          `Nom : ${prenom} ${nom}`, `Téléphone : ${tel}`,
          email    ? `E-mail : ${email}`        : '',
          `Date souhaitée : ${date}`,
          `Service : ${payload.service}`,
          `Couverts : ${couverts} personne(s)`,
          occasion ? `Occasion : ${occasion}`   : '',
          message  ? `Message : ${message}`     : '',
        ].filter(Boolean).join('\n');
        const subject = encodeURIComponent(`Demande de réservation — ${prenom} ${nom}`);
        window.location.href = `mailto:contact@auxtroisfleursillkirch.fr?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;
        resaForm.style.display = 'none';
        resaSuccess.style.display = 'block';
        resaSuccess.focus();
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer la demande de réservation';
      });
  });
}


// ─────────────────────────────────────────────
// RGPD — Consentement Google Maps (avec try/catch localStorage)
// ─────────────────────────────────────────────
(function() {
  const banner = document.getElementById('rgpd-banner');
  const mapIframe = document.getElementById('map-iframe');
  const mapPlaceholder = document.getElementById('map-placeholder');

  function loadMap() {
    if (mapIframe && !mapIframe.src) {
      mapIframe.src = mapIframe.dataset.src;
      mapIframe.style.display = 'block';
      if (mapPlaceholder) mapPlaceholder.classList.remove('visible');
    }
  }

  function showPlaceholder() {
    if (mapPlaceholder) mapPlaceholder.classList.add('visible');
    if (mapIframe) mapIframe.style.display = 'none';
  }

  let consent = null;
  try { consent = localStorage.getItem('rgpd_maps'); } catch(e) { /* private browsing */ }

  if (consent === 'accepted') {
    loadMap();
  } else if (consent === 'refused') {
    showPlaceholder();
  } else {
    showPlaceholder();
    setTimeout(() => { if (banner) banner.classList.add('visible'); }, 1500);
  }

  window.acceptRGPD = function() {
    try { localStorage.setItem('rgpd_maps', 'accepted'); } catch(e) {}
    if (banner) banner.style.display = 'none';
    loadMap();
  };

  window.refuseRGPD = function() {
    try { localStorage.setItem('rgpd_maps', 'refused'); } catch(e) {}
    if (banner) { banner.classList.remove('visible'); setTimeout(() => banner.style.display = 'none', 500); }
    showPlaceholder();
  };
})();
