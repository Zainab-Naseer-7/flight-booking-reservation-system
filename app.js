/**
 * AEROLUXE - Ultra-Premium Flight Booking & Reservation System
 * Master JavaScript Engine
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Core State & Currencies
  // ==========================================================================
  const state = {
    theme: localStorage.getItem('aeroluxe_theme') || 'dark',
    currency: 'USD',
    tripType: 'round',
    cabinClass: 'Economy',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    origin: { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy Intl' },
    destination: { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International' },
    departureDate: '',
    returnDate: '',
    currentStep: 1,
    searchResults: [],
    selectedFlight: null,
    passengerDetails: {
      title: 'Mr',
      firstName: 'Alexander',
      lastName: 'Vance',
      dob: '1990-05-14',
      gender: 'Male',
      nationality: 'United States',
      passport: 'P98214589',
      email: 'alex.vance@aeroluxe.com',
      phone: '+1 (555) 234-5678',
      meal: 'Standard Luxury Dining',
      special: ''
    },
    selectedSeat: {
      code: '12A',
      type: 'Business Class Window Suite',
      fee: 0
    },
    activePromo: null,
    discountAmount: 0,
    confirmedBooking: null,
    userBookings: []
  };

  // Currency Exchange Rates (Base: USD)
  const currencyRates = {
    USD: { symbol: '$', rate: 1.0, position: 'before' },
    EUR: { symbol: '€', rate: 0.92, position: 'before' },
    GBP: { symbol: '£', rate: 0.78, position: 'before' },
    AED: { symbol: 'AED ', rate: 3.67, position: 'before' },
    PKR: { symbol: 'Rs. ', rate: 278.5, position: 'before' },
    INR: { symbol: '₹', rate: 83.2, position: 'before' },
    JPY: { symbol: '¥', rate: 154.0, position: 'before' }
  };

  function formatPrice(usdAmount) {
    const cur = currencyRates[state.currency] || currencyRates.USD;
    const converted = usdAmount * cur.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: cur.rate > 50 ? 0 : 2,
      maximumFractionDigits: cur.rate > 50 ? 0 : 2
    });
    return `${cur.symbol}${formatted}`;
  }

  // ==========================================================================
  // 2. Global Airport Database (50+ Hubs)
  // ==========================================================================
  const airportDatabase = [
    { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy Intl' },
    { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International' },
    { code: 'LHR', city: 'London', country: 'United Kingdom', name: 'London Heathrow' },
    { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Tokyo Haneda Intl' },
    { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi' },
    { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul New Airport' },
    { code: 'MLE', city: 'Maldives (Male)', country: 'Maldives', name: 'Velana International' },
    { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Kingsford Smith' },
    { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Main' },
    { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Schiphol' },
    { code: 'LAX', city: 'Los Angeles', country: 'USA', name: 'Los Angeles International' },
    { code: 'SFO', city: 'San Francisco', country: 'USA', name: 'San Francisco Intl' },
    { code: 'ORD', city: 'Chicago', country: 'USA', name: 'O\'Hare International' },
    { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International' },
    { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', name: 'Zayed International' },
    { code: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
    { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci-Fiumicino' },
    { code: 'KHI', city: 'Karachi', country: 'Pakistan', name: 'Jinnah International' },
    { code: 'ISB', city: 'Islamabad', country: 'Pakistan', name: 'Islamabad International' },
    { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Intl' },
    { code: 'DEL', city: 'New Delhi', country: 'India', name: 'Indira Gandhi Intl' },
    { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur Intl' },
    { code: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Incheon International' },
    { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
    { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson' },
    { code: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Barcelona-El Prat' },
    { code: 'VIE', city: 'Vienna', country: 'Austria', name: 'Vienna International' },
    { code: 'MUC', city: 'Munich', country: 'Germany', name: 'Munich Airport' }
  ];

  // ==========================================================================
  // 3. UI Helper Utilities: Toasts & Scroll
  // ==========================================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-weight: 700; color: var(--accent-cyan);">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // ==========================================================================
  // 4. Initial Setup & Default Dates
  // ==========================================================================
  function initDates() {
    const today = new Date();
    
    // Departure in 3 days
    const dep = new Date(today);
    dep.setDate(today.getDate() + 3);
    const depStr = dep.toISOString().split('T')[0];

    // Return in 10 days
    const ret = new Date(today);
    ret.setDate(today.getDate() + 10);
    const retStr = ret.toISOString().split('T')[0];

    const depInput = document.getElementById('departureDateInput');
    const retInput = document.getElementById('returnDateInput');

    if (depInput) {
      depInput.min = today.toISOString().split('T')[0];
      depInput.value = depStr;
      state.departureDate = depStr;
    }
    if (retInput) {
      retInput.min = depStr;
      retInput.value = retStr;
      state.returnDate = retStr;
    }
  }

  // Set Theme
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aeroluxe_theme', theme);

    const sunIcon = document.getElementById('themeIconSun');
    const moonIcon = document.getElementById('themeIconMoon');
    if (sunIcon && moonIcon) {
      if (theme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    }
  }

  // ==========================================================================
  // 5. Autocomplete & Dropdowns Engine
  // ==========================================================================
  function setupAutocomplete() {
    const originBox = document.getElementById('originFieldBox');
    const originDropdown = document.getElementById('originDropdown');
    const originInput = document.getElementById('originSearchInput');
    const originList = document.getElementById('originAirportList');

    const destBox = document.getElementById('destFieldBox');
    const destDropdown = document.getElementById('destDropdown');
    const destInput = document.getElementById('destSearchInput');
    const destList = document.getElementById('destAirportList');

    function renderAirportList(container, filter = '', isOrigin = true) {
      container.innerHTML = '';
      const term = filter.toLowerCase().trim();
      const filtered = airportDatabase.filter(a =>
        a.code.toLowerCase().includes(term) ||
        a.city.toLowerCase().includes(term) ||
        a.country.toLowerCase().includes(term) ||
        a.name.toLowerCase().includes(term)
      );

      if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 0.75rem; font-size: 0.82rem; color: var(--text-muted); text-align: center;">No airports matching "${filter}"</div>`;
        return;
      }

      filtered.forEach(item => {
        const row = document.createElement('div');
        row.className = 'airport-item';
        row.innerHTML = `
          <div class="airport-item-info">
            <span class="airport-item-city">${item.city}, ${item.country}</span>
            <span class="airport-item-name">${item.name}</span>
          </div>
          <span class="airport-badge">${item.code}</span>
        `;
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isOrigin) {
            state.origin = item;
            document.getElementById('originCodeDisplay').textContent = item.code;
            document.getElementById('originSubtextDisplay').textContent = `${item.city} (${item.code})`;
            originDropdown.classList.remove('show');
          } else {
            state.destination = item;
            document.getElementById('destCodeDisplay').textContent = item.code;
            document.getElementById('destSubtextDisplay').textContent = `${item.city} (${item.code})`;
            destDropdown.classList.remove('show');
          }
        });
        container.appendChild(row);
      });
    }

    // Toggle Origin Dropdown
    if (originBox && originDropdown) {
      originBox.addEventListener('click', (e) => {
        e.stopPropagation();
        destDropdown.classList.remove('show');
        originDropdown.classList.toggle('show');
        if (originDropdown.classList.contains('show')) {
          originInput.value = '';
          renderAirportList(originList, '', true);
          originInput.focus();
        }
      });
      originInput.addEventListener('input', (e) => {
        renderAirportList(originList, e.target.value, true);
      });
    }

    // Toggle Destination Dropdown
    if (destBox && destDropdown) {
      destBox.addEventListener('click', (e) => {
        e.stopPropagation();
        originDropdown.classList.remove('show');
        destDropdown.classList.toggle('show');
        if (destDropdown.classList.contains('show')) {
          destInput.value = '';
          renderAirportList(destList, '', false);
          destInput.focus();
        }
      });
      destInput.addEventListener('input', (e) => {
        renderAirportList(destList, e.target.value, false);
      });
    }

    // Close Dropdowns on Click Outside
    document.addEventListener('click', (e) => {
      if (originDropdown && !originDropdown.contains(e.target) && !originBox.contains(e.target)) {
        originDropdown.classList.remove('show');
      }
      if (destDropdown && !destDropdown.contains(e.target) && !destBox.contains(e.target)) {
        destDropdown.classList.remove('show');
      }
    });

    // Swap Airports Button
    const swapBtn = document.getElementById('swapAirportsBtn');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const temp = state.origin;
        state.origin = state.destination;
        state.destination = temp;

        document.getElementById('originCodeDisplay').textContent = state.origin.code;
        document.getElementById('originSubtextDisplay').textContent = `${state.origin.city} (${state.origin.code})`;

        document.getElementById('destCodeDisplay').textContent = state.destination.code;
        document.getElementById('destSubtextDisplay').textContent = `${state.destination.city} (${state.destination.code})`;

        showToast(`Route swapped: ${state.origin.code} ⇄ ${state.destination.code}`, 'info');
      });
    }
  }

  // ==========================================================================
  // 6. Passenger & Cabin Popover Controller
  // ==========================================================================
  function setupPassengerPopover() {
    const triggerBtn = document.getElementById('passengerMetaBtn');
    const popover = document.getElementById('passengerPopover');
    const summaryText = document.getElementById('passengerSummaryText');

    if (!triggerBtn || !popover) return;

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && !triggerBtn.contains(e.target)) {
        popover.classList.remove('show');
      }
    });

    function updateSummary() {
      const total = state.passengers.adults + state.passengers.children + state.passengers.infants;
      const passStr = total === 1 ? '1 Traveler' : `${total} Travelers`;
      summaryText.textContent = `${passStr}, ${state.cabinClass}`;
    }

    // Adults +/-
    document.getElementById('incAdults').addEventListener('click', () => {
      if (state.passengers.adults < 9) {
        state.passengers.adults++;
        document.getElementById('adultCount').textContent = state.passengers.adults;
        updateSummary();
      }
    });
    document.getElementById('decAdults').addEventListener('click', () => {
      if (state.passengers.adults > 1) {
        state.passengers.adults--;
        document.getElementById('adultCount').textContent = state.passengers.adults;
        updateSummary();
      }
    });

    // Children +/-
    document.getElementById('incChildren').addEventListener('click', () => {
      if (state.passengers.children < 6) {
        state.passengers.children++;
        document.getElementById('childCount').textContent = state.passengers.children;
        updateSummary();
      }
    });
    document.getElementById('decChildren').addEventListener('click', () => {
      if (state.passengers.children > 0) {
        state.passengers.children--;
        document.getElementById('childCount').textContent = state.passengers.children;
        updateSummary();
      }
    });

    // Infants +/-
    document.getElementById('incInfants').addEventListener('click', () => {
      if (state.passengers.infants < 4) {
        state.passengers.infants++;
        document.getElementById('infantCount').textContent = state.passengers.infants;
        updateSummary();
      }
    });
    document.getElementById('decInfants').addEventListener('click', () => {
      if (state.passengers.infants > 0) {
        state.passengers.infants--;
        document.getElementById('infantCount').textContent = state.passengers.infants;
        updateSummary();
      }
    });

    // Cabin class selection
    const cabinPills = document.querySelectorAll('.cabin-pill');
    cabinPills.forEach(pill => {
      pill.addEventListener('click', () => {
        cabinPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.cabinClass = pill.getAttribute('data-cabin');
        updateSummary();
      });
    });

    // Trip Type Selector
    const tripBtns = document.querySelectorAll('.trip-type-btn');
    const returnBox = document.getElementById('returnDateBox');
    tripBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tripBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.tripType = btn.getAttribute('data-type');

        if (state.tripType === 'oneway') {
          returnBox.style.opacity = '0.35';
          returnBox.style.pointerEvents = 'none';
        } else {
          returnBox.style.opacity = '1';
          returnBox.style.pointerEvents = 'auto';
        }
      });
    });
  }

  // ==========================================================================
  // 7. Dynamic Mock Flight Generator Engine
  // ==========================================================================
  function generateMockFlights(origin, destination, cabin) {
    const airlines = [
      { name: 'AeroLuxe Flagship', code: 'AL', logo: 'AL', aircraft: 'Airbus A350-1000 XWB' },
      { name: 'Emirates', code: 'EK', logo: 'EK', aircraft: 'Airbus A380-800' },
      { name: 'Qatar Airways', code: 'QR', logo: 'QR', aircraft: 'Airbus A350-900 Qsuite' },
      { name: 'Singapore Airlines', code: 'SQ', logo: 'SQ', aircraft: 'Boeing 787-10 Dreamliner' },
      { name: 'British Airways', code: 'BA', logo: 'BA', aircraft: 'Boeing 777-300ER Club Suite' },
      { name: 'Lufthansa', code: 'LH', logo: 'LH', aircraft: 'Boeing 787-9 Allegris' }
    ];

    // Base fare multiplier per cabin class
    let cabinMultiplier = 1.0;
    if (cabin === 'Premium Economy') cabinMultiplier = 1.65;
    if (cabin === 'Business') cabinMultiplier = 2.9;
    if (cabin === 'First Class') cabinMultiplier = 4.8;

    const schedules = [
      { dep: '08:15', arr: '19:45', dur: '11h 30m', durMins: 690, stops: 'Direct', stopCount: 0, timeSlot: 'morning' },
      { dep: '11:40', arr: '05:25+1', dur: '17h 45m', durMins: 1065, stops: '1 Stop (DOH)', stopCount: 1, timeSlot: 'morning' },
      { dep: '14:20', arr: '06:10+1', dur: '15h 50m', durMins: 950, stops: '1 Stop (DXB)', stopCount: 1, timeSlot: 'afternoon' },
      { dep: '17:00', arr: '07:30+1', dur: '14h 30m', durMins: 870, stops: 'Direct', stopCount: 0, timeSlot: 'afternoon' },
      { dep: '20:45', arr: '11:15+1', dur: '14h 30m', durMins: 870, stops: 'Direct', stopCount: 0, timeSlot: 'evening' },
      { dep: '22:30', arr: '15:20+1', dur: '16h 50m', durMins: 1010, stops: '1 Stop (LHR)', stopCount: 1, timeSlot: 'evening' }
    ];

    const baseFares = [850, 720, 910, 1150, 980, 890];

    return schedules.map((sch, idx) => {
      const air = airlines[idx % airlines.length];
      const flightNum = `${air.code}-${Math.floor(200 + Math.random() * 700)}`;
      const price = Math.round(baseFares[idx] * cabinMultiplier);

      return {
        id: `FL-${idx + 1}-${flightNum}`,
        airline: air.name,
        airlineCode: air.code,
        flightNumber: flightNum,
        aircraft: air.aircraft,
        originCode: origin.code,
        originCity: origin.city,
        destCode: destination.code,
        destCity: destination.city,
        departureTime: sch.dep,
        arrivalTime: sch.arr,
        duration: sch.dur,
        durationMinutes: sch.durMins,
        stops: sch.stops,
        stopCount: sch.stopCount,
        timeSlot: sch.timeSlot,
        cabin: cabin,
        basePriceUSD: price,
        isRefundable: idx % 2 === 0,
        baggage: cabin === 'First Class' ? '3x 32kg Baggage Included' : (cabin === 'Business' ? '2x 32kg Baggage Included' : '1x 23kg Baggage Included'),
        amenities: ['Starlink Wi-Fi', 'Gourmet Dining', '4K In-Flight Tech', cabin === 'First Class' || cabin === 'Business' ? 'Lie-Flat Bed' : 'Ergonomic Seat']
      };
    });
  }

  // ==========================================================================
  // 8. Flight Results Rendering & Filtering
  // ==========================================================================
  function renderFlightResults() {
    const container = document.getElementById('flightsCardsContainer');
    if (!container) return;

    container.innerHTML = '';

    // Filter results based on state
    const maxPrice = parseFloat(document.getElementById('priceRangeSlider').value);

    // Stops filter
    const stopsChecked = Array.from(document.querySelectorAll('input[name="filterStops"]:checked')).map(cb => cb.value);
    // Airlines filter
    const airlinesChecked = Array.from(document.querySelectorAll('input[name="filterAirline"]:checked')).map(cb => cb.value);
    // Time slot filter
    const timesChecked = Array.from(document.querySelectorAll('input[name="filterTime"]:checked')).map(cb => cb.value);

    let filtered = state.searchResults.filter(f => {
      if (f.basePriceUSD > maxPrice) return false;
      if (!stopsChecked.includes('all')) {
        if (stopsChecked.includes('direct') && f.stopCount !== 0) return false;
        if (stopsChecked.includes('1stop') && f.stopCount !== 1) return false;
      }
      if (airlinesChecked.length > 0 && !airlinesChecked.includes(f.airline)) {
        return false;
      }
      if (timesChecked.length > 0 && !timesChecked.includes(f.timeSlot)) {
        return false;
      }
      return true;
    });

    // Update count display
    const countEl = document.getElementById('resultsCountText');
    if (countEl) countEl.textContent = `Showing ${filtered.length} Available Flights`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
          <div style="font-size: 2rem; margin-bottom: 1rem;">✈️</div>
          <h3 style="margin-bottom: 0.5rem;">No flights match your filter criteria</h3>
          <p class="text-secondary" style="font-size: 0.88rem; margin-bottom: 1.5rem;">Try relaxing your price slider or enabling multiple airlines.</p>
          <button class="btn-primary-action" id="btnResetFiltersEmpty">Reset Filters</button>
        </div>
      `;
      document.getElementById('btnResetFiltersEmpty')?.addEventListener('click', resetFilters);
      return;
    }

    filtered.forEach(flight => {
      const card = document.createElement('div');
      card.className = 'flight-card';
      card.innerHTML = `
        <div class="flight-card-main">
          <!-- Airline Branding -->
          <div class="airline-info">
            <div class="airline-logo-circle">${flight.airlineCode}</div>
            <div class="airline-details">
              <span class="airline-name">${flight.airline}</span>
              <span class="flight-code">${flight.flightNumber} • ${flight.aircraft}</span>
            </div>
          </div>

          <!-- Route & Timeline -->
          <div class="flight-timeline-col">
            <div class="time-box">
              <span class="flight-time">${flight.departureTime}</span>
              <span class="flight-airport-code">${flight.originCode}</span>
              <span class="flight-city-label">${flight.originCity}</span>
            </div>

            <div class="duration-visual">
              <span class="duration-text">${flight.duration}</span>
              <div class="flight-track-line">
                <svg class="track-plane-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
              </div>
              <span class="stop-indicator">${flight.stops}</span>
            </div>

            <div class="time-box" style="text-align: right;">
              <span class="flight-time">${flight.arrivalTime}</span>
              <span class="flight-airport-code">${flight.destCode}</span>
              <span class="flight-city-label">${flight.destCity}</span>
            </div>
          </div>

          <!-- Pricing & Selection -->
          <div class="price-action-col">
            <span class="fare-tag">${flight.isRefundable ? 'Refundable Fare' : 'Standard Fare'}</span>
            <div>
              <div class="flight-price-amount">${formatPrice(flight.basePriceUSD)}</div>
              <div class="flight-price-unit">per passenger / ${flight.cabin}</div>
            </div>
            <button class="btn-select-flight" data-id="${flight.id}">
              Select Flight
            </button>
          </div>
        </div>

        <!-- Footer Strip -->
        <div class="flight-card-footer">
          <div class="amenities-badges">
            <span class="amenity-item">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z"/></svg>
              Starlink Wi-Fi
            </span>
            <span class="amenity-item">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
              Gourmet Dining
            </span>
            <span class="amenity-item">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 6h-2V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2 0 .55.45 1 1 1s1-.45 1-1h6c0 .55.45 1 1 1s1-.45 1-1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM11 4h2v2h-2V4z"/></svg>
              ${flight.baggage}
            </span>
          </div>

          <span class="btn-toggle-details" data-id="${flight.id}">
            Flight Details & Rules ↓
          </span>
        </div>
      `;

      // Select flight event
      card.querySelector('.btn-select-flight').addEventListener('click', () => {
        selectFlightAndProceed(flight);
      });

      // View details modal
      card.querySelector('.btn-toggle-details').addEventListener('click', () => {
        openFlightDetailsModal(flight);
      });

      container.appendChild(card);
    });
  }

  function resetFilters() {
    document.querySelectorAll('input[name="filterStops"]').forEach(cb => cb.checked = (cb.value === 'all'));
    document.querySelectorAll('input[name="filterAirline"]').forEach(cb => cb.checked = true);
    document.querySelectorAll('input[name="filterTime"]').forEach(cb => cb.checked = true);
    const slider = document.getElementById('priceRangeSlider');
    if (slider) slider.value = 4500;
    document.getElementById('priceRangeDisplay').textContent = 'Max: $4,500';
    renderFlightResults();
    showToast('Filters reset to default', 'info');
  }

  // ==========================================================================
  // 9. Flight Details Modal
  // ==========================================================================
  function openFlightDetailsModal(flight) {
    const modal = document.getElementById('flightDetailsModal');
    const title = document.getElementById('modalFlightTitle');
    const content = document.getElementById('modalFlightContent');
    if (!modal || !content) return;

    title.textContent = `${flight.airline} (${flight.flightNumber}) Itinerary Details`;

    content.innerHTML = `
      <!-- Aircraft Specs Banner -->
      <div class="aircraft-badge-bar">
        <div>
          <strong style="color: var(--text-primary);">${flight.aircraft}</strong>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">Long-range twin-aisle widebody jet • Cabin Class: ${flight.cabin}</div>
        </div>
        <span class="badge-luxury">AeroLuxe Verified</span>
      </div>

      <!-- Timeline Stepper -->
      <div class="timeline-stepper">
        <div class="timeline-node">
          <div class="timeline-dot"></div>
          <div class="timeline-header">
            <span class="timeline-time">${flight.departureTime}</span>
            <span class="timeline-airport">${flight.originCity} (${flight.originCode})</span>
          </div>
          <div class="timeline-subinfo">
            Terminal 4 • Dedicated First/Business Priority Check-In & Fast-Track Security
          </div>
        </div>

        <div class="timeline-node">
          <div class="timeline-dot" style="border-color: var(--accent-gold);"></div>
          <div class="timeline-header">
            <span class="timeline-time">Flight In-Progress (${flight.duration})</span>
            <span class="timeline-airport">${flight.stops}</span>
          </div>
          <div class="timeline-subinfo">
            Cruising altitude: 38,000 ft • Complimentary champagne, Michelin-inspired dining, high-speed Starlink Wi-Fi.
          </div>
        </div>

        <div class="timeline-node">
          <div class="timeline-dot"></div>
          <div class="timeline-header">
            <span class="timeline-time">${flight.arrivalTime}</span>
            <span class="timeline-airport">${flight.destCity} (${flight.destCode})</span>
          </div>
          <div class="timeline-subinfo">
            Terminal 3 • Baggage claim carousel 8 • Chauffeur meeting point in Arrival Lounge
          </div>
        </div>
      </div>

      <!-- Fare Rules Cards -->
      <div class="fare-rules-grid">
        <div class="fare-rule-card">
          <div class="fare-rule-title">Baggage Inclusions</div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
            • Cabin Carry-on: 1x 10kg + 1 personal laptop bag<br>
            • Checked Luggage: ${flight.baggage}<br>
            • Priority luggage tags attached at check-in
          </p>
        </div>

        <div class="fare-rule-card">
          <div class="fare-rule-title">Ticket Flexibility</div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
            • Changes: Free reschedule up to 24h before flight<br>
            • Cancellation: ${flight.isRefundable ? '100% full refund voucher' : 'Standard fare rules apply ($75 cancellation fee)'}<br>
            • 24/7 VIP Concierge line access
          </p>
        </div>
      </div>

      <div style="margin-top: 1.75rem; text-align: right;">
        <button class="btn-primary-action" id="modalSelectThisFlightBtn">
          Select This Flight (${formatPrice(flight.basePriceUSD)})
        </button>
      </div>
    `;

    document.getElementById('modalSelectThisFlightBtn').addEventListener('click', () => {
      modal.classList.remove('show');
      selectFlightAndProceed(flight);
    });

    modal.classList.add('show');
  }

  // ==========================================================================
  // 10. Booking Stepper Navigation Flow
  // ==========================================================================
  function setBookingStep(step) {
    state.currentStep = step;

    // Update Progress Stepper UI
    for (let i = 1; i <= 6; i++) {
      const ind = document.getElementById(`stepIndicator${i}`);
      if (!ind) continue;
      ind.classList.remove('active', 'completed');
      if (i === step) ind.classList.add('active');
      else if (i < step) ind.classList.add('completed');
    }

    // Toggle Sections
    const secResults = document.getElementById('resultsSection');
    const secPassenger = document.getElementById('passengerFormSection');
    const secSeatmap = document.getElementById('seatmapSection');
    const secReview = document.getElementById('reviewSection');
    const secConfirm = document.getElementById('confirmationSection');
    const secMyTrips = document.getElementById('myBookingsSection');

    if (secResults) secResults.style.display = (step === 1) ? 'block' : 'none';
    if (secPassenger) secPassenger.classList.toggle('active', step === 3);
    if (secSeatmap) secSeatmap.classList.toggle('active', step === 4);
    if (secReview) secReview.classList.toggle('active', step === 5);
    if (secConfirm) secConfirm.classList.toggle('active', step === 6);
    if (secMyTrips) secMyTrips.classList.toggle('active', false);

    window.scrollTo({ top: document.getElementById('bookingStepper').offsetTop - 20, behavior: 'smooth' });
  }

  function selectFlightAndProceed(flight) {
    state.selectedFlight = flight;
    showToast(`Selected ${flight.airline} (${flight.flightNumber})`, 'success');
    setBookingStep(3); // Go to Passenger Info
  }

  // ==========================================================================
  // 11. Interactive Aircraft Seat Map Engine (Step 4)
  // ==========================================================================
  function buildSeatMap() {
    const firstCabin = document.getElementById('firstClassCabinGrid');
    const econCabin = document.getElementById('economyCabinGrid');
    if (!firstCabin || !econCabin) return;

    firstCabin.innerHTML = '';
    econCabin.innerHTML = '';

    // Occupied seat set for realism
    const occupiedSeats = new Set(['1A', '2D', '3K', '10B', '11E', '12F', '14A', '15C', '16J']);

    // Build First / Business Rows (Rows 1-3, 1-2-1 layout)
    for (let r = 1; r <= 3; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';

      const rowLabel = document.createElement('div');
      rowLabel.className = 'row-number';
      rowLabel.textContent = r;
      rowDiv.appendChild(rowLabel);

      // Left Suite (A)
      const seatA = createSeatBtn(`${r}A`, 'Luxury First Suite', 120, occupiedSeats);
      seatA.classList.add('premium');
      rowDiv.appendChild(seatA);

      // Aisle
      const aisle1 = document.createElement('div');
      aisle1.className = 'aisle-space';
      rowDiv.appendChild(aisle1);

      // Center Cluster (D, G)
      const clusterDG = document.createElement('div');
      clusterDG.className = 'seat-cluster';
      const seatD = createSeatBtn(`${r}D`, 'Center Executive Suite', 120, occupiedSeats);
      seatD.classList.add('premium');
      const seatG = createSeatBtn(`${r}G`, 'Center Executive Suite', 120, occupiedSeats);
      seatG.classList.add('premium');
      clusterDG.appendChild(seatD);
      clusterDG.appendChild(seatG);
      rowDiv.appendChild(clusterDG);

      // Aisle
      const aisle2 = document.createElement('div');
      aisle2.className = 'aisle-space';
      rowDiv.appendChild(aisle2);

      // Right Suite (K)
      const seatK = createSeatBtn(`${r}K`, 'Luxury First Suite', 120, occupiedSeats);
      seatK.classList.add('premium');
      rowDiv.appendChild(seatK);

      firstCabin.appendChild(rowDiv);
    }

    // Build Economy Rows (Rows 10-16, 3-3-3 layout)
    for (let r = 10; r <= 16; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';

      const rowLabel = document.createElement('div');
      rowLabel.className = 'row-number';
      rowLabel.textContent = r;
      rowDiv.appendChild(rowLabel);

      const isExitRow = (r === 12);
      const fee = isExitRow ? 45 : 0;
      const typeDesc = isExitRow ? 'Extra Legroom Exit Row' : 'Economy Standard Seat';

      // Left Cluster (A, B, C)
      const leftCluster = document.createElement('div');
      leftCluster.className = 'seat-cluster';
      ['A', 'B', 'C'].forEach(l => {
        const btn = createSeatBtn(`${r}${l}`, typeDesc, fee, occupiedSeats);
        if (isExitRow) btn.style.borderColor = 'var(--status-info)';
        leftCluster.appendChild(btn);
      });
      rowDiv.appendChild(leftCluster);

      // Aisle
      const aisle1 = document.createElement('div');
      aisle1.className = 'aisle-space';
      rowDiv.appendChild(aisle1);

      // Center Cluster (D, E, F)
      const centerCluster = document.createElement('div');
      centerCluster.className = 'seat-cluster';
      ['D', 'E', 'F'].forEach(l => {
        const btn = createSeatBtn(`${r}${l}`, typeDesc, fee, occupiedSeats);
        if (isExitRow) btn.style.borderColor = 'var(--status-info)';
        centerCluster.appendChild(btn);
      });
      rowDiv.appendChild(centerCluster);

      // Aisle
      const aisle2 = document.createElement('div');
      aisle2.className = 'aisle-space';
      rowDiv.appendChild(aisle2);

      // Right Cluster (J, K, L)
      const rightCluster = document.createElement('div');
      rightCluster.className = 'seat-cluster';
      ['J', 'K', 'L'].forEach(l => {
        const btn = createSeatBtn(`${r}${l}`, typeDesc, fee, occupiedSeats);
        if (isExitRow) btn.style.borderColor = 'var(--status-info)';
        rightCluster.appendChild(btn);
      });
      rowDiv.appendChild(rightCluster);

      econCabin.appendChild(rowDiv);
    }
  }

  function createSeatBtn(code, type, fee, occupiedSet) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'seat-btn';
    btn.textContent = code;
    btn.setAttribute('data-code', code);
    btn.setAttribute('data-type', type);
    btn.setAttribute('data-fee', fee);

    const isOccupied = occupiedSet.has(code);
    if (isOccupied) {
      btn.classList.add('occupied');
      btn.disabled = true;
      btn.title = `Seat ${code} is occupied`;
    } else {
      if (state.selectedSeat && state.selectedSeat.code === code) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        // Deselect previous
        document.querySelectorAll('.seat-btn.selected').forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');

        state.selectedSeat = { code, type, fee };

        // Update live summary
        document.getElementById('liveSeatCodeDisplay').textContent = code;
        document.getElementById('liveSeatTypeDisplay').textContent = type;
        document.getElementById('liveSeatFeeDisplay').textContent = fee === 0 ? 'Included with Fare ($0)' : `Extra Seat Upgrade Fee: ${formatPrice(fee)}`;

        showToast(`Selected Seat ${code} (${type})`, 'info');
      });
    }

    return btn;
  }

  // ==========================================================================
  // 12. Review & Price Summary (Step 5)
  // ==========================================================================
  function prepareReviewStep() {
    const flight = state.selectedFlight;
    if (!flight) return;

    // Injected Flight Summary
    const flightSummaryEl = document.getElementById('reviewFlightDetailsSummary');
    if (flightSummaryEl) {
      flightSummaryEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
          <div>
            <strong style="font-size: 1.1rem; color: var(--text-primary);">${flight.airline} • ${flight.flightNumber}</strong>
            <div style="font-size: 0.8rem; color: var(--accent-cyan);">${flight.aircraft} • ${flight.cabin}</div>
          </div>
          <span class="badge-luxury">${flight.isRefundable ? 'Refundable' : 'Standard'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--text-primary); font-weight: 600;">
          <div>${flight.originCity} (${flight.originCode}) ${flight.departureTime}</div>
          <div style="color: var(--accent-gold);">→ ${flight.duration} →</div>
          <div>${flight.destCity} (${flight.destCode}) ${flight.arrivalTime}</div>
        </div>
      `;
    }

    // Injected Passenger Summary
    const passSummaryEl = document.getElementById('reviewPassengerDetailsSummary');
    if (passSummaryEl) {
      const p = state.passengerDetails;
      passSummaryEl.innerHTML = `
        <div><strong>Primary Traveler:</strong> ${p.title}. ${p.firstName} ${p.lastName} (${p.gender}, Born: ${p.dob})</div>
        <div><strong>Passport Document:</strong> ${p.passport} (${p.nationality})</div>
        <div><strong>Contact:</strong> ${p.email} | ${p.phone}</div>
        <div><strong>Meal Preference:</strong> ${p.meal}</div>
        <div><strong>Allocated Seat:</strong> <span class="text-gold" style="font-weight: 700;">Seat ${state.selectedSeat.code} (${state.selectedSeat.type})</span></div>
      `;
    }

    // Price Calculations
    recalculateCheckoutPrice();
  }

  function recalculateCheckoutPrice() {
    const flight = state.selectedFlight;
    if (!flight) return;

    const totalPax = state.passengers.adults + state.passengers.children + state.passengers.infants;
    const baseAirfare = flight.basePriceUSD * totalPax;
    const taxPrice = Math.round(baseAirfare * 0.16);
    const seatPrice = state.selectedSeat ? state.selectedSeat.fee : 0;

    let discount = 0;
    if (state.activePromo === 'AEROLUXE20') {
      discount = Math.round(baseAirfare * 0.20);
    } else if (state.activePromo === 'FIRSTCLASS') {
      discount = 150;
    } else if (state.activePromo === 'FLYHIGH') {
      discount = Math.round(baseAirfare * 0.15);
    }
    state.discountAmount = discount;

    const grandTotal = Math.max(0, (baseAirfare + taxPrice + seatPrice) - discount);

    document.getElementById('summaryPassengerCount').textContent = totalPax;
    document.getElementById('summaryBasePrice').textContent = formatPrice(baseAirfare);
    document.getElementById('summaryTaxPrice').textContent = formatPrice(taxPrice);
    document.getElementById('summarySeatCode').textContent = state.selectedSeat ? state.selectedSeat.code : 'Standard';
    document.getElementById('summarySeatPrice').textContent = formatPrice(seatPrice);

    const promoRow = document.getElementById('promoDiscountRow');
    if (promoRow) {
      if (discount > 0) {
        promoRow.style.display = 'flex';
        document.getElementById('summaryDiscountAmount').textContent = `-${formatPrice(discount)}`;
      } else {
        promoRow.style.display = 'none';
      }
    }

    document.getElementById('summaryGrandTotal').textContent = formatPrice(grandTotal);
  }

  // ==========================================================================
  // 13. Digital Boarding Pass & Confirmation (Step 6)
  // ==========================================================================
  function generateBoardingPass() {
    const flight = state.selectedFlight;
    const p = state.passengerDetails;
    const seat = state.selectedSeat;

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const pnr = `ALX-${randomSuffix}`;

    const newBooking = {
      id: `BK-${Date.now()}`,
      pnr: pnr,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      aircraft: flight.aircraft,
      originCode: flight.originCode,
      originCity: flight.originCity,
      destCode: flight.destCode,
      destCity: flight.destCity,
      departureDate: state.departureDate,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      passengerName: `${p.firstName} ${p.lastName}`,
      seatCode: seat ? seat.code : '12A',
      cabin: flight.cabin,
      status: 'Upcoming',
      bookedAt: new Date().toLocaleDateString()
    };

    state.confirmedBooking = newBooking;

    // Save to User Bookings & LocalStorage
    saveBooking(newBooking);

    // Populate Boarding Pass UI
    document.getElementById('passPnrCode').textContent = pnr;
    document.getElementById('passOriginCode').textContent = flight.originCode;
    document.getElementById('passOriginCity').textContent = `${flight.originCity} (${flight.originCode})`;
    document.getElementById('passDestCode').textContent = flight.destCode;
    document.getElementById('passDestCity').textContent = `${flight.destCity} (${flight.destCode})`;
    document.getElementById('passFlightNumber').textContent = flight.flightNumber;
    document.getElementById('passDuration').textContent = `${flight.duration} (${flight.stops})`;

    document.getElementById('passPassengerName').textContent = `${p.firstName} ${p.lastName}`;
    document.getElementById('passDepartureDate').textContent = state.departureDate;
    document.getElementById('passBoardingTime').textContent = `${flight.departureTime} (Boarding -45m)`;
    document.getElementById('passGate').textContent = 'Gate B12 (Terminal 4)';

    document.getElementById('passSeatCode').textContent = seat ? seat.code : '12A';
    document.getElementById('passCabinClass').textContent = flight.cabin;

    showToast(`Booking ${pnr} successfully confirmed!`, 'success');
    setBookingStep(6);
  }

  // ==========================================================================
  // 14. "My Bookings" Dashboard Persistence Engine
  // ==========================================================================
  function loadBookings() {
    const saved = localStorage.getItem('aeroluxe_user_bookings');
    if (saved) {
      try {
        state.userBookings = JSON.parse(saved);
      } catch (e) {
        state.userBookings = [];
      }
    }

    // If empty, initialize realistic sample flights
    if (!state.userBookings || state.userBookings.length === 0) {
      state.userBookings = [
        {
          id: 'BK-101',
          pnr: 'ALX-8419B',
          airline: 'AeroLuxe Flagship',
          flightNumber: 'AL-504',
          aircraft: 'Airbus A350-1000',
          originCode: 'JFK',
          originCity: 'New York',
          destCode: 'DXB',
          destCity: 'Dubai',
          departureDate: '2026-10-18',
          departureTime: '20:45',
          arrivalTime: '11:15+1',
          passengerName: 'Alexander Vance',
          seatCode: '2A',
          cabin: 'First Class',
          status: 'Upcoming'
        },
        {
          id: 'BK-102',
          pnr: 'ALX-3921T',
          airline: 'Singapore Airlines',
          flightNumber: 'SQ-025',
          aircraft: 'Boeing 787-10',
          originCode: 'LHR',
          originCity: 'London',
          destCode: 'SIN',
          destCity: 'Singapore',
          departureDate: '2026-11-04',
          departureTime: '11:40',
          arrivalTime: '07:30+1',
          passengerName: 'Alexander Vance',
          seatCode: '14K',
          cabin: 'Business',
          status: 'Upcoming'
        },
        {
          id: 'BK-103',
          pnr: 'ALX-1192M',
          airline: 'Qatar Airways',
          flightNumber: 'QR-702',
          aircraft: 'Airbus A350-900',
          originCode: 'CDG',
          originCity: 'Paris',
          destCode: 'DOH',
          destCity: 'Doha',
          departureDate: '2026-05-12',
          departureTime: '14:20',
          arrivalTime: '22:15',
          passengerName: 'Alexander Vance',
          seatCode: '3E',
          cabin: 'Business',
          status: 'Completed'
        }
      ];
      localStorage.setItem('aeroluxe_user_bookings', JSON.stringify(state.userBookings));
    }

    renderMyTrips('upcoming');
  }

  function saveBooking(booking) {
    state.userBookings.unshift(booking);
    localStorage.setItem('aeroluxe_user_bookings', JSON.stringify(state.userBookings));
    updateTripCounters();
  }

  function updateTripCounters() {
    const upcoming = state.userBookings.filter(b => b.status === 'Upcoming').length;
    const completed = state.userBookings.filter(b => b.status === 'Completed').length;
    const cancelled = state.userBookings.filter(b => b.status === 'Cancelled').length;

    const elUp = document.getElementById('countUpcoming');
    const elComp = document.getElementById('countCompleted');
    const elCanc = document.getElementById('countCancelled');

    if (elUp) elUp.textContent = upcoming;
    if (elComp) elComp.textContent = completed;
    if (elCanc) elCanc.textContent = cancelled;
  }

  function renderMyTrips(tab = 'upcoming') {
    const container = document.getElementById('tripsCardsContainer');
    if (!container) return;

    updateTripCounters();
    container.innerHTML = '';

    const targetStatus = tab.charAt(0).toUpperCase() + tab.slice(1);
    const trips = state.userBookings.filter(b => b.status === targetStatus);

    if (trips.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
          <div style="font-size: 2rem; margin-bottom: 0.75rem;">🎫</div>
          <h3 style="margin-bottom: 0.5rem;">No ${tab} bookings found</h3>
          <p class="text-secondary" style="font-size: 0.88rem; margin-bottom: 1.5rem;">Reserve an upcoming flight with our flight search widget above.</p>
          <a href="#searchSection" class="btn-primary-action">Search Flights Now</a>
        </div>
      `;
      return;
    }

    trips.forEach(trip => {
      const card = document.createElement('div');
      card.className = 'trip-booking-card';

      let statusPill = `<span class="badge-success">Confirmed</span>`;
      if (trip.status === 'Completed') statusPill = `<span class="badge-cyan">Completed</span>`;
      if (trip.status === 'Cancelled') statusPill = `<span class="badge-luxury" style="color: var(--status-danger); border-color: var(--status-danger);">Cancelled</span>`;

      card.innerHTML = `
        <div class="trip-card-left">
          <div class="trip-badge-pnr">
            ${statusPill}
            <span style="font-size: 0.82rem; color: var(--text-muted);">PNR: <strong class="text-gold">${trip.pnr}</strong></span>
            <span style="font-size: 0.82rem; color: var(--text-muted);">${trip.airline} (${trip.flightNumber})</span>
          </div>

          <div class="trip-card-route">
            <div class="trip-station">
              <span class="trip-station-code">${trip.originCode}</span>
              <span class="trip-station-name">${trip.originCity}</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">${trip.departureDate}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-blue)"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
              <span style="font-size: 0.75rem; color: var(--accent-cyan);">${trip.departureTime}</span>
            </div>

            <div class="trip-station">
              <span class="trip-station-code">${trip.destCode}</span>
              <span class="trip-station-name">${trip.destCity}</span>
            </div>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-secondary);">
            Traveler: <strong>${trip.passengerName}</strong> • Seat: <strong class="text-cyan">${trip.seatCode}</strong> (${trip.cabin})
          </div>
        </div>

        <div class="trip-actions-right">
          <button class="btn-primary-action btn-view-pass" style="padding: 0.45rem 1rem; font-size: 0.8rem;">
            View Boarding Pass
          </button>
          ${trip.status === 'Upcoming' ? `
            <button class="btn-signin btn-cancel-trip" style="padding: 0.4rem 1rem; font-size: 0.78rem; color: var(--status-danger); border-color: rgba(239, 68, 68, 0.3);">
              Cancel Itinerary
            </button>
          ` : ''}
        </div>
      `;

      // View Pass Action
      card.querySelector('.btn-view-pass').addEventListener('click', () => {
        document.getElementById('passPnrCode').textContent = trip.pnr;
        document.getElementById('passOriginCode').textContent = trip.originCode;
        document.getElementById('passOriginCity').textContent = trip.originCity;
        document.getElementById('passDestCode').textContent = trip.destCode;
        document.getElementById('passDestCity').textContent = trip.destCity;
        document.getElementById('passFlightNumber').textContent = trip.flightNumber;
        document.getElementById('passPassengerName').textContent = trip.passengerName;
        document.getElementById('passDepartureDate').textContent = trip.departureDate;
        document.getElementById('passSeatCode').textContent = trip.seatCode;
        document.getElementById('passCabinClass').textContent = trip.cabin;

        document.getElementById('bookingStepper').classList.add('active');
        setBookingStep(6);
      });

      // Cancel Trip Action
      const cancelBtn = card.querySelector('.btn-cancel-trip');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          if (confirm(`Are you sure you want to cancel reservation ${trip.pnr}? A credit voucher will be generated.`)) {
            trip.status = 'Cancelled';
            localStorage.setItem('aeroluxe_user_bookings', JSON.stringify(state.userBookings));
            renderMyTrips('upcoming');
            showToast(`Reservation ${trip.pnr} has been cancelled.`, 'warning');
          }
        });
      }

      container.appendChild(card);
    });
  }

  // ==========================================================================
  // 15. Event Listeners & Interactive Binding
  // ==========================================================================
  function bindEvents() {
    // 1. Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        showToast(`Switched to ${next} theme`, 'info');
      });
    }

    // 2. Currency Selector Change
    const curSelector = document.getElementById('currencySelector');
    if (curSelector) {
      curSelector.addEventListener('change', (e) => {
        state.currency = e.target.value;
        showToast(`Currency changed to ${state.currency}`, 'info');

        // Re-render price displays
        if (state.searchResults.length > 0) renderFlightResults();
        if (state.currentStep === 5) recalculateCheckoutPrice();
      });
    }

    // 3. Navbar Sticky Effect on Scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // 4. Mobile Menu Drawer
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        const isHidden = mobileDrawer.style.display === 'none';
        mobileDrawer.style.display = isHidden ? 'flex' : 'none';
      });
      document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.style.display = 'none';
        });
      });
    }

    // 5. Search Flights Form Submission
    const searchForm = document.getElementById('flightSearchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        executeFlightSearch();
      });
    }

    // 6. Filter Controls
    const priceSlider = document.getElementById('priceRangeSlider');
    const priceDisplay = document.getElementById('priceRangeDisplay');
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener('input', (e) => {
        priceDisplay.textContent = `Max: $${parseInt(e.target.value, 10).toLocaleString()}`;
        renderFlightResults();
      });
    }

    document.querySelectorAll('input[name="filterStops"]').forEach(cb => {
      cb.addEventListener('change', renderFlightResults);
    });
    document.querySelectorAll('input[name="filterAirline"]').forEach(cb => {
      cb.addEventListener('change', renderFlightResults);
    });
    document.querySelectorAll('input[name="filterTime"]').forEach(cb => {
      cb.addEventListener('change', renderFlightResults);
    });

    document.getElementById('btnResetFilters')?.addEventListener('click', resetFilters);

    // Mobile filter drawer toggle
    const filterToggleBtn = document.getElementById('filterDrawerToggleBtn');
    const filtersSidebar = document.getElementById('filtersSidebar');
    if (filterToggleBtn && filtersSidebar) {
      filterToggleBtn.addEventListener('click', () => {
        filtersSidebar.classList.toggle('mobile-open');
      });
    }

    // 7. Sorting Pills
    const sortPills = document.querySelectorAll('.sort-pill');
    sortPills.forEach(pill => {
      pill.addEventListener('click', () => {
        sortPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const sortType = pill.getAttribute('data-sort');

        if (sortType === 'cheapest') {
          state.searchResults.sort((a, b) => a.basePriceUSD - b.basePriceUSD);
        } else if (sortType === 'fastest') {
          state.searchResults.sort((a, b) => a.durationMinutes - b.durationMinutes);
        } else if (sortType === 'earliest') {
          state.searchResults.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        } else {
          // Recommended
          state.searchResults.sort((a, b) => a.stopCount - b.stopCount || a.basePriceUSD - b.basePriceUSD);
        }
        renderFlightResults();
      });
    });

    // 8. Step 3: Passenger Form Validation & Submission
    const passForm = document.getElementById('passengerDetailsForm');
    if (passForm) {
      passForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstName = document.getElementById('passFirstName').value.trim();
        const lastName = document.getElementById('passLastName').value.trim();
        const dob = document.getElementById('passDob').value;
        const nationality = document.getElementById('passNationality').value.trim();
        const passport = document.getElementById('passPassport').value.trim();
        const email = document.getElementById('passEmail').value.trim();
        const phone = document.getElementById('passPhone').value.trim();

        let valid = true;

        if (!firstName) {
          document.getElementById('groupFirstName').classList.add('has-error');
          valid = false;
        } else {
          document.getElementById('groupFirstName').classList.remove('has-error');
        }

        if (!lastName) {
          document.getElementById('groupLastName').classList.add('has-error');
          valid = false;
        } else {
          document.getElementById('groupLastName').classList.remove('has-error');
        }

        if (!passport) {
          document.getElementById('groupPassport').classList.add('has-error');
          valid = false;
        } else {
          document.getElementById('groupPassport').classList.remove('has-error');
        }

        if (!email || !email.includes('@')) {
          document.getElementById('groupEmail').classList.add('has-error');
          valid = false;
        } else {
          document.getElementById('groupEmail').classList.remove('has-error');
        }

        if (!valid) {
          showToast('Please fill out all required passport travel fields.', 'warning');
          return;
        }

        state.passengerDetails = {
          title: document.getElementById('passTitle').value,
          firstName,
          lastName,
          dob,
          gender: document.getElementById('passGender').value,
          nationality,
          passport,
          email,
          phone,
          meal: document.getElementById('passMeal').value,
          special: document.getElementById('passSpecial').value
        };

        buildSeatMap();
        setBookingStep(4); // Move to Seat Selection
        showToast('Passenger details saved. Please choose your aircraft seat.', 'success');
      });
    }

    document.getElementById('btnBackToFlights')?.addEventListener('click', () => setBookingStep(1));

    // 9. Step 4: Seat Selection Buttons
    document.getElementById('btnConfirmSeatSelection')?.addEventListener('click', () => {
      prepareReviewStep();
      setBookingStep(5); // Move to Review
    });
    document.getElementById('btnBackToPassenger')?.addEventListener('click', () => setBookingStep(3));

    // 10. Step 5: Review & Promo Code
    document.getElementById('btnBackToSeatmap')?.addEventListener('click', () => setBookingStep(4));

    const applyPromoBtn = document.getElementById('btnApplyPromo');
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => {
        const input = document.getElementById('promoCodeInput');
        const code = input.value.trim().toUpperCase();

        if (code === 'AEROLUXE20') {
          state.activePromo = 'AEROLUXE20';
          recalculateCheckoutPrice();
          showToast('Promo Code AEROLUXE20 Applied: 20% discount granted!', 'success');
        } else if (code === 'FIRSTCLASS') {
          state.activePromo = 'FIRSTCLASS';
          recalculateCheckoutPrice();
          showToast('Promo Code FIRSTCLASS Applied: $150 suite credit granted!', 'success');
        } else if (code === 'FLYHIGH') {
          state.activePromo = 'FLYHIGH';
          recalculateCheckoutPrice();
          showToast('Promo Code FLYHIGH Applied: 15% discount granted!', 'success');
        } else {
          showToast('Invalid promo code. Use AEROLUXE20, FIRSTCLASS, or FLYHIGH', 'warning');
        }
      });
    }

    document.getElementById('btnCompleteReservation')?.addEventListener('click', () => {
      generateBoardingPass();
    });

    // 11. Step 6: Boarding Pass Actions
    document.getElementById('btnPrintBoardingPass')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btnGoToMyTrips')?.addEventListener('click', () => {
      document.getElementById('bookingStepper').classList.remove('active');
      document.getElementById('confirmationSection').classList.remove('active');
      const myTripsSec = document.getElementById('myBookingsSection');
      myTripsSec.classList.add('active');
      renderMyTrips('upcoming');
      myTripsSec.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btnBookAnotherFlight')?.addEventListener('click', () => {
      setBookingStep(1);
      window.scrollTo({ top: document.getElementById('searchSection').offsetTop - 30, behavior: 'smooth' });
    });

    // 12. My Bookings Tabs
    const tripTabs = document.querySelectorAll('.trip-tab-btn');
    tripTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tripTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderMyTrips(tab.getAttribute('data-tab'));
      });
    });

    // Nav Link "My Bookings"
    document.getElementById('navMyTripsLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('myBookingsSection').classList.add('active');
      renderMyTrips('upcoming');
      document.getElementById('myBookingsSection').scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('mobileMyTrips')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('myBookingsSection').classList.add('active');
      renderMyTrips('upcoming');
      document.getElementById('myBookingsSection').scrollIntoView({ behavior: 'smooth' });
    });

    // 13. Popular Destination Cards 1-Click Search
    const destCards = document.querySelectorAll('.destination-card');
    destCards.forEach(card => {
      card.addEventListener('click', () => {
        const code = card.getAttribute('data-code');
        const city = card.getAttribute('data-city');
        const targetAirport = airportDatabase.find(a => a.code === code) || { code, city, country: '', name: `${city} Intl` };

        state.destination = targetAirport;
        document.getElementById('destCodeDisplay').textContent = targetAirport.code;
        document.getElementById('destSubtextDisplay').textContent = `${targetAirport.city} (${targetAirport.code})`;

        showToast(`Route updated to ${targetAirport.city} (${targetAirport.code})`, 'info');
        document.getElementById('searchSection').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => executeFlightSearch(), 400);
      });
    });

    // 14. Copy Promo Codes
    document.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = btn.getAttribute('data-code');
        navigator.clipboard.writeText(code).then(() => {
          showToast(`Promo code "${code}" copied to clipboard!`, 'success');
        }).catch(() => {
          showToast(`Use promo code: ${code}`, 'info');
        });
      });
    });

    // 15. FAQ Accordion
    document.querySelectorAll('.faq-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });

    // 16. Modals Close Handlers
    document.getElementById('btnCloseDetailsModal')?.addEventListener('click', () => {
      document.getElementById('flightDetailsModal').classList.remove('show');
    });
    document.getElementById('flightDetailsModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'flightDetailsModal') {
        document.getElementById('flightDetailsModal').classList.remove('show');
      }
    });

    // Sign In Modal
    const signInModal = document.getElementById('signInModal');
    document.getElementById('signInBtn')?.addEventListener('click', () => {
      signInModal.classList.add('show');
    });
    document.getElementById('btnCloseSignInModal')?.addEventListener('click', () => {
      signInModal.classList.remove('show');
    });
    signInModal?.addEventListener('click', (e) => {
      if (e.target.id === 'signInModal') signInModal.classList.remove('show');
    });
    document.getElementById('btnLoginSubmit')?.addEventListener('click', () => {
      document.getElementById('navUserLabel').textContent = 'Alexander V.';
      signInModal.classList.remove('show');
      showToast('Welcome back, Alexander Vance (Diamond Elite Member)', 'success');
    });
    document.getElementById('btnGuestContinue')?.addEventListener('click', () => {
      signInModal.classList.remove('show');
      showToast('Continuing as Guest Traveler', 'info');
    });

    // Newsletter Form
    document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newsletterEmail');
      if (input && input.value) {
        showToast('Welcome to AeroLuxe Private Club. Your 20% voucher is sent!', 'success');
        input.value = '';
      }
    });
  }

  // ==========================================================================
  // 16. Search Execution
  // ==========================================================================
  function executeFlightSearch() {
    const depDateInput = document.getElementById('departureDateInput');
    if (depDateInput && depDateInput.value) {
      state.departureDate = depDateInput.value;
    }

    showToast(`Searching flights: ${state.origin.code} → ${state.destination.code}...`, 'info');

    // Generate realistic flights
    state.searchResults = generateMockFlights(state.origin, state.destination, state.cabinClass);

    // Update Header
    const routeHeader = document.getElementById('resultsRouteHeader');
    if (routeHeader) {
      routeHeader.textContent = `${state.origin.city} (${state.origin.code}) → ${state.destination.city} (${state.destination.code})`;
    }

    // Activate Stepper & Show Results
    document.getElementById('bookingStepper').classList.add('active');
    setBookingStep(1);

    // Render cards
    renderFlightResults();
  }

  // ==========================================================================
  // 17. Application Initialization
  // ==========================================================================
  function init() {
    applyTheme(state.theme);
    initDates();
    setupAutocomplete();
    setupPassengerPopover();
    bindEvents();
    loadBookings();

    // Auto-search default route on initial page load for immediate wow factor
    executeFlightSearch();
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
