/**
 * ============================================================================
 * AEROVA — ULTRA-PREMIUM FLIGHT BOOKING & RESERVATION SYSTEM
 * Core Application Engine & Reactive State Controller
 * Zero external libraries required. 100% Offline-Friendly & Functional.
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. AIRPORT DATABASE & DEMO DATA
  // ==========================================================================
  const AIRPORTS = [
    { code: 'PEW', city: 'Peshawar', country: 'Pakistan', name: 'Bacha Khan International Airport' },
    { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International Airport' },
    { code: 'LHR', city: 'London', country: 'United Kingdom', name: 'Heathrow Airport' },
    { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International Airport' },
    { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
    { code: 'JFK', city: 'New York', country: 'United States', name: 'John F. Kennedy International Airport' },
    { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', name: 'King Khalid International Airport' },
    { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', name: 'Zayed International Airport' },
    { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia', name: 'King Abdulaziz International Airport' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
    { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
    { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Tokyo Haneda Airport' },
    { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport' },
    { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
    { code: 'ISB', city: 'Islamabad', country: 'Pakistan', name: 'Islamabad International Airport' },
    { code: 'KHI', city: 'Karachi', country: 'Pakistan', name: 'Jinnah International Airport' },
    { code: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles International Airport' },
    { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith Airport' }
  ];

  // Currency Exchange Rates against USD
  const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0, format: val => `$${val.toFixed(2)}` },
    EUR: { symbol: '€', rate: 0.92, format: val => `€${(val * 0.92).toFixed(2)}` },
    GBP: { symbol: '£', rate: 0.79, format: val => `£${(val * 0.79).toFixed(2)}` },
    AED: { symbol: 'د.إ', rate: 3.67, format: val => `AED ${(val * 3.67).toFixed(2)}` },
    PKR: { symbol: '₨', rate: 278.5, format: val => `PKR ${(val * 278.5).toLocaleString('en-US', { maximumFractionDigits: 0 })}` }
  };

  // Promo Codes
  const PROMO_CODES = {
    'FLY10': { type: 'percent', value: 0.10, label: '10% Off Base Airfare' },
    'AEROVA20': { type: 'percent', value: 0.20, label: '20% Off Flagship Fares' },
    'FIRSTFLY': { type: 'fixed', value: 50.00, label: '$50 Welcome Discount' }
  };

  // Curated Destinations
  const CURATED_DESTINATIONS = [
    { city: 'Dubai', country: 'United Arab Emirates', code: 'DXB', fare: 289, imageGradient: 'linear-gradient(135deg, #1e3a8a, #0b1426)' },
    { city: 'London', country: 'United Kingdom', code: 'LHR', fare: 540, imageGradient: 'linear-gradient(135deg, #312e81, #0f172a)' },
    { city: 'Istanbul', country: 'Turkey', code: 'IST', fare: 320, imageGradient: 'linear-gradient(135deg, #831843, #1e1b4b)' },
    { city: 'Doha', country: 'Qatar', code: 'DOH', fare: 295, imageGradient: 'linear-gradient(135deg, #701a75, #0f172a)' },
    { city: 'Riyadh', country: 'Saudi Arabia', code: 'RUH', fare: 310, imageGradient: 'linear-gradient(135deg, #065f46, #064e3b)' },
    { city: 'Abu Dhabi', country: 'United Arab Emirates', code: 'AUH', fare: 299, imageGradient: 'linear-gradient(135deg, #1e40af, #1e293b)' },
    { city: 'Kuala Lumpur', country: 'Malaysia', code: 'KUL', fare: 420, imageGradient: 'linear-gradient(135deg, #0e7490, #164e63)' },
    { city: 'Paris', country: 'France', code: 'CDG', fare: 560, imageGradient: 'linear-gradient(135deg, #1d4ed8, #090d16)' },
    { city: 'Tokyo', country: 'Japan', code: 'HND', fare: 780, imageGradient: 'linear-gradient(135deg, #991b1b, #18181b)' }
  ];

  // ==========================================================================
  // 2. CENTRAL APPLICATION STATE
  // ==========================================================================
  const State = {
    activeCurrency: localStorage.getItem('aerova_currency') || 'USD',
    currentView: 'home',
    tripType: 'round', // 'round', 'oneway', 'multicity'
    
    // Search Criteria
    search: {
      origin: { code: 'PEW', city: 'Peshawar', country: 'Pakistan' },
      destination: { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates' },
      departureDate: getFutureDate(14),
      returnDate: getFutureDate(21),
      passengers: {
        adults: 1,
        children: 0,
        infants: 0
      },
      cabinClass: 'Economy',
      multiSegments: []
    },

    // Results & Filter State
    allFlights: [],
    filteredFlights: [],
    sortOrder: 'recommended',
    filters: {
      stops: ['nonstop', '1stop', '2stop'],
      airlines: ['AEROVA AIR', 'SKYLINE AIR', 'GLOBALWINGS', 'NOVA AIRWAYS', 'ORBIT AIR'],
      maxPrice: 2500,
      departureWindows: ['morning', 'afternoon', 'evening'],
      refundableOnly: false,
      baggageIncluded: false
    },

    // Active Booking Transaction State
    currentFlight: null,
    bookingStep: 1,
    bookingData: {
      pnr: '',
      passengerDetails: [],
      contact: {
        email: 'asfandyar@aerova.demo',
        phone: '+92 300 1234567',
        sendUpdates: true
      },
      selectedSeat: '14A',
      seatFee: 0,
      baggage: {
        personal: true,
        carryon: true,
        checkedBag: false,
        heavyBag: false
      },
      extras: {
        priority: false,
        lounge: false,
        meal: false,
        insurance: false
      },
      appliedPromo: null,
      fareSummary: {
        base: 0,
        taxes: 0,
        seat: 0,
        baggage: 0,
        extras: 0,
        discount: 0,
        total: 0
      }
    },

    // Persistent User Data
    myBookings: JSON.parse(localStorage.getItem('aerova_bookings') || '[]'),
    favoriteFlightIds: JSON.parse(localStorage.getItem('aerova_favorites') || '[]'),
    notifications: JSON.parse(localStorage.getItem('aerova_notifications') || '[]'),
    currentUser: JSON.parse(localStorage.getItem('aerova_user') || 'null')
  };

  // Helper date function
  function getFutureDate(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }

  // ==========================================================================
  // 3. INITIAL SEEDING & LOCAL STORAGE
  // ==========================================================================
  function initDemoStorage() {
    // Default sample user
    if (!State.currentUser) {
      State.currentUser = {
        name: 'Asfandyar Khan',
        email: 'asfandyar@aerova.demo',
        avatar: 'A',
        memberNumber: 'AV-8849201',
        tier: 'Gold Elite',
        miles: 48250,
        tripsTaken: 12
      };
      localStorage.setItem('aerova_user', JSON.stringify(State.currentUser));
    }

    // Default sample bookings if empty
    if (State.myBookings.length === 0) {
      State.myBookings = [
        {
          pnr: 'AV89421P',
          airline: 'AEROVA AIR',
          flightNum: 'AV-204',
          origin: { code: 'PEW', city: 'Peshawar' },
          destination: { code: 'DXB', city: 'Dubai' },
          date: getFutureDate(14),
          departureTime: '08:25',
          arrivalTime: '11:45',
          duration: '3h 20m',
          seat: '14A',
          cabin: 'Economy',
          passengerName: 'Asfandyar Khan',
          total: 331.50,
          status: 'confirmed', // 'confirmed', 'checked-in', 'cancelled'
          gate: 'B12',
          zone: 'Zone 2'
        },
        {
          pnr: 'AV31092K',
          airline: 'AEROVA AIR',
          flightNum: 'AV-810',
          origin: { code: 'LHR', city: 'London' },
          destination: { code: 'DOH', city: 'Doha' },
          date: getFutureDate(30),
          departureTime: '14:15',
          arrivalTime: '23:30',
          duration: '6h 45m',
          seat: '3B',
          cabin: 'Business',
          passengerName: 'Asfandyar Khan',
          total: 1450.00,
          status: 'checked-in',
          gate: 'A08',
          zone: 'Zone 1'
        }
      ];
      localStorage.setItem('aerova_bookings', JSON.stringify(State.myBookings));
    }

    // Default notifications
    if (State.notifications.length === 0) {
      State.notifications = [
        { id: 1, title: 'Booking AV89421P Confirmed', time: '10 mins ago', read: false, body: 'Your flight to Dubai (DXB) is confirmed. Online check-in opens 24h before departure.' },
        { id: 2, title: 'Price Drop Alert', time: '2 hours ago', read: false, body: 'Fares for Peshawar (PEW) to London (LHR) dropped by 15%!' },
        { id: 3, title: 'AEROVA Gold Elite Milestone', time: 'Yesterday', read: true, body: 'Congratulations! You earned 2,400 tier miles on your recent journey.' }
      ];
      localStorage.setItem('aerova_notifications', JSON.stringify(State.notifications));
    }
  }

  // ==========================================================================
  // 4. TOAST NOTIFICATION ENGINE
  // ==========================================================================
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-weight: 800; font-size: 1.1rem;">${icons[type] || 'ℹ'}</span>
        <span class="toast-text">${message}</span>
      </div>
      <button class="toast-close" aria-label="Close notification">✕</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  // ==========================================================================
  // 5. CURRENCY & FORMATTING ENGINE
  // ==========================================================================
  function formatMoney(amountInUSD) {
    const cur = CURRENCIES[State.activeCurrency] || CURRENCIES.USD;
    return cur.format(amountInUSD);
  }

  function setupCurrencySwitchers() {
    const mainSel = document.getElementById('currencySelector');
    const mobSel = document.getElementById('mobileCurrencySelector');

    if (mainSel) mainSel.value = State.activeCurrency;
    if (mobSel) mobSel.value = State.activeCurrency;

    function onCurrencyChange(e) {
      State.activeCurrency = e.target.value;
      localStorage.setItem('aerova_currency', State.activeCurrency);
      if (mainSel) mainSel.value = State.activeCurrency;
      if (mobSel) mobSel.value = State.activeCurrency;
      
      // Re-render price displays
      renderFlightResults();
      renderStickyFareSummary();
      renderBookings();
      renderDestinations();
      showToast(`Currency changed to ${State.activeCurrency}`, 'info');
    }

    if (mainSel) mainSel.addEventListener('change', onCurrencyChange);
    if (mobSel) mobSel.addEventListener('change', onCurrencyChange);
  }

  // ==========================================================================
  // 6. MODAL & NAVIGATION SYSTEM
  // ==========================================================================
  function setupModals() {
    // Escape key closes open modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        closeMobileDrawer();
        closePassengerPopover();
      }
      // Ctrl+K opens global search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openModal('modalGlobalSearch');
        setTimeout(() => document.getElementById('globalSearchInput')?.focus(), 100);
      }
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Setup specific modal triggers
    document.getElementById('btnCloseDetailsModal')?.addEventListener('click', () => closeModal('modalFlightDetails'));
    document.getElementById('btnCloseAuthModal')?.addEventListener('click', () => closeModal('modalAuth'));
    document.getElementById('btnCloseNotifModal')?.addEventListener('click', () => closeModal('modalNotifications'));
    document.getElementById('btnCloseGlobalSearchModal')?.addEventListener('click', () => closeModal('modalGlobalSearch'));
    document.getElementById('btnCloseManageModal')?.addEventListener('click', () => closeModal('modalManageBooking'));
    document.getElementById('btnCloseHelpModal')?.addEventListener('click', () => closeModal('modalHelp'));

    document.getElementById('btnGlobalSearch')?.addEventListener('click', () => {
      openModal('modalGlobalSearch');
      setTimeout(() => document.getElementById('globalSearchInput')?.focus(), 100);
    });

    document.getElementById('btnNotifications')?.addEventListener('click', () => {
      renderNotificationsModal();
      openModal('modalNotifications');
    });

    document.getElementById('btnLoginModal')?.addEventListener('click', () => {
      setAuthModalMode('login');
      openModal('modalAuth');
    });

    document.getElementById('btnRegisterModal')?.addEventListener('click', () => {
      setAuthModalMode('register');
      openModal('modalAuth');
    });

    document.getElementById('mobileLoginBtn')?.addEventListener('click', () => {
      closeMobileDrawer();
      setAuthModalMode('login');
      openModal('modalAuth');
    });

    document.getElementById('navLinkHelp')?.addEventListener('click', () => openModal('modalHelp'));
    document.getElementById('mobileHelpLink')?.addEventListener('click', () => {
      closeMobileDrawer();
      openModal('modalHelp');
    });

    // Profile Click
    document.getElementById('userProfileBadge')?.addEventListener('click', () => navigateTo('profile'));
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Mobile Drawer
  function setupMobileNavigation() {
    const hamburger = document.getElementById('btnHamburger');
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const closeBtn = document.getElementById('btnCloseDrawer');

    hamburger?.addEventListener('click', () => {
      drawer?.classList.add('open');
      backdrop?.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    function close() {
      drawer?.classList.remove('open');
      backdrop?.classList.remove('open');
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);
  }

  function closeMobileDrawer() {
    document.getElementById('mobileDrawer')?.classList.remove('open');
    document.getElementById('drawerBackdrop')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // View Navigation Router
  function navigateTo(viewName) {
    State.currentView = viewName;

    // Update Desktop Nav Links Active State
    document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-links .nav-link, .mobile-bottom-item').forEach(el => {
      if (el.getAttribute('data-nav') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Section visibility
    const heroSection = document.getElementById('heroSection');
    const resultsSection = document.getElementById('viewResultsSection');
    const bookingSection = document.getElementById('viewBookingSection');
    const bookingsSection = document.getElementById('viewBookingsSection');
    const checkinSection = document.getElementById('viewCheckinSection');
    const exploreSection = document.getElementById('viewExploreSection');
    const favoritesSection = document.getElementById('viewFavoritesSection');
    const profileSection = document.getElementById('viewProfileSection');

    // Reset visibility
    [resultsSection, bookingSection, bookingsSection, checkinSection, exploreSection, favoritesSection, profileSection].forEach(s => {
      if (s) s.classList.remove('active');
    });

    if (viewName === 'home') {
      if (heroSection) heroSection.style.display = 'block';
      if (resultsSection) resultsSection.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (heroSection) heroSection.style.display = 'none';
      
      if (viewName === 'explore') exploreSection?.classList.add('active');
      if (viewName === 'bookings') {
        renderBookings();
        bookingsSection?.classList.add('active');
      }
      if (viewName === 'checkin') checkinSection?.classList.add('active');
      if (viewName === 'favorites') {
        renderFavorites();
        favoritesSection?.classList.add('active');
      }
      if (viewName === 'profile') profileSection?.classList.add('active');
      if (viewName === 'booking') bookingSection?.classList.add('active');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    closeMobileDrawer();
  }

  // Setup nav click listeners
  function setupNavLinks() {
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.getAttribute('data-nav');
        if (view) {
          e.preventDefault();
          navigateTo(view);
        }
      });
    });

    document.getElementById('brandHomeLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('home');
    });

    document.getElementById('btnModifySearch')?.addEventListener('click', () => {
      const hero = document.getElementById('heroSection');
      if (hero) {
        hero.style.display = 'block';
        hero.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.getElementById('btnBookNewTripFromList')?.addEventListener('click', () => {
      navigateTo('home');
    });
  }

  // ==========================================================================
  // 7. FLIGHT SEARCH ENGINE & AUTOCOMPLETE
  // ==========================================================================
  function setupFlightSearch() {
    // 1. Trip Type Tabs
    document.querySelectorAll('.trip-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.trip-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.tripType = btn.getAttribute('data-trip');
        updateTripTypeUI();
      });
    });

    // 2. Dates
    const depDate = document.getElementById('departureDate');
    const retDate = document.getElementById('returnDate');

    if (depDate) {
      depDate.value = State.search.departureDate;
      depDate.min = new Date().toISOString().split('T')[0];
      depDate.addEventListener('change', () => {
        State.search.departureDate = depDate.value;
        if (retDate && retDate.value < depDate.value) {
          retDate.value = depDate.value;
          State.search.returnDate = depDate.value;
        }
        if (retDate) retDate.min = depDate.value;
      });
    }

    if (retDate) {
      retDate.value = State.search.returnDate;
      retDate.min = depDate ? depDate.value : new Date().toISOString().split('T')[0];
      retDate.addEventListener('change', () => {
        State.search.returnDate = retDate.value;
      });
    }

    // 3. Airport Autosuggest
    setupAirportSuggest('originBox', 'originDisplay', 'originInput', 'originSuggestList', 'origin');
    setupAirportSuggest('destBox', 'destDisplay', 'destInput', 'destSuggestList', 'destination');

    // 4. Swap Button
    document.getElementById('btnSwapAirports')?.addEventListener('click', () => {
      const temp = { ...State.search.origin };
      State.search.origin = { ...State.search.destination };
      State.search.destination = temp;

      updateAirportDisplays();
      showToast(`Swapped route: ${State.search.origin.code} ⇄ ${State.search.destination.code}`, 'info');
    });

    // 5. Passenger & Cabin Popover
    setupPassengerPopover();

    // 6. Search Flights Submit
    document.getElementById('flightSearchForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      executeFlightSearch();
    });
    document.getElementById('btnSearchFlights')?.addEventListener('click', executeFlightSearch);
  }

  function updateTripTypeUI() {
    const returnBox = document.getElementById('returnBox');
    const multiContainer = document.getElementById('multiCityContainer');

    if (State.tripType === 'oneway') {
      if (returnBox) returnBox.style.display = 'none';
      if (multiContainer) multiContainer.style.display = 'none';
    } else if (State.tripType === 'multicity') {
      if (returnBox) returnBox.style.display = 'none';
      if (multiContainer) multiContainer.style.display = 'block';
      renderMultiCitySegments();
    } else {
      // Round trip
      if (returnBox) returnBox.style.display = 'block';
      if (multiContainer) multiContainer.style.display = 'none';
    }
  }

  function renderMultiCitySegments() {
    const container = document.getElementById('multiCitySegmentsList');
    if (!container) return;

    if (State.search.multiSegments.length === 0) {
      State.search.multiSegments = [
        { from: 'DXB', to: 'LHR', date: getFutureDate(21) }
      ];
    }

    container.innerHTML = State.search.multiSegments.map((seg, idx) => `
      <div class="multicity-row">
        <div class="search-field-box">
          <label class="field-label">Segment ${idx + 2} From</label>
          <input type="text" class="styled-input" value="${seg.from}" onchange="AerovaApp.updateSegment(${idx}, 'from', this.value)">
        </div>
        <div class="search-field-box">
          <label class="field-label">Segment ${idx + 2} To</label>
          <input type="text" class="styled-input" value="${seg.to}" onchange="AerovaApp.updateSegment(${idx}, 'to', this.value)">
        </div>
        <div class="search-field-box">
          <label class="field-label">Date</label>
          <input type="date" class="styled-input" value="${seg.date}" onchange="AerovaApp.updateSegment(${idx}, 'date', this.value)">
        </div>
        <button type="button" class="icon-btn" onclick="AerovaApp.removeSegment(${idx})" title="Remove segment" style="margin-top: 1.2rem;">✕</button>
      </div>
    `).join('');
  }

  function setupAirportSuggest(boxId, displayId, inputId, listId, targetKey) {
    const box = document.getElementById(boxId);
    const display = document.getElementById(displayId);
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    if (!box || !display || !input || !list) return;

    display.addEventListener('click', () => {
      display.style.display = 'none';
      input.style.display = 'block';
      input.focus();
      renderAirportList('', list, targetKey);
      list.classList.add('active');
    });

    input.addEventListener('input', (e) => {
      renderAirportList(e.target.value.trim().toLowerCase(), list, targetKey);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!box.contains(e.target)) {
        list.classList.remove('active');
        input.style.display = 'none';
        display.style.display = 'flex';
      }
    });
  }

  function renderAirportList(query, listEl, targetKey) {
    const matches = AIRPORTS.filter(a => {
      if (!query) return true;
      return a.code.toLowerCase().includes(query) ||
             a.city.toLowerCase().includes(query) ||
             a.country.toLowerCase().includes(query) ||
             a.name.toLowerCase().includes(query);
    });

    if (matches.length === 0) {
      listEl.innerHTML = `<div style="padding: 1rem; color: var(--text-dim); text-align: center;">No matching airports</div>`;
      return;
    }

    listEl.innerHTML = matches.map(a => `
      <div class="airport-item" data-code="${a.code}">
        <div class="airport-item-left">
          <span class="airport-item-city">${a.city}, ${a.country}</span>
          <span class="airport-item-name">${a.name}</span>
        </div>
        <span class="airport-item-code">${a.code}</span>
      </div>
    `).join('');

    listEl.querySelectorAll('.airport-item').forEach(item => {
      item.addEventListener('click', () => {
        const code = item.getAttribute('data-code');
        const airport = AIRPORTS.find(a => a.code === code);
        if (airport) {
          State.search[targetKey] = {
            code: airport.code,
            city: airport.city,
            country: airport.country
          };
          updateAirportDisplays();
          listEl.classList.remove('active');
          const input = listEl.parentElement.querySelector('.search-input-field');
          const display = listEl.parentElement.querySelector('.field-value-display');
          if (input) input.style.display = 'none';
          if (display) display.style.display = 'flex';
        }
      });
    });
  }

  function updateAirportDisplays() {
    const origCode = document.getElementById('originCodeTxt');
    const origCity = document.getElementById('originCityTxt');
    const destCode = document.getElementById('destCodeTxt');
    const destCity = document.getElementById('destCityTxt');

    if (origCode) origCode.textContent = State.search.origin.code;
    if (origCity) origCity.textContent = `${State.search.origin.city}, ${State.search.origin.country}`;
    if (destCode) destCode.textContent = State.search.destination.code;
    if (destCity) destCity.textContent = `${State.search.destination.city}, ${State.search.destination.country}`;
  }

  function setupPassengerPopover() {
    const box = document.getElementById('passengerCabinBox');
    const popover = document.getElementById('passengerPopover');
    const doneBtn = document.getElementById('btnClosePassengerPopover');

    box?.addEventListener('click', (e) => {
      if (popover && !popover.contains(e.target)) {
        popover.classList.toggle('active');
      }
    });

    doneBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      closePassengerPopover();
    });

    document.addEventListener('click', (e) => {
      if (box && !box.contains(e.target)) {
        closePassengerPopover();
      }
    });

    // Steppers
    const aCount = document.getElementById('countAdults');
    const cCount = document.getElementById('countChildren');
    const iCount = document.getElementById('countInfants');

    document.getElementById('btnAdultPlus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (State.search.passengers.adults < 9) {
        State.search.passengers.adults++;
        if (aCount) aCount.textContent = State.search.passengers.adults;
        updatePassengerSummary();
      }
    });

    document.getElementById('btnAdultMinus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (State.search.passengers.adults > 1) {
        State.search.passengers.adults--;
        // Infants cannot exceed adults
        if (State.search.passengers.infants > State.search.passengers.adults) {
          State.search.passengers.infants = State.search.passengers.adults;
          if (iCount) iCount.textContent = State.search.passengers.infants;
        }
        if (aCount) aCount.textContent = State.search.passengers.adults;
        updatePassengerSummary();
      }
    });

    document.getElementById('btnChildPlus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (State.search.passengers.children < 8) {
        State.search.passengers.children++;
        if (cCount) cCount.textContent = State.search.passengers.children;
        updatePassengerSummary();
      }
    });

    document.getElementById('btnChildMinus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (State.search.passengers.children > 0) {
        State.search.passengers.children--;
        if (cCount) cCount.textContent = State.search.passengers.children;
        updatePassengerSummary();
      }
    });

    document.getElementById('btnInfantPlus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (State.search.passengers.infants < State.search.passengers.adults) {
        State.search.passengers.infants++;
        if (iCount) iCount.textContent = State.search.passengers.infants;
        updatePassengerSummary();
      } else {
        showToast('Infants cannot exceed the number of adult passengers.', 'warning');
      }
    });

    document.getElementById('btnInfantMinus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (State.search.passengers.infants > 0) {
        State.search.passengers.infants--;
        if (iCount) iCount.textContent = State.search.passengers.infants;
        updatePassengerSummary();
      }
    });

    // Cabin buttons
    document.querySelectorAll('.cabin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.cabin-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.search.cabinClass = btn.getAttribute('data-cabin');
        updatePassengerSummary();
      });
    });
  }

  function closePassengerPopover() {
    document.getElementById('passengerPopover')?.classList.remove('active');
  }

  function updatePassengerSummary() {
    const summary = document.getElementById('passengerSummaryTxt');
    if (!summary) return;

    const parts = [];
    const p = State.search.passengers;
    if (p.adults === 1) parts.push('1 Adult');
    else parts.push(`${p.adults} Adults`);

    if (p.children > 0) parts.push(`${p.children} ${p.children === 1 ? 'Child' : 'Children'}`);
    if (p.infants > 0) parts.push(`${p.infants} ${p.infants === 1 ? 'Infant' : 'Infants'}`);

    summary.textContent = `${parts.join(', ')} • ${State.search.cabinClass}`;
  }

  // ==========================================================================
  // 8. FLIGHT GENERATION & RESULTS CONTROLLER
  // ==========================================================================
  function executeFlightSearch() {
    if (State.search.origin.code === State.search.destination.code) {
      showToast('Origin and Destination airports cannot be identical.', 'error');
      return;
    }

    generateFlightResults();
    navigateTo('home');

    // Scroll smoothly to results area
    const banner = document.getElementById('resultsSummaryBanner');
    if (banner) {
      banner.scrollIntoView({ behavior: 'smooth' });
    }

    showToast(`Found ${State.allFlights.length} available flights.`, 'success');
  }

  function generateFlightResults() {
    const orig = State.search.origin.code;
    const dest = State.search.destination.code;
    const cabin = State.search.cabinClass;

    // Base fare multipliers by cabin
    const cabinMultiplier = {
      'Economy': 1.0,
      'Premium Economy': 1.6,
      'Business': 3.2,
      'First Class': 5.5
    }[cabin] || 1.0;

    // Route distance simulation
    let basePrice = 280;
    if ((orig === 'PEW' && dest === 'LHR') || (orig === 'LHR' && dest === 'PEW')) basePrice = 540;
    else if ((orig === 'PEW' && dest === 'JFK') || (orig === 'JFK' && dest === 'PEW')) basePrice = 850;
    else if ((orig === 'PEW' && dest === 'IST') || (orig === 'IST' && dest === 'PEW')) basePrice = 320;
    else if ((orig === 'PEW' && dest === 'DXB') || (orig === 'DXB' && dest === 'PEW')) basePrice = 289;

    const demoTemplates = [
      {
        id: 'fl-1',
        airline: 'AEROVA AIR',
        flightNum: 'AV-204',
        aircraft: 'Boeing 787-9 Dreamliner',
        depTime: '08:25',
        arrTime: '11:45',
        duration: '3h 20m',
        stops: 'nonstop',
        stopsText: 'Non-stop',
        price: Math.round(basePrice * cabinMultiplier),
        refundable: true,
        baggageIncluded: true,
        timeWindow: 'morning',
        flagship: true
      },
      {
        id: 'fl-2',
        airline: 'AEROVA AIR',
        flightNum: 'AV-410',
        aircraft: 'Airbus A350-1000',
        depTime: '14:30',
        arrTime: '17:55',
        duration: '3h 25m',
        stops: 'nonstop',
        stopsText: 'Non-stop',
        price: Math.round((basePrice + 35) * cabinMultiplier),
        refundable: true,
        baggageIncluded: true,
        timeWindow: 'afternoon',
        flagship: true
      },
      {
        id: 'fl-3',
        airline: 'SKYLINE AIR',
        flightNum: 'SK-812',
        aircraft: 'Boeing 777-300ER',
        depTime: '06:15',
        arrTime: '11:00',
        duration: '4h 45m',
        stops: '1stop',
        stopsText: '1 Stop via DOH',
        price: Math.round((basePrice - 40) * cabinMultiplier),
        refundable: false,
        baggageIncluded: true,
        timeWindow: 'morning',
        flagship: false
      },
      {
        id: 'fl-4',
        airline: 'GLOBALWINGS',
        flightNum: 'GW-305',
        aircraft: 'Airbus A330-900neo',
        depTime: '11:45',
        arrTime: '17:10',
        duration: '5h 25m',
        stops: '1stop',
        stopsText: '1 Stop via AUH',
        price: Math.round((basePrice - 60) * cabinMultiplier),
        refundable: true,
        baggageIncluded: false,
        timeWindow: 'morning',
        flagship: false
      },
      {
        id: 'fl-5',
        airline: 'AEROVA AIR',
        flightNum: 'AV-890',
        aircraft: 'Boeing 787-9 Dreamliner',
        depTime: '19:40',
        arrTime: '23:05',
        duration: '3h 25m',
        stops: 'nonstop',
        stopsText: 'Non-stop',
        price: Math.round((basePrice + 15) * cabinMultiplier),
        refundable: true,
        baggageIncluded: true,
        timeWindow: 'evening',
        flagship: true
      },
      {
        id: 'fl-6',
        airline: 'NOVA AIRWAYS',
        flightNum: 'NV-602',
        aircraft: 'Boeing 737 MAX 9',
        depTime: '16:10',
        arrTime: '21:50',
        duration: '5h 40m',
        stops: '1stop',
        stopsText: '1 Stop via RUH',
        price: Math.round((basePrice - 50) * cabinMultiplier),
        refundable: false,
        baggageIncluded: true,
        timeWindow: 'afternoon',
        flagship: false
      },
      {
        id: 'fl-7',
        airline: 'ORBIT AIR',
        flightNum: 'OB-118',
        aircraft: 'Airbus A321LR',
        depTime: '22:15',
        arrTime: '06:30',
        duration: '8h 15m',
        stops: '2stop',
        stopsText: '2 Stops',
        price: Math.round((basePrice - 85) * cabinMultiplier),
        refundable: false,
        baggageIncluded: false,
        timeWindow: 'evening',
        flagship: false
      },
      {
        id: 'fl-8',
        airline: 'SKYLINE AIR',
        flightNum: 'SK-990',
        aircraft: 'Boeing 787-8',
        depTime: '13:00',
        arrTime: '16:35',
        duration: '3h 35m',
        stops: 'nonstop',
        stopsText: 'Non-stop',
        price: Math.round((basePrice + 20) * cabinMultiplier),
        refundable: true,
        baggageIncluded: true,
        timeWindow: 'afternoon',
        flagship: false
      }
    ];

    State.allFlights = demoTemplates;
    applyFiltersAndSorting();
  }

  function applyFiltersAndSorting() {
    let list = [...State.allFlights];

    // Stops filter
    list = list.filter(f => State.filters.stops.includes(f.stops));

    // Airlines filter
    list = list.filter(f => State.filters.airlines.includes(f.airline));

    // Max Price
    list = list.filter(f => f.price <= State.filters.maxPrice);

    // Departure Window
    list = list.filter(f => State.filters.departureWindows.includes(f.timeWindow));

    // Refundable
    if (State.filters.refundableOnly) {
      list = list.filter(f => f.refundable);
    }

    // Baggage included
    if (State.filters.baggageIncluded) {
      list = list.filter(f => f.baggageIncluded);
    }

    // Sorting
    if (State.sortOrder === 'cheapest') {
      list.sort((a, b) => a.price - b.price);
    } else if (State.sortOrder === 'fastest') {
      list.sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
    } else if (State.sortOrder === 'earliest') {
      list.sort((a, b) => a.depTime.localeCompare(b.depTime));
    } else if (State.sortOrder === 'latest') {
      list.sort((a, b) => b.depTime.localeCompare(a.depTime));
    } else {
      // Recommended: Flagship first, then price
      list.sort((a, b) => {
        if (a.flagship && !b.flagship) return -1;
        if (!a.flagship && b.flagship) return 1;
        return a.price - b.price;
      });
    }

    State.filteredFlights = list;
    renderFlightResults();
  }

  function renderFlightResults() {
    const container = document.getElementById('flightResultsList');
    const emptyBlock = document.getElementById('noFlightsFoundBlock');
    const countBadge = document.getElementById('resultsCountBadge');
    const summaryRoute = document.getElementById('summaryRouteTxt');
    const summaryMeta = document.getElementById('summaryMetaTxt');

    if (summaryRoute) summaryRoute.textContent = `${State.search.origin.code} → ${State.search.destination.code}`;
    if (summaryMeta) {
      const typeLabel = State.tripType === 'round' ? 'Round Trip' : (State.tripType === 'oneway' ? 'One Way' : 'Multi-City');
      summaryMeta.textContent = `${typeLabel} • ${State.search.departureDate} • ${State.search.passengers.adults} Adult(s) • ${State.search.cabinClass}`;
    }

    if (!container) return;

    if (State.filteredFlights.length === 0) {
      container.innerHTML = '';
      if (emptyBlock) emptyBlock.style.display = 'block';
      if (countBadge) countBadge.textContent = '0 flights found';
      return;
    }

    if (emptyBlock) emptyBlock.style.display = 'none';
    if (countBadge) countBadge.textContent = `${State.filteredFlights.length} flights found`;

    container.innerHTML = State.filteredFlights.map(flight => {
      const isFav = State.favoriteFlightIds.includes(flight.id);
      return `
        <div class="flight-card ${flight.flagship ? 'flagship' : ''}" id="card-${flight.id}">
          <!-- Col 1: Brand -->
          <div class="flight-brand-col">
            <div class="airline-badge">${flight.airline.slice(0, 2)}</div>
            <div>
              <div class="airline-name-txt">${flight.airline}</div>
              <div class="flight-number-txt">${flight.flightNum} • ${flight.aircraft}</div>
              <div style="font-size: 0.72rem; color: var(--gold); margin-top: 2px;">
                ${flight.flagship ? '★ Flagship Carrier' : 'Alliance Partner'}
              </div>
            </div>
          </div>

          <!-- Col 2: Timeline -->
          <div class="flight-timeline-col">
            <div class="time-point">
              <div class="time-val">${flight.depTime}</div>
              <div class="airport-code-label">${State.search.origin.code}</div>
              <div class="city-label-mini">${State.search.origin.city}</div>
            </div>

            <div class="route-mid-visual">
              <div class="duration-txt">${flight.duration}</div>
              <div class="flight-line-graphic"></div>
              <div class="stops-txt ${flight.stops === 'nonstop' ? 'nonstop' : 'has-stops'}">${flight.stopsText}</div>
            </div>

            <div class="time-point">
              <div class="time-val">${flight.arrTime}</div>
              <div class="airport-code-label">${State.search.destination.code}</div>
              <div class="city-label-mini">${State.search.destination.city}</div>
            </div>
          </div>

          <!-- Col 3: Price & Actions -->
          <div class="flight-actions-col">
            <div class="price-tag-wrap">
              <span class="price-sub-label">From / person</span>
              <div class="flight-price-val">${formatMoney(flight.price)}</div>
              <div style="font-size: 0.7rem; color: ${flight.refundable ? 'var(--status-success)' : 'var(--text-dim)'};">
                ${flight.refundable ? '✓ Free Cancellation' : 'Non-refundable'}
              </div>
            </div>

            <div class="flight-card-btns">
              <button type="button" class="btn-fav ${isFav ? 'active' : ''}" onclick="AerovaApp.toggleFavorite('${flight.id}')" title="Save Flight" aria-label="Favorite flight">
                ${isFav ? '♥' : '♡'}
              </button>
              <button type="button" class="btn-details-link" onclick="AerovaApp.openFlightDetailsModal('${flight.id}')">View Details</button>
              <button type="button" class="btn-select-flight" onclick="AerovaApp.selectFlight('${flight.id}')">Select Flight</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function setupFiltersAndSorting() {
    // 1. Sort Tabs
    document.querySelectorAll('.sort-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.sortOrder = btn.getAttribute('data-sort');
        applyFiltersAndSorting();
      });
    });

    // 2. Stops Checkboxes
    document.querySelectorAll('input[name="filterStop"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(document.querySelectorAll('input[name="filterStop"]:checked')).map(c => c.value);
        State.filters.stops = checked;
        applyFiltersAndSorting();
      });
    });

    // 3. Airline Checkboxes
    document.querySelectorAll('input[name="filterAirline"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(document.querySelectorAll('input[name="filterAirline"]:checked')).map(c => c.value);
        State.filters.airlines = checked;
        applyFiltersAndSorting();
      });
    });

    // 4. Departure Time Checkboxes
    document.querySelectorAll('input[name="filterTime"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(document.querySelectorAll('input[name="filterTime"]:checked')).map(c => c.value);
        State.filters.departureWindows = checked;
        applyFiltersAndSorting();
      });
    });

    // 5. Price Range Slider
    const slider = document.getElementById('priceRangeSlider');
    const sliderVal = document.getElementById('priceSliderValueDisplay');
    slider?.addEventListener('input', (e) => {
      State.filters.maxPrice = parseFloat(e.target.value);
      if (sliderVal) sliderVal.textContent = `$${State.filters.maxPrice}`;
      applyFiltersAndSorting();
    });

    // 6. Policy Checkboxes
    document.getElementById('filterRefundableOnly')?.addEventListener('change', (e) => {
      State.filters.refundableOnly = e.target.checked;
      applyFiltersAndSorting();
    });

    document.getElementById('filterBaggageIncluded')?.addEventListener('change', (e) => {
      State.filters.baggageIncluded = e.target.checked;
      applyFiltersAndSorting();
    });

    // 7. Reset Filters Button
    function resetAllFilters() {
      State.filters = {
        stops: ['nonstop', '1stop', '2stop'],
        airlines: ['AEROVA AIR', 'SKYLINE AIR', 'GLOBALWINGS', 'NOVA AIRWAYS', 'ORBIT AIR'],
        maxPrice: 2500,
        departureWindows: ['morning', 'afternoon', 'evening'],
        refundableOnly: false,
        baggageIncluded: false
      };

      document.querySelectorAll('input[name="filterStop"], input[name="filterAirline"], input[name="filterTime"]').forEach(c => c.checked = true);
      const ref = document.getElementById('filterRefundableOnly');
      const bag = document.getElementById('filterBaggageIncluded');
      if (ref) ref.checked = false;
      if (bag) bag.checked = false;

      if (slider) {
        slider.value = 2500;
        if (sliderVal) sliderVal.textContent = '$2,500';
      }

      applyFiltersAndSorting();
      showToast('Filters reset to default.', 'info');
    }

    document.getElementById('btnClearFilters')?.addEventListener('click', resetAllFilters);
    document.getElementById('btnResetFiltersEmpty')?.addEventListener('click', resetAllFilters);
  }

  // ==========================================================================
  // 9. FLIGHT DETAILS MODAL
  // ==========================================================================
  function openFlightDetailsModal(flightId) {
    const flight = State.allFlights.find(f => f.id === flightId);
    if (!flight) return;

    const content = document.getElementById('modalFlightDetailsContent');
    if (!content) return;

    content.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--gold); text-transform: uppercase; font-weight: 800;">Flight Specification</span>
          <h3 style="font-size: 1.4rem; color: #ffffff;">${flight.airline} • ${flight.flightNum}</h3>
          <p style="font-size: 0.85rem;">Aircraft: ${flight.aircraft}</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.6rem; font-weight: 900; color: var(--gold-light);">${formatMoney(flight.price)}</div>
          <span style="font-size: 0.72rem; color: var(--text-dim);">per traveler</span>
        </div>
      </div>

      <!-- Modal Tabs -->
      <div class="modal-tabs-header">
        <button class="modal-tab-btn active" onclick="AerovaApp.switchModalTab('overview')">Flight Details</button>
        <button class="modal-tab-btn" onclick="AerovaApp.switchModalTab('amenities')">Amenities</button>
        <button class="modal-tab-btn" onclick="AerovaApp.switchModalTab('baggage')">Baggage Rules</button>
        <button class="modal-tab-btn" onclick="AerovaApp.switchModalTab('policies')">Fare Policies</button>
      </div>

      <!-- Tab Content Area -->
      <div id="modalTabContent" style="min-height: 180px;">
        <div id="tabContentOverview">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 1rem;">
            <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Departure</div>
              <strong style="font-size: 1.2rem; color: #ffffff;">${flight.depTime}</strong>
              <div>${State.search.origin.name} (${State.search.origin.code})</div>
            </div>
            <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Arrival</div>
              <strong style="font-size: 1.2rem; color: #ffffff;">${flight.arrTime}</strong>
              <div>${State.search.destination.name} (${State.search.destination.code})</div>
            </div>
          </div>
          <div style="margin-top: 1.25rem; font-size: 0.88rem; color: var(--text-muted); line-height: 1.6;">
            Estimated flight duration is <strong>${flight.duration}</strong>. Operates with state-of-the-art fly-by-wire avionics, higher cabin humidity, and oversized dimmable smart windows.
          </div>
        </div>

        <div id="tabContentAmenities" style="display: none; margin-top: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.88rem;">
            <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm);">📡 High-Speed Satellite Wi-Fi</div>
            <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm);">🔌 USB-C & AC In-Seat Power</div>
            <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm);">🎬 4K Touchscreen In-Flight Audio/Video</div>
            <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm);">🍷 Complimentary Dining & Beverages</div>
          </div>
        </div>

        <div id="tabContentBaggage" style="display: none; margin-top: 1rem; font-size: 0.88rem; line-height: 1.6;">
          <ul style="padding-left: 1.25rem; color: var(--text-muted);">
            <li><strong>Personal Item:</strong> 1 personal item (up to 7kg) included free.</li>
            <li><strong>Cabin Carry-on:</strong> 1 standard carry-on (up to 10kg) included free.</li>
            <li><strong>Checked Bag:</strong> 23kg standard bag allowance. Extra bags available for $45 during booking.</li>
          </ul>
        </div>

        <div id="tabContentPolicies" style="display: none; margin-top: 1rem; font-size: 0.88rem; line-height: 1.6;">
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--status-success); border-radius: var(--radius-sm); padding: 0.85rem; margin-bottom: 1rem;">
            <strong style="color: var(--status-success);">Cancellation Policy:</strong> ${flight.refundable ? '100% refundable up to 24 hours prior to departure.' : 'Non-refundable fare. Credit vouchers issued upon early cancellation.'}
          </div>
          <p style="color: var(--text-muted);">Flight date changes permitted with a $25 administrative fare adjustment fee plus any applicable fare differences.</p>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
        <button class="btn-secondary-sm" onclick="AerovaApp.closeModal('modalFlightDetails')">Close</button>
        <button class="btn-primary-sm" onclick="AerovaApp.closeModal('modalFlightDetails'); AerovaApp.selectFlight('${flight.id}')">Select This Flight</button>
      </div>
    `;

    openModal('modalFlightDetails');
  }

  function switchModalTab(tabKey) {
    document.querySelectorAll('.modal-tabs-header .modal-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const tabs = ['overview', 'amenities', 'baggage', 'policies'];
    tabs.forEach(t => {
      const el = document.getElementById(`tabContent${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (el) el.style.display = t === tabKey ? 'block' : 'none';
    });
  }

  // ==========================================================================
  // 10. MULTI-STEP BOOKING FLOW CONTROLLER
  // ==========================================================================
  function selectFlight(flightId) {
    const flight = State.allFlights.find(f => f.id === flightId);
    if (!flight) return;

    State.currentFlight = flight;
    State.bookingData.pnr = generatePNR();
    State.bookingData.fareSummary.base = flight.price * State.search.passengers.adults;
    State.bookingData.fareSummary.taxes = Math.round(State.bookingData.fareSummary.base * 0.14);

    // Initialize default passenger form state
    initPassengerForms();
    renderInteractiveSeatMap();
    renderStickyFareSummary();

    // Move to step 3 (Passengers)
    goToBookingStep(3);
    navigateTo('booking');
    showToast(`Flight ${flight.flightNum} selected. Enter traveler details.`, 'success');
  }

  function generatePNR() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = 'AV';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  function initPassengerForms() {
    const container = document.getElementById('passengerFormsList');
    if (!container) return;

    const total = State.search.passengers.adults + State.search.passengers.children;
    let html = '';

    for (let i = 0; i < total; i++) {
      const isAdult = i < State.search.passengers.adults;
      const typeLabel = isAdult ? 'Adult Traveler' : 'Child Traveler';
      const defFirst = i === 0 ? 'Asfandyar' : `Traveler ${i + 1}`;
      const defLast = i === 0 ? 'Khan' : 'Khan';

      html += `
        <div class="passenger-form-group">
          <div class="passenger-heading-row">
            <h4 style="font-size: 1.1rem; color: #ffffff;">Traveler ${i + 1} (${typeLabel})</h4>
            <span style="font-size: 0.78rem; color: var(--gold);">Seat: Assigned in Step 4</span>
          </div>

          <div class="form-inputs-grid-3">
            <div>
              <label class="input-box-label">Title</label>
              <select class="styled-select pass-title" data-idx="${i}">
                <option value="Mr">Mr.</option>
                <option value="Mrs">Mrs.</option>
                <option value="Ms">Ms.</option>
                <option value="Dr">Dr.</option>
              </select>
            </div>
            <div>
              <label class="input-box-label">First / Given Name *</label>
              <input type="text" class="styled-input pass-first" data-idx="${i}" value="${defFirst}" required>
            </div>
            <div>
              <label class="input-box-label">Last / Surname *</label>
              <input type="text" class="styled-input pass-last" data-idx="${i}" value="${defLast}" required>
            </div>
          </div>

          <div class="form-inputs-grid-3">
            <div>
              <label class="input-box-label">Date of Birth *</label>
              <input type="date" class="styled-input pass-dob" data-idx="${i}" value="${isAdult ? '1996-05-12' : '2016-08-20'}" required>
            </div>
            <div>
              <label class="input-box-label">Gender</label>
              <select class="styled-select pass-gender" data-idx="${i}">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Undisclosed</option>
              </select>
            </div>
            <div>
              <label class="input-box-label">Nationality</label>
              <input type="text" class="styled-input pass-nat" data-idx="${i}" value="Pakistan">
            </div>
          </div>

          <div class="form-inputs-grid-2">
            <div>
              <label class="input-box-label">Passport / National ID Number *</label>
              <input type="text" class="styled-input pass-doc" data-idx="${i}" value="A8921479${i}" required style="text-transform: uppercase;">
            </div>
            <div>
              <label class="input-box-label">Passport Expiry *</label>
              <input type="date" class="styled-input pass-expiry" data-idx="${i}" value="2032-11-20" required>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function setupBookingFlowControls() {
    const nextBtn = document.getElementById('btnStepperNext');
    const backBtn = document.getElementById('btnStepperBack');

    nextBtn?.addEventListener('click', handleStepperNext);
    backBtn?.addEventListener('click', handleStepperBack);

    // Stepper node click navigation for completed steps
    document.querySelectorAll('.step-node').forEach(node => {
      node.addEventListener('click', () => {
        const stepNum = parseInt(node.getAttribute('data-step'), 10);
        if (node.classList.contains('completed') && stepNum < State.bookingStep) {
          goToBookingStep(stepNum);
        }
      });
    });

    // Extras Cards Selection
    setupExtrasInteractions();

    // Promo Code Box
    document.getElementById('btnApplyPromo')?.addEventListener('click', applyPromoCode);

    // Payment Form Interactions
    setupPaymentForm();

    // Confirmation Buttons
    setupConfirmationActions();
  }

  function goToBookingStep(step) {
    State.bookingStep = step;

    // Update Stepper Nodes UI
    for (let i = 1; i <= 7; i++) {
      const node = document.getElementById(`stepNode${i}`);
      if (!node) continue;
      node.classList.remove('active', 'completed');
      if (i < step) node.classList.add('completed');
      else if (i === step) node.classList.add('active');
    }

    // Hide all panels
    const panels = {
      3: 'stepPanelPassenger',
      4: 'stepPanelSeats',
      5: 'stepPanelExtras',
      6: 'stepPanelPayment',
      7: 'stepPanelConfirmation'
    };

    Object.values(panels).forEach(pId => {
      document.getElementById(pId)?.classList.remove('active');
    });

    const activePanel = document.getElementById(panels[step]);
    if (activePanel) activePanel.classList.add('active');

    // Update Next/Back button labels and visibility
    const nextBtn = document.getElementById('btnStepperNext');
    const backBtn = document.getElementById('btnStepperBack');
    const navBar = document.getElementById('stepperNavControls');
    const stickySummary = document.getElementById('stickyFareSummary');

    if (step === 7) {
      // Confirmation page: Hide stepper buttons and fare summary
      if (navBar) navBar.style.display = 'none';
      if (stickySummary) stickySummary.style.display = 'none';
      renderConfirmationBoardingPass();
    } else {
      if (navBar) navBar.style.display = 'flex';
      if (stickySummary) stickySummary.style.display = 'block';

      if (step === 3) {
        if (backBtn) backBtn.textContent = '← Back to Flights';
        if (nextBtn) nextBtn.textContent = 'Continue to Seats →';
      } else if (step === 4) {
        if (backBtn) backBtn.textContent = '← Back to Travelers';
        if (nextBtn) nextBtn.textContent = 'Continue to Extras →';
      } else if (step === 5) {
        if (backBtn) backBtn.textContent = '← Back to Seats';
        if (nextBtn) nextBtn.textContent = 'Review & Checkout →';
      } else if (step === 6) {
        if (backBtn) backBtn.textContent = '← Back to Extras';
        if (nextBtn) nextBtn.textContent = 'Confirm & Pay 🔒';
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStepperNext() {
    if (State.bookingStep === 3) {
      // Validate passenger form
      const firstInputs = document.querySelectorAll('.pass-first');
      const lastInputs = document.querySelectorAll('.pass-last');
      const docInputs = document.querySelectorAll('.pass-doc');
      let valid = true;

      firstInputs.forEach(i => { if (!i.value.trim()) valid = false; });
      lastInputs.forEach(i => { if (!i.value.trim()) valid = false; });
      docInputs.forEach(i => { if (!i.value.trim()) valid = false; });

      const email = document.getElementById('contactEmail')?.value;
      const phone = document.getElementById('contactPhone')?.value;
      if (!email || !phone) valid = false;

      if (!valid) {
        showToast('Please fill all required traveler names and document numbers.', 'warning');
        return;
      }

      // Save passenger details to State
      State.bookingData.passengerDetails = [];
      firstInputs.forEach((inp, idx) => {
        State.bookingData.passengerDetails.push({
          firstName: inp.value.trim(),
          lastName: lastInputs[idx].value.trim(),
          docNum: docInputs[idx].value.trim()
        });
      });

      goToBookingStep(4);
    } else if (State.bookingStep === 4) {
      goToBookingStep(5);
    } else if (State.bookingStep === 5) {
      goToBookingStep(6);
    } else if (State.bookingStep === 6) {
      // Execute demo payment
      executeDemoPayment();
    }
  }

  function handleStepperBack() {
    if (State.bookingStep === 3) {
      navigateTo('home');
    } else if (State.bookingStep > 3) {
      goToBookingStep(State.bookingStep - 1);
    }
  }

  // ==========================================================================
  // 11. INTERACTIVE AIRPLANE SEAT MAP ENGINE
  // ==========================================================================
  function renderInteractiveSeatMap() {
    const premContainer = document.getElementById('premiumSeatsGrid');
    const econContainer = document.getElementById('economySeatsGrid');
    if (!premContainer || !econContainer) return;

    // Realistic occupied seats set
    const occupiedSeats = new Set(['1C', '2A', '2D', '4B', '5C', '8B', '8E', '10A', '10F', '12B', '15C', '16D', '18A']);

    // 1. First & Business Rows (Rows 1-3, 2-2 configuration)
    let premHtml = '';
    for (let r = 1; r <= 3; r++) {
      premHtml += `
        <div class="plane-seat-row">
          <span class="seat-row-num">${r}</span>
          ${renderSeatBtn(`${r}A`, 'Window', occupiedSeats, 45, 'Business')}
          ${renderSeatBtn(`${r}B`, 'Aisle', occupiedSeats, 45, 'Business')}
          <div class="plane-aisle">|</div>
          ${renderSeatBtn(`${r}C`, 'Aisle', occupiedSeats, 45, 'Business')}
          ${renderSeatBtn(`${r}D`, 'Window', occupiedSeats, 45, 'Business')}
        </div>
      `;
    }
    premContainer.innerHTML = premHtml;

    // 2. Economy Rows (Rows 7-18, 3-3 configuration: A B C - aisle - D E F)
    let econHtml = '';
    for (let r = 7; r <= 18; r++) {
      const isLegroom = (r === 7 || r === 12);
      const legroomFee = isLegroom ? 35 : 0;
      econHtml += `
        <div class="plane-seat-row">
          <span class="seat-row-num">${r}</span>
          ${renderSeatBtn(`${r}A`, 'Window', occupiedSeats, legroomFee, 'Economy', isLegroom)}
          ${renderSeatBtn(`${r}B`, 'Middle', occupiedSeats, legroomFee, 'Economy', isLegroom)}
          ${renderSeatBtn(`${r}C`, 'Aisle', occupiedSeats, legroomFee, 'Economy', isLegroom)}
          <div class="plane-aisle">|</div>
          ${renderSeatBtn(`${r}D`, 'Aisle', occupiedSeats, legroomFee, 'Economy', isLegroom)}
          ${renderSeatBtn(`${r}E`, 'Middle', occupiedSeats, legroomFee, 'Economy', isLegroom)}
          ${renderSeatBtn(`${r}F`, 'Window', occupiedSeats, legroomFee, 'Economy', isLegroom)}
        </div>
      `;
    }
    econContainer.innerHTML = econHtml;

    // Seat click event delegation
    const onSeatClick = (e) => {
      const btn = e.target.closest('.plane-seat-btn');
      if (!btn || btn.classList.contains('occupied')) return;

      document.querySelectorAll('.plane-seat-btn.selected').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const seatCode = btn.getAttribute('data-seat');
      const seatFee = parseFloat(btn.getAttribute('data-fee') || '0');
      const seatType = btn.getAttribute('data-type');
      const cabin = btn.getAttribute('data-cabin');

      State.bookingData.selectedSeat = seatCode;
      State.bookingData.seatFee = seatFee;

      // Update UI badges
      const indicator = document.getElementById('seatSelectionIndicator');
      const assignedCode = document.getElementById('seatAssignedCode');
      const assignedFee = document.getElementById('seatAssignedFee');

      if (indicator) indicator.textContent = `Selected Seat: ${seatCode}`;
      if (assignedCode) assignedCode.textContent = `${seatCode} (${seatType}, ${cabin})`;
      if (assignedFee) assignedFee.textContent = seatFee > 0 ? `+${formatMoney(seatFee)}` : 'Included ($0)';

      renderStickyFareSummary();
      showToast(`Seat ${seatCode} selected (${seatType}).`, 'info');
    };

    premContainer.addEventListener('click', onSeatClick);
    econContainer.addEventListener('click', onSeatClick);
  }

  function renderSeatBtn(code, type, occupiedSet, fee, cabin, isLegroom = false) {
    const isOccupied = occupiedSet.has(code);
    const isSelected = State.bookingData.selectedSeat === code;
    let extraClass = '';
    if (isOccupied) extraClass = 'occupied';
    else if (isSelected) extraClass = 'selected';
    else if (isLegroom) extraClass = 'legroom';

    return `
      <button type="button" class="plane-seat-btn ${extraClass}" 
              data-seat="${code}" 
              data-type="${type}" 
              data-fee="${fee}" 
              data-cabin="${cabin}" 
              ${isOccupied ? 'disabled' : ''} 
              title="${code} - ${type} (${isOccupied ? 'Occupied' : (fee > 0 ? `+$${fee}` : 'Free')})">
        ${code.slice(-1)}
      </button>
    `;
  }

  // ==========================================================================
  // 12. BAGGAGE, EXTRAS & PROMO ENGINE
  // ==========================================================================
  function setupExtrasInteractions() {
    // Checked Bag
    document.getElementById('cardExtraCheckedBag')?.addEventListener('click', function () {
      this.classList.toggle('selected');
      State.bookingData.baggage.checkedBag = this.classList.contains('selected');
      renderStickyFareSummary();
    });

    // Heavy Bag
    document.getElementById('cardExtraHeavyBag')?.addEventListener('click', function () {
      this.classList.toggle('selected');
      State.bookingData.baggage.heavyBag = this.classList.contains('selected');
      renderStickyFareSummary();
    });

    // Priority Boarding
    document.getElementById('extraPriority')?.addEventListener('click', function () {
      this.classList.toggle('selected');
      State.bookingData.extras.priority = this.classList.contains('selected');
      renderStickyFareSummary();
    });

    // VIP Lounge
    document.getElementById('extraLounge')?.addEventListener('click', function () {
      this.classList.toggle('selected');
      State.bookingData.extras.lounge = this.classList.contains('selected');
      renderStickyFareSummary();
    });

    // Gourmet Meal
    document.getElementById('extraMeal')?.addEventListener('click', function () {
      this.classList.toggle('selected');
      State.bookingData.extras.meal = this.classList.contains('selected');
      renderStickyFareSummary();
    });

    // Travel Shield
    document.getElementById('extraInsurance')?.addEventListener('click', function () {
      this.classList.toggle('selected');
      State.bookingData.extras.insurance = this.classList.contains('selected');
      renderStickyFareSummary();
    });
  }

  function applyPromoCode() {
    const input = document.getElementById('promoCodeInput');
    const msg = document.getElementById('promoStatusMsg');
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      showToast('Please enter a promotional voucher code.', 'warning');
      return;
    }

    if (PROMO_CODES[code]) {
      State.bookingData.appliedPromo = { code, ...PROMO_CODES[code] };
      msg.style.display = 'block';
      msg.style.color = 'var(--status-success)';
      msg.textContent = `✓ Code ${code} applied: ${PROMO_CODES[code].label}`;
      showToast(`Promo code ${code} applied successfully!`, 'success');
      renderStickyFareSummary();
    } else {
      State.bookingData.appliedPromo = null;
      msg.style.display = 'block';
      msg.style.color = 'var(--status-error)';
      msg.textContent = `✕ Invalid code. Try FLY10 or AEROVA20`;
      showToast('Invalid promotional code.', 'error');
      renderStickyFareSummary();
    }
  }

  function renderStickyFareSummary() {
    if (!State.currentFlight) return;

    // Flight snippet
    const airlineTxt = document.getElementById('fareAirlineTxt');
    const cabinTxt = document.getElementById('fareCabinTxt');
    const routeDatesTxt = document.getElementById('fareRouteDatesTxt');

    if (airlineTxt) airlineTxt.textContent = `${State.currentFlight.airline} (${State.currentFlight.flightNum})`;
    if (cabinTxt) cabinTxt.textContent = State.search.cabinClass;
    if (routeDatesTxt) routeDatesTxt.textContent = `${State.search.origin.code} → ${State.search.destination.code} • ${State.currentFlight.stopsText}`;

    // Base fare & taxes
    const baseAirfare = State.currentFlight.price * State.search.passengers.adults;
    const taxes = Math.round(baseAirfare * 0.14);

    // Seat fees
    const seatFee = State.bookingData.seatFee;

    // Baggage fees
    let baggageFee = 0;
    if (State.bookingData.baggage.checkedBag) baggageFee += 45;
    if (State.bookingData.baggage.heavyBag) baggageFee += 75;

    // Extras fees
    let extrasFee = 0;
    if (State.bookingData.extras.priority) extrasFee += 25;
    if (State.bookingData.extras.lounge) extrasFee += 65;
    if (State.bookingData.extras.meal) extrasFee += 30;
    if (State.bookingData.extras.insurance) extrasFee += 40;

    // Promo Discount
    let discount = 0;
    const discountRow = document.getElementById('fareDiscountRow');
    const discountLabel = document.getElementById('fareDiscountLabel');
    const discountVal = document.getElementById('fareDiscountVal');

    if (State.bookingData.appliedPromo) {
      if (State.bookingData.appliedPromo.type === 'percent') {
        discount = Math.round(baseAirfare * State.bookingData.appliedPromo.value);
      } else {
        discount = State.bookingData.appliedPromo.value;
      }
      if (discountRow) discountRow.style.display = 'flex';
      if (discountLabel) discountLabel.textContent = `Discount (${State.bookingData.appliedPromo.code})`;
      if (discountVal) discountVal.textContent = `-${formatMoney(discount)}`;
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    const total = Math.max(0, baseAirfare + taxes + seatFee + baggageFee + extrasFee - discount);

    // Save into state
    State.bookingData.fareSummary = {
      base: baseAirfare,
      taxes,
      seat: seatFee,
      baggage: baggageFee,
      extras: extrasFee,
      discount,
      total
    };

    // Update DOM
    const baseEl = document.getElementById('fareBaseAirfareVal');
    const taxesEl = document.getElementById('fareTaxesVal');
    const seatEl = document.getElementById('fareSeatVal');
    const bagEl = document.getElementById('fareBaggageVal');
    const extEl = document.getElementById('fareExtrasVal');
    const totalEl = document.getElementById('fareTotalAmountVal');

    if (baseEl) baseEl.textContent = formatMoney(baseAirfare);
    if (taxesEl) taxesEl.textContent = formatMoney(taxes);
    if (seatEl) seatEl.textContent = formatMoney(seatFee);
    if (bagEl) bagEl.textContent = formatMoney(baggageFee);
    if (extEl) extEl.textContent = formatMoney(extrasFee);
    if (totalEl) totalEl.textContent = formatMoney(total);
  }

  // ==========================================================================
  // 13. PAYMENT & CHECKOUT ENGINE
  // ==========================================================================
  function setupPaymentForm() {
    // Tabs
    document.querySelectorAll('.pay-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pay-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const method = btn.getAttribute('data-pay');
        const visual = document.getElementById('creditCardVisual');
        if (visual) visual.style.display = method === 'card' ? 'flex' : 'none';
      });
    });

    // Live Card Formatting & Preview
    const cardNumInput = document.getElementById('cardNumber');
    const cardHolderInput = document.getElementById('cardHolder');
    const cardExpiryInput = document.getElementById('cardExpiry');
    const cardCvvInput = document.getElementById('cardCvv');

    const previewNum = document.getElementById('cardPreviewNumber');
    const previewHolder = document.getElementById('cardPreviewHolder');
    const previewExpiry = document.getElementById('cardPreviewExpiry');
    const brandLogo = document.getElementById('cardBrandLogo');

    cardNumInput?.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      let formatted = val.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = formatted;

      if (previewNum) {
        previewNum.textContent = formatted || '•••• •••• •••• 4242';
      }

      // Brand detection
      if (brandLogo) {
        if (val.startsWith('4')) brandLogo.textContent = 'VISA';
        else if (val.startsWith('5')) brandLogo.textContent = 'MASTERCARD';
        else if (val.startsWith('34') || val.startsWith('37')) brandLogo.textContent = 'AMEX';
        else brandLogo.textContent = 'CARD';
      }
    });

    cardHolderInput?.addEventListener('input', (e) => {
      if (previewHolder) previewHolder.textContent = e.target.value.toUpperCase() || 'ASFANDYAR KHAN';
    });

    cardExpiryInput?.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      e.target.value = val;
      if (previewExpiry) previewExpiry.textContent = val || '12/28';
    });
  }

  function executeDemoPayment() {
    const cardNum = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
    const cardExp = document.getElementById('cardExpiry')?.value;
    const cardCvv = document.getElementById('cardCvv')?.value;
    const cardHolder = document.getElementById('cardHolder')?.value;

    if (!cardNum || cardNum.length < 15 || !cardExp || !cardCvv || !cardHolder) {
      showToast('Please provide complete payment card information for demo authorization.', 'warning');
      return;
    }

    // Prepare confirmed booking record
    const passengerName = State.bookingData.passengerDetails[0]?.firstName + ' ' + State.bookingData.passengerDetails[0]?.lastName;
    const confirmedRecord = {
      pnr: State.bookingData.pnr,
      airline: State.currentFlight.airline,
      flightNum: State.currentFlight.flightNum,
      aircraft: State.currentFlight.aircraft,
      origin: { ...State.search.origin },
      destination: { ...State.search.destination },
      date: State.search.departureDate,
      departureTime: State.currentFlight.depTime,
      arrivalTime: State.currentFlight.arrTime,
      duration: State.currentFlight.duration,
      stops: State.currentFlight.stopsText,
      seat: State.bookingData.selectedSeat,
      cabin: State.search.cabinClass,
      passengerName: passengerName || 'Asfandyar Khan',
      total: State.bookingData.fareSummary.total,
      status: 'confirmed',
      gate: 'B' + (Math.floor(Math.random() * 20) + 1).toString().padStart(2, '0'),
      zone: 'Zone ' + (Math.floor(Math.random() * 3) + 1),
      bookedAt: new Date().toISOString()
    };

    // Save to local storage
    State.myBookings.unshift(confirmedRecord);
    localStorage.setItem('aerova_bookings', JSON.stringify(State.myBookings));

    // Push notification
    State.notifications.unshift({
      id: Date.now(),
      title: `Booking ${confirmedRecord.pnr} Confirmed`,
      time: 'Just now',
      read: false,
      body: `Your ticket on ${confirmedRecord.airline} (${confirmedRecord.origin.code} → ${confirmedRecord.destination.code}) is confirmed. Seat ${confirmedRecord.seat}.`
    });
    localStorage.setItem('aerova_notifications', JSON.stringify(State.notifications));
    updateNotificationBadge();

    showToast('Demo payment authorized successfully! Issuing boarding pass...', 'success');

    // Move to step 7
    setTimeout(() => {
      goToBookingStep(7);
    }, 600);
  }

  // ==========================================================================
  // 14. E-TICKET, PROCEDURAL QR CANVAS & EXPORTS
  // ==========================================================================
  function renderConfirmationBoardingPass() {
    const pnr = State.bookingData.pnr;
    const pnrEl = document.getElementById('confirmedPnrTxt');
    const pnrStub = document.getElementById('ticketStubPnr');
    const flightNum = document.getElementById('ticketFlightNumber');
    const origCode = document.getElementById('ticketOriginCode');
    const origCity = document.getElementById('ticketOriginCity');
    const destCode = document.getElementById('ticketDestCode');
    const destCity = document.getElementById('ticketDestCity');
    const depTime = document.getElementById('ticketDepartureTime');
    const arrTime = document.getElementById('ticketArrivalTime');
    const duration = document.getElementById('ticketDuration');
    const stops = document.getElementById('ticketStops');
    const passName = document.getElementById('ticketPassengerName');
    const fDate = document.getElementById('ticketFlightDate');
    const seat = document.getElementById('ticketSeatNumber');
    const gateZone = document.getElementById('ticketGateZone');

    if (pnrEl) pnrEl.textContent = pnr;
    if (pnrStub) pnrStub.textContent = pnr;
    if (flightNum) flightNum.textContent = `FLIGHT ${State.currentFlight.flightNum}`;
    if (origCode) origCode.textContent = State.search.origin.code;
    if (origCity) origCity.textContent = `${State.search.origin.city} (${State.search.origin.code})`;
    if (destCode) destCode.textContent = State.search.destination.code;
    if (destCity) destCity.textContent = `${State.search.destination.city} (${State.search.destination.code})`;
    if (depTime) depTime.textContent = State.currentFlight.depTime;
    if (arrTime) arrTime.textContent = State.currentFlight.arrTime;
    if (duration) duration.textContent = State.currentFlight.duration;
    if (stops) stops.textContent = State.currentFlight.stopsText;
    
    const pName = State.bookingData.passengerDetails[0]?.firstName + ' ' + State.bookingData.passengerDetails[0]?.lastName;
    if (passName) passName.textContent = pName || 'Asfandyar Khan';
    if (fDate) fDate.textContent = State.search.departureDate;
    if (seat) seat.textContent = State.bookingData.selectedSeat;
    if (gateZone) gateZone.textContent = 'B12 • Zone 2';

    // Generate Procedural Offline QR Code on Canvas
    generateProceduralQR('boardingQrCanvas', `AEROVA:${pnr}:${State.currentFlight.flightNum}:${State.bookingData.selectedSeat}`);
  }

  // Native procedural QR matrix drawer without any external CDN
  function generateProceduralQR(canvasId, text) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 100;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Deterministic hash based on text string
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 21; // Standard QR Version 1 grid
    const cellSize = Math.floor(size / gridSize);
    const offset = Math.floor((size - gridSize * cellSize) / 2);

    ctx.fillStyle = '#060c18';

    // Helper to draw position detection patterns in corners
    function drawCorner(r, c) {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            ctx.fillRect(offset + (c + j) * cellSize, offset + (r + i) * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    drawCorner(0, 0); // Top-left
    drawCorner(0, 14); // Top-right
    drawCorner(14, 0); // Bottom-left

    // Pseudo-random pseudo-data matrix
    let seed = Math.abs(hash);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip corner markers
        if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
        
        seed = (seed * 9301 + 49297) % 233280;
        if ((seed / 233280) > 0.45) {
          ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  function setupConfirmationActions() {
    // Print
    document.getElementById('btnPrintTicket')?.addEventListener('click', () => {
      window.print();
    });

    // Download JSON Ticket
    document.getElementById('btnDownloadJson')?.addEventListener('click', () => {
      const ticketData = {
        platform: 'AEROVA Flagship Travel',
        bookingReference: State.bookingData.pnr,
        flight: State.currentFlight,
        passenger: State.bookingData.passengerDetails[0] || { name: 'Asfandyar Khan' },
        route: {
          from: State.search.origin,
          to: State.search.destination,
          date: State.search.departureDate
        },
        seat: State.bookingData.selectedSeat,
        cabinClass: State.search.cabinClass,
        totalPaidUSD: State.bookingData.fareSummary.total,
        issuedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AEROVA_Ticket_${State.bookingData.pnr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('E-ticket reservation data downloaded.', 'success');
    });

    // Add to Calendar (.ics format)
    document.getElementById('btnAddCalendar')?.addEventListener('click', () => {
      const depTimeClean = State.currentFlight.depTime.replace(':', '') + '00';
      const arrTimeClean = State.currentFlight.arrTime.replace(':', '') + '00';
      const dateClean = State.search.departureDate.replace(/-/g, '');

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AEROVA Airlines//Flight Reservation//EN',
        'BEGIN:VEVENT',
        `UID:${State.bookingData.pnr}@aerova.com`,
        `DTSTAMP:${dateClean}T000000Z`,
        `DTSTART:${dateClean}T${depTimeClean}Z`,
        `DTEND:${dateClean}T${arrTimeClean}Z`,
        `SUMMARY:Flight ${State.currentFlight.flightNum} (${State.search.origin.code} to ${State.search.destination.code})`,
        `DESCRIPTION:AEROVA Booking Reference: ${State.bookingData.pnr}. Seat ${State.bookingData.selectedSeat}.`,
        `LOCATION:${State.search.origin.name}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Flight_${State.currentFlight.flightNum}_${State.bookingData.pnr}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Flight added to calendar (.ics download).', 'success');
    });

    // Manage This Booking
    document.getElementById('btnManageThisBooking')?.addEventListener('click', () => {
      navigateTo('bookings');
    });

    // Back to Home
    document.getElementById('btnBackToHomeConfirmed')?.addEventListener('click', () => {
      navigateTo('home');
    });
  }

  // ==========================================================================
  // 15. MY BOOKINGS & MANAGE BOOKING DASHBOARD
  // ==========================================================================
  function renderBookings() {
    const container = document.getElementById('bookingsCardsContainer');
    if (!container) return;

    // Filter by active tab (upcoming / past / cancelled)
    const activeTab = document.querySelector('.booking-tab-item.active')?.getAttribute('data-bktab') || 'upcoming';
    
    let list = State.myBookings;
    if (activeTab === 'cancelled') {
      list = list.filter(b => b.status === 'cancelled');
    } else if (activeTab === 'past') {
      list = list.filter(b => b.status === 'completed');
    } else {
      // Upcoming
      list = list.filter(b => b.status === 'confirmed' || b.status === 'checked-in');
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✈</div>
          <h4>No ${activeTab} reservations found</h4>
          <p style="margin: 0.5rem auto 1.5rem; max-width: 380px;">Book a flight to discover world-class service with AEROVA.</p>
          <button class="btn-primary-sm" onclick="AerovaApp.navigateTo('home')">Search Flights</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(bk => `
      <div class="booking-record-card" id="bkcard-${bk.pnr}">
        <div>
          <span class="booking-status-badge ${bk.status}">${bk.status}</span>
          <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${bk.origin.code} → ${bk.destination.code}</div>
          <div style="font-size: 0.8rem; color: var(--text-dim);">${bk.airline} • Flight ${bk.flightNum}</div>
          <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--gold); margin-top: 0.35rem;">PNR: ${bk.pnr}</div>
        </div>

        <div>
          <div style="display: flex; align-items: baseline; gap: 0.5rem;">
            <strong style="color: #ffffff; font-size: 1.05rem;">${bk.departureTime}</strong>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${bk.date}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
            Passenger: <strong style="color: #ffffff;">${bk.passengerName}</strong> • Seat: <strong style="color: var(--gold);">${bk.seat}</strong>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 0.2rem;">
            Cabin: ${bk.cabin} • Gate: ${bk.gate || 'TBD'}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.6rem;">
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--gold-light);">${formatMoney(bk.total)}</div>
          <button class="btn-secondary-sm" onclick="AerovaApp.openManageBookingModal('${bk.pnr}')" style="width: 100%;">
            Manage Booking
          </button>
        </div>
      </div>
    `).join('');
  }

  function setupBookingsTabs() {
    document.querySelectorAll('.booking-tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.booking-tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderBookings();
      });
    });
  }

  function openManageBookingModal(pnr) {
    const booking = State.myBookings.find(b => b.pnr === pnr);
    if (!booking) {
      showToast('Booking reference not found.', 'error');
      return;
    }

    const modalContent = document.getElementById('modalManageContent');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <span style="font-size: 0.75rem; color: var(--gold); text-transform: uppercase; font-weight: 800;">Manage Reservation</span>
        <h3 style="font-size: 1.35rem; color: #ffffff;">${booking.origin.code} to ${booking.destination.code} (${booking.airline})</h3>
        <div style="font-size: 0.85rem; color: var(--text-muted);">PNR: <strong style="color: var(--gold);">${booking.pnr}</strong> • Date: ${booking.date}</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Assigned Seat</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">Current: ${booking.seat} (${booking.cabin})</div>
          </div>
          <button class="btn-secondary-sm" onclick="AerovaApp.changeSeatFromManage('${booking.pnr}')">Change Seat</button>
        </div>

        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Baggage & Extras</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">Add checked luggage or lounge access</div>
          </div>
          <button class="btn-secondary-sm" onclick="AerovaApp.addBaggageFromManage('${booking.pnr}')">+ Add Baggage</button>
        </div>

        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Digital Boarding Pass</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">Gate: ${booking.gate || 'B12'} • Status: ${booking.status}</div>
          </div>
          <button class="btn-primary-sm" onclick="AerovaApp.viewTicketFromManage('${booking.pnr}')">View Ticket</button>
        </div>

        ${booking.status !== 'cancelled' ? `
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1rem; border-radius: var(--radius-md); margin-top: 0.5rem;">
            <strong style="color: var(--status-error);">Cancel Reservation</strong>
            <p style="font-size: 0.8rem; margin: 0.25rem 0 0.75rem;">Cancellation is subject to the fare conditions. Standard refund processing time is instant in demo mode.</p>
            <button class="btn-secondary-sm" style="border-color: var(--status-error); color: var(--status-error);" onclick="AerovaApp.cancelBooking('${booking.pnr}')">
              Cancel This Flight
            </button>
          </div>
        ` : `
          <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: var(--radius-md); text-align: center; color: var(--status-error); font-weight: 700;">
            This flight was cancelled.
          </div>
        `}
      </div>
    `;

    openModal('modalManageBooking');
  }

  function cancelBooking(pnr) {
    if (confirm(`Are you sure you want to cancel booking ${pnr}? A refund of the refundable fare portion will be initiated.`)) {
      const idx = State.myBookings.findIndex(b => b.pnr === pnr);
      if (idx !== -1) {
        State.myBookings[idx].status = 'cancelled';
        localStorage.setItem('aerova_bookings', JSON.stringify(State.myBookings));

        State.notifications.unshift({
          id: Date.now(),
          title: `Reservation ${pnr} Cancelled`,
          time: 'Just now',
          read: false,
          body: `Flight ${State.myBookings[idx].flightNum} has been cancelled. Simulated refund initiated.`
        });
        localStorage.setItem('aerova_notifications', JSON.stringify(State.notifications));
        updateNotificationBadge();

        closeModal('modalManageBooking');
        renderBookings();
        showToast(`Booking ${pnr} has been cancelled.`, 'info');
      }
    }
  }

  function changeSeatFromManage(pnr) {
    const booking = State.myBookings.find(b => b.pnr === pnr);
    if (!booking) return;

    const newSeat = prompt(`Enter new desired seat for ${booking.passengerName} (e.g. 15A, 3B, 18F):`, booking.seat);
    if (newSeat && newSeat.trim()) {
      booking.seat = newSeat.trim().toUpperCase();
      localStorage.setItem('aerova_bookings', JSON.stringify(State.myBookings));
      closeModal('modalManageBooking');
      renderBookings();
      showToast(`Seat updated to ${booking.seat}.`, 'success');
    }
  }

  function addBaggageFromManage(pnr) {
    const booking = State.myBookings.find(b => b.pnr === pnr);
    if (!booking) return;

    if (confirm(`Add 1 Extra Checked Bag (23kg) for $45.00 to booking ${pnr}?`)) {
      booking.total += 45;
      localStorage.setItem('aerova_bookings', JSON.stringify(State.myBookings));
      closeModal('modalManageBooking');
      renderBookings();
      showToast('Checked bag added to reservation. Total updated.', 'success');
    }
  }

  function viewTicketFromManage(pnr) {
    const booking = State.myBookings.find(b => b.pnr === pnr);
    if (!booking) return;

    closeModal('modalManageBooking');

    // Populate confirmation step with this booking's details
    State.bookingData.pnr = booking.pnr;
    State.currentFlight = {
      airline: booking.airline,
      flightNum: booking.flightNum,
      depTime: booking.departureTime,
      arrTime: booking.arrivalTime,
      duration: booking.duration,
      stopsText: booking.stops
    };
    State.search.origin = booking.origin;
    State.search.destination = booking.destination;
    State.search.departureDate = booking.date;
    State.bookingData.selectedSeat = booking.seat;
    State.bookingData.passengerDetails = [{ firstName: booking.passengerName.split(' ')[0], lastName: booking.passengerName.split(' ')[1] || '' }];

    goToBookingStep(7);
    navigateTo('booking');
  }

  // ==========================================================================
  // 16. ONLINE CHECK-IN CONTROLLER
  // ==========================================================================
  function setupCheckinForm() {
    document.getElementById('checkinLookupForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pnrInput = document.getElementById('checkinPnrInput')?.value.trim().toUpperCase();
      const lastNameInput = document.getElementById('checkinLastNameInput')?.value.trim().toLowerCase();

      const booking = State.myBookings.find(b => b.pnr.toUpperCase() === pnrInput);

      const resultBox = document.getElementById('checkinResultCard');
      if (!resultBox) return;

      if (!booking || !booking.passengerName.toLowerCase().includes(lastNameInput)) {
        showToast('No booking found matching this Reference and Last Name.', 'error');
        resultBox.style.display = 'none';
        return;
      }

      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-gold);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <strong style="font-size: 1.15rem; color: #ffffff;">${booking.origin.code} → ${booking.destination.code}</strong>
            <span class="booking-status-badge ${booking.status}">${booking.status}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            Passenger: <strong style="color: #ffffff;">${booking.passengerName}</strong><br>
            Flight: ${booking.airline} (${booking.flightNum})<br>
            Departure: ${booking.date} at ${booking.departureTime}<br>
            Assigned Seat: <strong style="color: var(--gold);">${booking.seat}</strong>
          </div>

          ${booking.status === 'checked-in' ? `
            <div style="margin-top: 1rem; color: var(--sapphire-light); font-weight: 700; font-size: 0.9rem;">
              ✓ You are already checked in! Gate: ${booking.gate || 'B12'}
            </div>
            <button class="btn-primary-sm" style="width: 100%; margin-top: 0.75rem;" onclick="AerovaApp.viewTicketFromManage('${booking.pnr}')">
              View Digital Boarding Pass
            </button>
          ` : `
            <button class="btn-primary-sm" style="width: 100%; margin-top: 1.25rem;" onclick="AerovaApp.completeCheckin('${booking.pnr}')">
              Complete Check-In & Get Boarding Pass
            </button>
          `}
        </div>
      `;

      showToast(`Booking retrieved for ${booking.passengerName}.`, 'success');
    });
  }

  function completeCheckin(pnr) {
    const booking = State.myBookings.find(b => b.pnr === pnr);
    if (!booking) return;

    booking.status = 'checked-in';
    booking.gate = 'B' + (Math.floor(Math.random() * 20) + 1).toString().padStart(2, '0');
    booking.zone = 'Zone 1';
    localStorage.setItem('aerova_bookings', JSON.stringify(State.myBookings));

    showToast('Check-in complete! Boarding pass ready.', 'success');
    viewTicketFromManage(pnr);
  }

  // ==========================================================================
  // 17. SAVED FLIGHTS / FAVORITES CONTROLLER
  // ==========================================================================
  function toggleFavorite(flightId) {
    const idx = State.favoriteFlightIds.indexOf(flightId);
    if (idx === -1) {
      State.favoriteFlightIds.push(flightId);
      showToast('Flight saved to your Watchlist.', 'success');
    } else {
      State.favoriteFlightIds.splice(idx, 1);
      showToast('Flight removed from Watchlist.', 'info');
    }

    localStorage.setItem('aerova_favorites', JSON.stringify(State.favoriteFlightIds));
    renderFlightResults();
    renderFavorites();
  }

  function renderFavorites() {
    const container = document.getElementById('favoritesListContainer');
    if (!container) return;

    const favFlights = State.allFlights.filter(f => State.favoriteFlightIds.includes(f.id));

    if (favFlights.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">♡</div>
          <h3>No saved flights in your watchlist</h3>
          <p style="margin: 0.5rem auto 1.5rem; max-width: 400px;">Click the heart icon on any flight card to track fares and get alerts.</p>
          <button class="btn-primary-sm" onclick="AerovaApp.navigateTo('home')">Search Flights</button>
        </div>
      `;
      return;
    }

    container.innerHTML = favFlights.map(f => `
      <div class="flight-card" style="margin-bottom: 1rem;">
        <div class="flight-brand-col">
          <div class="airline-badge">${f.airline.slice(0, 2)}</div>
          <div>
            <div class="airline-name-txt">${f.airline}</div>
            <div class="flight-number-txt">${f.flightNum} • ${f.aircraft}</div>
          </div>
        </div>
        <div class="flight-timeline-col">
          <div class="time-point">
            <div class="time-val">${f.depTime}</div>
            <div class="airport-code-label">${State.search.origin.code}</div>
          </div>
          <div class="route-mid-visual">
            <div class="duration-txt">${f.duration}</div>
            <div class="flight-line-graphic"></div>
            <div class="stops-txt nonstop">${f.stopsText}</div>
          </div>
          <div class="time-point">
            <div class="time-val">${f.arrTime}</div>
            <div class="airport-code-label">${State.search.destination.code}</div>
          </div>
        </div>
        <div class="flight-actions-col">
          <div class="flight-price-val">${formatMoney(f.price)}</div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-fav active" onclick="AerovaApp.toggleFavorite('${f.id}')">♥</button>
            <button class="btn-select-flight" onclick="AerovaApp.selectFlight('${f.id}')">Book Now</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // 18. DESTINATION EXPLORER & CURATED DEALS
  // ==========================================================================
  function renderDestinations() {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) return;

    grid.innerHTML = CURATED_DESTINATIONS.map(d => `
      <div class="destination-card">
        <div class="destination-visual" style="background: ${d.imageGradient};">
          <div class="destination-badge">Flagship Route</div>
          <div style="font-size: 3.5rem; opacity: 0.2; color: #fff; font-weight: 900;">${d.code}</div>
        </div>
        <div class="destination-info">
          <div>
            <h4 class="destination-name">${d.city}</h4>
            <div class="destination-country">${d.country}</div>
          </div>
          <div class="destination-footer-row">
            <div>
              <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">From</div>
              <div class="dest-fare-tag">${formatMoney(d.fare)}</div>
            </div>
            <button class="btn-primary-sm" onclick="AerovaApp.bookDestination('${d.code}', '${d.city}', '${d.country}')">
              Book Flights →
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function bookDestination(destCode, destCity, destCountry) {
    State.search.destination = {
      code: destCode,
      city: destCity,
      country: destCountry
    };
    updateAirportDisplays();
    executeFlightSearch();
    showToast(`Searching flagship flights to ${destCity} (${destCode})...`, 'info');
  }

  // ==========================================================================
  // 19. NOTIFICATIONS CENTER
  // ==========================================================================
  function updateNotificationBadge() {
    const badge = document.getElementById('unreadNotifBadge');
    if (!badge) return;
    const unread = State.notifications.filter(n => !n.read).length;
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }

  function renderNotificationsModal() {
    const container = document.getElementById('notifListContainer');
    if (!container) return;

    if (State.notifications.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-dim);">No notifications</div>`;
      return;
    }

    container.innerHTML = State.notifications.map(n => `
      <div style="background: ${n.read ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)'}; padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid ${n.read ? 'transparent' : 'var(--sapphire-light)'};">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <strong style="color: #ffffff; font-size: 0.95rem;">${n.title}</strong>
          <span style="font-size: 0.72rem; color: var(--text-dim);">${n.time}</span>
        </div>
        <p style="font-size: 0.85rem; margin-top: 0.35rem; color: var(--text-muted);">${n.body}</p>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
          ${!n.read ? `<button class="btn-clear-filters" onclick="AerovaApp.markNotifRead(${n.id})">Mark as read</button>` : ''}
          <button class="btn-clear-filters" style="color: var(--status-error);" onclick="AerovaApp.deleteNotif(${n.id})">Delete</button>
        </div>
      </div>
    `).join('');

    document.getElementById('btnMarkAllNotifsRead')?.addEventListener('click', () => {
      State.notifications.forEach(n => n.read = true);
      localStorage.setItem('aerova_notifications', JSON.stringify(State.notifications));
      updateNotificationBadge();
      renderNotificationsModal();
      showToast('All notifications marked as read.', 'info');
    });
  }

  function markNotifRead(id) {
    const n = State.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      localStorage.setItem('aerova_notifications', JSON.stringify(State.notifications));
      updateNotificationBadge();
      renderNotificationsModal();
    }
  }

  function deleteNotif(id) {
    State.notifications = State.notifications.filter(n => n.id !== id);
    localStorage.setItem('aerova_notifications', JSON.stringify(State.notifications));
    updateNotificationBadge();
    renderNotificationsModal();
  }

  // ==========================================================================
  // 20. GLOBAL SEARCH / COMMAND PALETTE (Ctrl+K)
  // ==========================================================================
  function setupGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('globalSearchResults');

    input?.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        if (results) results.innerHTML = '';
        return;
      }

      // Search across airports, destinations, bookings
      const matches = [];

      AIRPORTS.forEach(a => {
        if (a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.country.toLowerCase().includes(q)) {
          matches.push({
            title: `${a.city} (${a.code}), ${a.country}`,
            type: 'Airport',
            action: () => {
              bookDestination(a.code, a.city, a.country);
              closeModal('modalGlobalSearch');
            }
          });
        }
      });

      State.myBookings.forEach(b => {
        if (b.pnr.toLowerCase().includes(q) || b.passengerName.toLowerCase().includes(q)) {
          matches.push({
            title: `Booking: ${b.pnr} (${b.origin.code} → ${b.destination.code}) - ${b.passengerName}`,
            type: 'Reservation',
            action: () => {
              viewTicketFromManage(b.pnr);
              closeModal('modalGlobalSearch');
            }
          });
        }
      });

      if (matches.length === 0) {
        if (results) results.innerHTML = `<div style="padding: 1rem; color: var(--text-dim); text-align: center;">No matches found</div>`;
        return;
      }

      if (results) {
        results.innerHTML = matches.slice(0, 6).map((m, idx) => `
          <div class="airport-item" data-idx="${idx}" style="cursor: pointer;">
            <div>
              <div style="font-weight: 600; color: #ffffff;">${m.title}</div>
              <span style="font-size: 0.72rem; color: var(--gold);">${m.type}</span>
            </div>
            <span>→</span>
          </div>
        `).join('');

        results.querySelectorAll('.airport-item').forEach(item => {
          item.addEventListener('click', () => {
            const idx = parseInt(item.getAttribute('data-idx'), 10);
            matches[idx]?.action();
          });
        });
      }
    });
  }

  // ==========================================================================
  // 21. AUTHENTICATION & PROFILE CONTROLLER
  // ==========================================================================
  function setAuthModalMode(mode) {
    const regFields = document.getElementById('authRegisterFields');
    const title = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('btnSubmitAuth');
    const tabLogin = document.getElementById('tabAuthLogin');
    const tabReg = document.getElementById('tabAuthRegister');

    if (mode === 'register') {
      if (regFields) regFields.style.display = 'block';
      if (title) title.textContent = 'Create AEROVA Club Account';
      if (submitBtn) submitBtn.textContent = 'Register & Join Club';
      if (tabReg) tabReg.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
    } else {
      if (regFields) regFields.style.display = 'none';
      if (title) title.textContent = 'Welcome Back';
      if (submitBtn) submitBtn.textContent = 'Sign In to AEROVA';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabReg) tabReg.classList.remove('active');
    }
  }

  function setupAuth() {
    document.getElementById('tabAuthLogin')?.addEventListener('click', () => setAuthModalMode('login'));
    document.getElementById('tabAuthRegister')?.addEventListener('click', () => setAuthModalMode('register'));

    document.getElementById('authForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail')?.value;
      const regName = document.getElementById('regFullName')?.value || 'Asfandyar Khan';

      State.currentUser = {
        name: regName,
        email: email || 'asfandyar@aerova.demo',
        avatar: regName.charAt(0).toUpperCase(),
        memberNumber: 'AV-' + Math.floor(1000000 + Math.random() * 9000000),
        tier: 'Gold Elite',
        miles: 48250,
        tripsTaken: 12
      };

      localStorage.setItem('aerova_user', JSON.stringify(State.currentUser));
      updateUserHeaderUI();
      closeModal('modalAuth');
      showToast(`Welcome to AEROVA, ${State.currentUser.name}!`, 'success');
    });

    document.getElementById('btnLogoutProfile')?.addEventListener('click', () => {
      State.currentUser = null;
      localStorage.removeItem('aerova_user');
      updateUserHeaderUI();
      navigateTo('home');
      showToast('You have signed out.', 'info');
    });

    document.getElementById('btnForgotPwd')?.addEventListener('click', () => {
      showToast('Password reset link sent to registered email address.', 'info');
    });

    document.getElementById('btnSavePreferences')?.addEventListener('click', () => {
      showToast('Travel preferences saved successfully.', 'success');
    });
  }

  function updateUserHeaderUI() {
    const authContainer = document.getElementById('authContainer');
    const profileBadge = document.getElementById('userProfileBadge');
    const nameLabel = document.getElementById('userNameLabel');
    const avatar = document.getElementById('userAvatarChar');

    if (State.currentUser) {
      if (authContainer) authContainer.style.display = 'none';
      if (profileBadge) profileBadge.style.display = 'flex';
      if (nameLabel) nameLabel.textContent = State.currentUser.name;
      if (avatar) avatar.textContent = State.currentUser.avatar;
    } else {
      if (authContainer) authContainer.style.display = 'flex';
      if (profileBadge) profileBadge.style.display = 'none';
    }
  }

  // Multi-city helper methods exposed to AerovaApp namespace
  function updateSegment(idx, field, value) {
    if (State.search.multiSegments[idx]) {
      State.search.multiSegments[idx][field] = value.toUpperCase();
    }
  }

  function removeSegment(idx) {
    State.search.multiSegments.splice(idx, 1);
    renderMultiCitySegments();
  }

  // ==========================================================================
  // 22. GLOBAL INITIALIZATION
  // ==========================================================================
  function initApp() {
    initDemoStorage();
    setupCurrencySwitchers();
    setupModals();
    setupMobileNavigation();
    setupNavLinks();
    setupFlightSearch();
    setupFiltersAndSorting();
    setupBookingFlowControls();
    setupBookingsTabs();
    setupCheckinForm();
    setupGlobalSearch();
    setupAuth();

    // Initial renders
    updateAirportDisplays();
    updatePassengerSummary();
    generateFlightResults();
    renderDestinations();
    updateNotificationBadge();
    updateUserHeaderUI();
  }

  // Expose public API for inline button handlers
  window.AerovaApp = {
    navigateTo,
    selectFlight,
    openFlightDetailsModal,
    switchModalTab,
    closeModal,
    openModal,
    toggleFavorite,
    bookDestination,
    openManageBookingModal,
    cancelBooking,
    changeSeatFromManage,
    addBaggageFromManage,
    viewTicketFromManage,
    completeCheckin,
    markNotifRead,
    deleteNotif,
    updateSegment,
    removeSegment,
    showToast,
    openHelpModal: () => openModal('modalHelp')
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
