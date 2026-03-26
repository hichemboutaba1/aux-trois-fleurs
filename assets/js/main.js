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
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
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

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(img, caption) {
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = caption || '';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.galerie-item').forEach(item => {
  item.addEventListener('click', () => {
    openLightbox(item.querySelector('img'), item.dataset.caption);
  });
});

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
  if (e.target !== lightboxImg) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
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
// ─────────────────────────────────────────────
(function() {
  // Schedule: [lunch_open, lunch_close, dinner_open, dinner_close] or null if closed
  // Days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const schedule = {
    0: { lunch: [12, 14] },                         // Dimanche
    1: null,                                         // Lundi fermé
    2: { lunch: [12, 14], dinner: [19, 22] },        // Mardi
    3: { lunch: [12, 14] },                          // Mercredi
    4: { lunch: [12, 14], dinner: [19, 22] },        // Jeudi
    5: { lunch: [12, 14], dinner: [19, 22] },        // Vendredi
    6: { dinner: [19, 22] },                         // Samedi
  };
  const dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const dayIds   = [6, 0, 1, 2, 3, 4, 5]; // index in .day elements (Mon=0 in HTML)

  const badge = document.getElementById('statut-horaires');
  if (!badge) return;

  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const todaySchedule = schedule[day];

  let isOpen = false;
  let nextMsg = '';

  if (todaySchedule) {
    const { lunch, dinner } = todaySchedule;
    if (lunch && hour >= lunch[0] && hour < lunch[1]) isOpen = true;
    if (dinner && hour >= dinner[0] && hour < dinner[1]) isOpen = true;

    if (!isOpen) {
      if (lunch && hour < lunch[0]) nextMsg = `Ouvre à ${lunch[0]}h`;
      else if (lunch && dinner && hour >= lunch[1] && hour < dinner[0]) nextMsg = `Réouvre à ${dinner[0]}h`;
      else if (dinner && hour < dinner[0]) nextMsg = `Ouvre à ${dinner[0]}h`;
    } else {
      if (lunch && hour >= lunch[0] && hour < lunch[1]) nextMsg = `Ferme à ${lunch[1]}h`;
      if (dinner && hour >= dinner[0] && hour < dinner[1]) nextMsg = `Ferme à ${dinner[1]}h`;
    }
  }

  badge.className = 'statut-badge ' + (isOpen ? 'ouvert' : 'ferme');
  badge.textContent = isOpen ? `Ouvert · ${nextMsg}` : (nextMsg ? `Fermé · ${nextMsg}` : 'Fermé aujourd\'hui');

  // Highlight today's row
  const dayRowIndex = [1,2,3,4,5,6,0][day]; // Mon=0 in HTML order
  const todayRow = document.getElementById('day-' + dayRowIndex);
  if (todayRow) todayRow.classList.add('today');
})();

// ─────────────────────────────────────────────
// FORMULAIRE DE RÉSERVATION
// ─────────────────────────────────────────────
const resaForm = document.getElementById('resa-form');
const resaSuccess = document.getElementById('resa-success');

if (resaForm) {
  // Set min date to today
  const dateInput = document.getElementById('resa-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  resaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!resaForm.checkValidity()) {
      resaForm.reportValidity();
      return;
    }

    // Build mailto link with form data
    const nom = document.getElementById('resa-nom').value;
    const prenom = document.getElementById('resa-prenom').value;
    const tel = document.getElementById('resa-tel').value;
    const email = document.getElementById('resa-email').value;
    const date = document.getElementById('resa-date').value;
    const service = document.getElementById('resa-heure').value;
    const couverts = document.getElementById('resa-couverts').value;
    const occasion = document.getElementById('resa-occasion').value;
    const message = document.getElementById('resa-message').value;

    const body = [
      `Nom : ${prenom} ${nom}`,
      `Téléphone : ${tel}`,
      email ? `E-mail : ${email}` : '',
      `Date : ${date}`,
      `Service : ${service === 'midi' ? 'Déjeuner (12h-14h)' : 'Dîner (19h-22h)'}`,
      `Couverts : ${couverts}`,
      occasion ? `Occasion : ${occasion}` : '',
      message ? `Message : ${message}` : '',
    ].filter(Boolean).join('\n');

    const mailto = `mailto:contact@auxtroisfleursillkirch.fr?subject=${encodeURIComponent(`Demande de réservation — ${prenom} ${nom}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    // Show success message
    resaForm.style.display = 'none';
    resaSuccess.style.display = 'block';
    resaSuccess.focus();
  });
}