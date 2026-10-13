# AEROVA — Ultra-Premium Flight Booking & Reservation Platform

> **"Fly Beyond Expectations."**  
> An international portfolio-grade flight booking and airline reservation platform engineered with precision HTML5, Vanilla CSS3, and ES6 JavaScript.

---

## 📁 Strict Root-Level File Structure

This project strictly adheres to the **NO FOLDERS** requirement. All assets, scripts, and stylesheets reside directly in the root directory:

```text
Flight Booking & Reservation System/
├── index.html        # Complete Single-Page Application (All 7 Views & Modals)
├── style.css         # Luxury Navy & Champagne Gold Design System, Seat Map & Print Styles
├── script.js         # Reactive State Controller, Flight Engine, Canvas QR & LocalStorage
├── favicon.svg       # Sleek Golden Wing Brand Icon
└── README.md         # Comprehensive Documentation & Showcase Guide
```

**Zero build tools, zero npm install, and zero external CDN blockers required.** Simply open `index.html` directly in any web browser or through VS Code Live Server.

---

## ✈️ Key Features & Technical Highlights

### 1. Interactive Flight Search Engine
- **Trip Types**: Smooth switching between **Round Trip**, **One Way**, and **Multi-City** segments with dynamic input fields.
- **Airport Autosuggest**: Search-as-you-type directory of 18+ major global hubs (Peshawar `PEW`, Dubai `DXB`, London `LHR`, Doha `DOH`, Istanbul `IST`, New York `JFK`, Riyadh `RUH`, Singapore `SIN`, Tokyo `HND`, etc.).
- **Airport Swap (`⇄`)**: Animated 180° rotation button that swaps origin and destination seamlessly.
- **Custom Passenger & Cabin Popover**: Dynamic steppers (`+` / `−`) for Adults, Children, and Infants with constraint logic (e.g., infants cannot exceed adults, max 9 passengers).

### 2. Flight Results, Filter & Sorting System
- **Realistic Flight Generator**: Realistic schedules across flagship carrier **AEROVA AIR** (AV-204, AV-410, AV-890) and partner airlines (**SKYLINE AIR**, **GLOBALWINGS**, **NOVA AIRWAYS**, **ORBIT AIR**).
- **Live Reactive Filters**:
  - Stops (Non-stop, 1 Stop, 2+ Stops)
  - Airlines checkboxes
  - Price Range Slider ($150 – $2,500)
  - Departure Time Windows (Morning, Afternoon, Evening)
  - Refundable Policy & Baggage Included toggles
  - **Reset All Filters** button that instantly restores default results.
- **Dynamic Sorting**: Instant re-ordering by *Recommended*, *Cheapest*, *Fastest*, *Earliest Departure*, or *Latest Departure*.
- **Flight Details Modal**: Tabbed view featuring Aircraft Specs, In-flight Amenities (Wi-Fi, Power, Dining), Baggage Rules, and Cancellation Policies.

### 3. Multi-Step Booking Flow & Progress Stepper
Visual stepper tracking user progress:
1. **Search** → 2. **Flight** → 3. **Passengers** → 4. **Seats** → 5. **Extras** → 6. **Payment** → 7. **Confirmation**

### 4. Interactive Airplane Cabin Seat Map
- **Realistic Fuselage Layout**: Modeled after a **Boeing 787-9 Dreamliner** with cockpit nose, aisle, window indicators, First/Business Class rows (2-2 configuration), and Economy cabin rows (3-3 configuration: A-B-C | D-E-F).
- **Seat Types & Fees**:
  - Available (Click to select)
  - Occupied (Pre-allocated, non-clickable with disabled cursor)
  - Selected (Glowing champagne gold state)
  - Extra Legroom Rows (+$35) & Front Row Upgrades
- Live seat assignment badge and real-time fee addition to the fare breakdown.

### 5. Baggage, Travel Extras & Sticky Fare Summary
- **Baggage Selection**: Personal Item (Free), Cabin Carry-on (Free), Checked Bag 23kg (+$45), Heavy Bag 32kg (+$75).
- **Add-on Services**: Priority Boarding (+$25), VIP Lounge Access (+$65), Chef's Gourmet Dining (+$30), Comprehensive Travel Shield Insurance (+$40).
- **Sticky Fare Breakdown**: Dynamic live calculations of base airfare, taxes, baggage, seat fees, and extra services.
- **Promotional Voucher Engine**:
  - `FLY10` — 10% discount on base airfare
  - `AEROVA20` — 20% discount on flagship flights
  - `FIRSTFLY` — $50 flat discount

### 6. FinTech-Style Demo Checkout
- **Realistic Credit Card Visual**: Live metallic debit/credit card preview that reflects the cardholder name, masked card number, expiry, and dynamic brand logo (Visa, Mastercard, Amex) as typed.
- **Card Formatting**: Automatic 4-digit spacing and expiry slash formatting (`MM/YY`).
- **Security Assurances**: 256-Bit SSL simulated encryption badge and PCI-DSS Level 1 notices.

### 7. Luxury Digital Boarding Pass & E-Ticket
- **Perforated Boarding Pass**: Airline boarding pass styling with semicircular cutout notches, dashed tear fold line, flight number, airport codes, boarding gate, terminal, zone, and seat.
- **Procedural Offline QR Matrix**: Native HTML5 `<canvas>` rendering of a valid 2D matrix barcode completely offline without any external QR libraries or CDNs.
- **Export & Calendar Actions**:
  - **Print / Save PDF**: Custom `@media print` CSS formats only the boarding pass cleanly on high-contrast white paper.
  - **Download Ticket Data**: Generates a formatted JSON ticket file.
  - **Add to Calendar**: Generates and downloads a standard `.ics` calendar invite file.

### 8. My Bookings & Reservation Management
- **Persistent Dashboard**: Loaded from `localStorage` with pre-seeded realistic reservations plus any newly booked flights.
- **Management Features**:
  - Change Assigned Seat
  - Add Extra Checked Baggage
  - View Digital Boarding Pass
  - Cancel Reservation with cancellation confirmation modal and status update.

### 9. Online Check-In System
- Search by **Booking Reference (PNR)** and **Passenger Last Name**.
- Verification against saved reservations.
- Instant gate assignment (e.g. `B12`) and direct boarding pass generation.

### 10. Saved Flights (Watchlist) & Favorites
- Heart icon (`♡` / `♥`) on any flight card saves flights directly to `localStorage`.
- Dedicated Watchlist panel with instant "Book Now" shortcuts.

### 11. Global Destination Explorer & Curated Deals
- Handpicked world destinations: Dubai, London, Istanbul, Doha, Riyadh, Abu Dhabi, Kuala Lumpur, Paris, Tokyo.
- "Book Flights" CTAs that pre-fill search fields and immediately initiate the flight search flow.

### 12. Global Search Command Palette (`Ctrl + K`)
- Instant modal to search destinations, airport codes, bookings, or airlines with keyboard shortcuts.

### 13. Currency Switcher
- Live price conversion across **USD ($)**, **EUR (€)**, **GBP (£)**, **AED (د.إ)**, and **PKR (₨)**.

---

## 🚀 How to Run

1. Open File Explorer and navigate to:
   ```text
   f:\day3\Flight Booking & Reservation System\
   ```
2. Double-click `index.html` to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.
3. Or in VS Code, right-click `index.html` and click **Open with Live Server**.

---

## 🎨 Color Palette & Aesthetics

| Color Role | Hex / Value | Description |
|---|---|---|
| **Midnight Navy (Deep)** | `#050a14` | Deep obsidian night-sky base background |
| **Primary Navy** | `#0a1124` | Solid header, navigation, and footer surface |
| **Surface Elevated** | `#0f1c38` / `#16264c` | Cards, popovers, and fuselage containers |
| **Electric Sapphire** | `#2563eb` / `#38bdf8` | Airline accents, progress indicators, flight paths |
| **Champagne Gold** | `#d4af37` / `#f5e298` | Luxury branding, flagship badges, selected seats |
| **Crisp Slate & White** | `#ffffff` / `#94a3b8` | High-contrast readable typography |

---

## 📄 License & Disclaimer

This project is a high-end portfolio demonstration designed for showcasing modern front-end web engineering, UI/UX design, and offline capability. It does not process real monetary transactions or issue real airline tickets.
