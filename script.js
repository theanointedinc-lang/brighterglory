/* ==========================================================================
   BRIGHTER GLORY NURSERY AND PRIMARY SCHOOL - INTERACTIVE CLIENT LOGIC
   Location: Ifelere Street, Oke Aro Titun, Akure, Ondo State
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Systems
  initNavigation();
  initThemeToggle();
  initLeafletMap();
  initEventsSystem();
  initModals();
  initContactForm();
  initSearchSystem();
  initSchoolAnthem();
  initMutedVideos();
});

/* ==========================================================================
   1. NAVIGATION & SPA ROUTER SYSTEM
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .js-page-nav');
  const pageSections = document.querySelectorAll('.page-section');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  function navigateTo(pageId) {
    if (!pageId) return;

    // Update active page section
    pageSections.forEach(section => {
      if (section.id === pageId) {
        section.classList.add('active-page');
      } else {
        section.classList.remove('active-page');
      }
    });

    // Update nav links active class
    navLinks.forEach(link => {
      const target = link.getAttribute('data-page');
      if (target === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile menu if open
    if (navMenu) navMenu.classList.remove('open');

    // Re-trigger map resize if map page is loaded or map is visible
    setTimeout(() => {
      if (window.brighterGloryMap) {
        window.brighterGloryMap.invalidateSize();
      }
    }, 200);

    // Update URL Hash without jump
    history.pushState(null, null, `#${pageId}`);
  }

  // Add click listeners to all page navigation triggers
  document.body.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-page]');
    if (navBtn) {
      e.preventDefault();
      const pageId = navBtn.getAttribute('data-page');
      navigateTo(pageId);
    }
  });

  // Handle browser Back / Forward buttons & direct hash links
  window.addEventListener('popstate', handleHash);
  
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
      navigateTo(hash);
    } else {
      navigateTo('home-page');
    }
  }

  // Check initial hash on page load
  handleHash();

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }
}

/* ==========================================================================
   2. THEME SWITCHER (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('bg_theme') || 'light';

  document.documentElement.setAttribute('data-theme', storedTheme);
  updateThemeIcon(storedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('bg_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

/* ==========================================================================
   3. LEAFLET INTERACTIVE MAP SYSTEM (Akure - Ifelere Street, Oke Aro Titun)
   ========================================================================== */
function initLeafletMap() {
  const mapElement = document.getElementById('leaflet-map');
  if (!mapElement) return;

  // Akure Oke Aro Coordinates approx [7.2355, 5.1950]
  const schoolCoords = [7.2355, 5.1950];

  // Initialize Map
  const map = L.map('leaflet-map', {
    center: schoolCoords,
    zoom: 16,
    zoomControl: true,
    scrollWheelZoom: false
  });

  window.brighterGloryMap = map;

  // Add OpenStreetMap Tile Layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Custom Icon
  const schoolIcon = L.divIcon({
    className: 'custom-map-icon',
    html: `<div style="background:#1e3a8a; color:#f59e0b; width:44px; height:44px; border-radius:50%; border:3px solid #f59e0b; display:flex; justify-content:center; align-items:center; font-size:1.3rem; box-shadow:0 8px 20px rgba(0,0,0,0.3);"><i class="fas fa-graduation-cap"></i></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });

  // Add Marker with Rich Popup
  const popupContent = `
    <div class="map-popup-card">
      <h4 style="color:#1e3a8a; font-weight:800; margin-bottom:4px;">Brighter Glory School</h4>
      <p style="font-size:0.85rem; color:#475569; margin-bottom:8px;">Ifelere Street, Oke Aro Titun, Akure, Ondo State</p>
      <span style="background:#10b981; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:700;">Open for Admissions</span>
      <div style="margin-top:8px;">
        <a href="https://www.google.com/maps/search/?api=1&query=7.2355,5.1950" target="_blank" style="color:#1e3a8a; font-size:0.8rem; font-weight:700; text-decoration:underline;"><i class="fas fa-directions"></i> Get Driving Directions</a>
      </div>
    </div>
  `;

  L.marker(schoolCoords, { icon: schoolIcon }).addTo(map)
    .bindPopup(popupContent)
    .openPopup();
}



/* ==========================================================================
   5. UPCOMING EVENTS CATEGORY FILTER & COUNTDOWN TIMER
   ========================================================================== */
function initEventsSystem() {
  // Category Filter
  const filterTabs = document.querySelectorAll('.filter-tab');
  const eventCards = document.querySelectorAll('.event-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      eventCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Countdown Timer to Next Inter-House Sports / Open Day (24 days countdown)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 24);

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (daysEl) {
    function updateClock() {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) return;

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.textContent = d < 10 ? '0' + d : d;
      hoursEl.textContent = h < 10 ? '0' + h : h;
      minsEl.textContent = m < 10 ? '0' + m : m;
      secsEl.textContent = s < 10 ? '0' + s : s;
    }

    setInterval(updateClock, 1000);
    updateClock();
  }
}

/* ==========================================================================
   6. MODAL SYSTEM (ADMISSION APPLICATION & EVENT RSVP)
   ========================================================================== */
function initModals() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtns = document.querySelectorAll('.js-close-modal');

  function openModal(modalId) {
    if (!overlay) return;
    const modals = overlay.querySelectorAll('.modal-content');
    modals.forEach(m => m.style.display = 'none');

    const targetModal = document.getElementById(modalId);
    if (targetModal) {
      targetModal.style.display = 'block';
      overlay.classList.add('active');
    }
  }

  function closeModal() {
    if (overlay) overlay.classList.remove('active');
  }

  document.body.addEventListener('click', (e) => {
    const openTrigger = e.target.closest('[data-modal]');
    if (openTrigger) {
      e.preventDefault();
      const modalId = openTrigger.getAttribute('data-modal');
      openModal(modalId);
    }
  });

  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Handle Admission Portal Submission
  const admissionForm = document.getElementById('admission-form');
  if (admissionForm) {
    admissionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const studentName = document.getElementById('adm-student-name').value || 'Scholar';
      const classApplying = document.getElementById('adm-class').value || 'Primary';
      
      const appRef = 'BGS-' + Math.floor(100000 + Math.random() * 900000);

      const admissionResultModal = `
        <div style="text-align:center; padding:1rem;">
          <div style="width:70px; height:70px; border-radius:50%; background:#10b981; color:#fff; display:flex; justify-content:center; align-items:center; font-size:2rem; margin:0 auto 1.25rem;">
            <i class="fas fa-check"></i>
          </div>
          <h3 style="font-size:1.8rem; color:#1e3a8a; margin-bottom:0.5rem;">Application Submitted!</h3>
          <p style="color:#475569; margin-bottom:1.5rem;">Thank you for registering <strong>${studentName}</strong> for <strong>${classApplying.toUpperCase()}</strong> at Brighter Glory School, Akure.</p>
          
          <div style="background:#f8fafc; border:2px dashed #cbd5e1; padding:1.25rem; border-radius:12px; margin-bottom:1.5rem;">
            <span style="font-size:0.85rem; text-transform:uppercase; color:#64748b; font-weight:700;">Application Reference Number</span>
            <div style="font-size:1.8rem; font-weight:800; color:#f59e0b; letter-spacing:2px; font-family:'Outfit', sans-serif;">${appRef}</div>
          </div>

          <p style="font-size:0.85rem; color:#64748b; margin-bottom:1.5rem;">Our Admissions Officer will contact you within 24 hours to schedule the campus assessment.</p>
          
          <button class="btn-primary js-close-modal" style="width:100%; justify-content:center;">Done & Close</button>
        </div>
      `;

      const modalContainer = document.getElementById('modal-admission');
      if (modalContainer) {
        modalContainer.innerHTML = admissionResultModal;
        const newClose = modalContainer.querySelector('.js-close-modal');
        if (newClose) newClose.addEventListener('click', closeModal);
      }
    });
  }
}

/* ==========================================================================
   7. CONTACT FORM VALIDATION & TICKETING
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('contact-feedback');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !phone || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    const ticketId = 'TICK-' + Math.floor(1000 + Math.random() * 9000);

    formFeedback.style.display = 'block';
    formFeedback.innerHTML = `
      <div style="background:rgba(16, 185, 129, 0.12); border:1px solid #10b981; color:#065f46; padding:1.25rem; border-radius:14px; margin-top:1rem;">
        <h4 style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem; color:#047857;">
          <i class="fas fa-check-circle"></i> Message Sent Successfully!
        </h4>
        <p style="font-size:0.9rem; margin-bottom:0.5rem;">Thank you, <strong>${name}</strong>. Your inquiry has been logged under Ticket <strong>#${ticketId}</strong>.</p>
        <p style="font-size:0.85rem;">Our admin team at Ifelere Street, Oke Aro Titun will get back to you shortly at <strong>${phone}</strong> / <strong>${email}</strong>.</p>
      </div>
    `;

    contactForm.reset();
  });
}

/* ==========================================================================
   8. GLOBAL SEARCH OVERLAY SYSTEM
   ========================================================================== */
function initSearchSystem() {
  const searchModalTrigger = document.getElementById('search-trigger');
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('search-results-list');

  if (!searchModalTrigger || !searchInput) return;

  const searchableData = [
    { title: 'Home Page & Main Compound', category: 'Page', page: 'home-page' },
    { title: 'About Us - Official Mission, Vision & Core Values', category: 'About', page: 'about-page' },
    { title: 'Brighter Glory Campus Photo Gallery', category: 'Gallery', page: 'about-page' },
    { title: 'Nursery & Phonics Wall Mural Learning', category: 'Services', page: 'services-page' },
    { title: 'Primary 1 to 6 Education & Curriculum', category: 'Services', page: 'services-page' },
    { title: 'School Bus & Transportation (Oke Aro Routes)', category: 'Services', page: 'services-page' },
    { title: 'Meet Our Founder - Pastor (Mrs) Elizabeth Adebiyi', category: 'Leadership', page: 'about-page' },
    { title: 'Upcoming Events Calendar & Inter-House Sports', category: 'Events', page: 'events-page' },
    { title: 'Contact Us & Campus Address in Akure', category: 'Contact', page: 'contact-page' },
    { title: 'Online Admission Application Portal', category: 'Admissions', page: 'home-page' }
  ];

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      searchResults.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:1rem;">Type to search pages, gallery, or events...</p>';
      return;
    }

    const filtered = searchableData.filter(item => 
      item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:1rem;">No results found.</p>';
      return;
    }

    searchResults.innerHTML = filtered.map(item => `
      <div class="js-page-nav" data-page="${item.page}" style="padding:0.75rem 1rem; border-bottom:1px solid #e2e8f0; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600; color:#1e3a8a;">${item.title}</span>
        <span style="background:#f59e0b; color:#0f172a; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:700;">${item.category}</span>
      </div>
    `).join('');
  });
}

/* ==========================================================================
   9. SCHOOL ANTHEM AUDIO WIDGET
   ========================================================================== */
function initSchoolAnthem() {
  const playBtn = document.getElementById('anthem-play-btn');
  const anthemStatus = document.getElementById('anthem-status');
  let isPlaying = false;

  if (!playBtn) return;

  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      playBtn.style.background = '#ef4444';
      if (anthemStatus) anthemStatus.textContent = 'Playing School Anthem... 🎵';
    } else {
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
      playBtn.style.background = '#f59e0b';
      if (anthemStatus) anthemStatus.textContent = 'Listen to School Anthem';
    }
  });
}

/* ==========================================================================
   MUTED VIDEOS CONTROLLER SYSTEM
   ========================================================================== */
function initMutedVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.muted = true;
    video.volume = 0;
    video.setAttribute('muted', '');
    video.addEventListener('play', () => {
      video.muted = true;
      video.volume = 0;
    });
  });
}

