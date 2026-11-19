# StaySync – Smart PG & Hostel Management System

**StaySync** is a centralized, owner-only SaaS dashboard engineered for Indian Paying Guest (PG) and hostel owners to manage rooms, bed allocations, students, rent collection, operating expenses, maintenance complaints, visitors, and financial analytics.

Inspired by premium fintech interfaces (Stripe, Linear), StaySync delivers a navy blue and electric blue palette, high typography legibility (Inter), responsive cards, Recharts visualizations, and a deterministic AI assistant grounded in verified database records.

---

## ⚡ Quick Start & Live Demo

The development server is running locally:
```bash
# To run the web server:
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### Hackathon Demo Credentials
Click **"⚡ 1-Click Demo Owner Sign In"** on the login page, or use:
- **Email:** `rajesh.kumar@staysync.in`
- **Password:** `password123` (or any string in demo mode)
- **PG Property:** *Sri Sai Balaji Executive PG & Co-Living, Koramangala, Bengaluru*

---

## 🚀 Key Modules & Capabilities

### 1. Executive Dashboard
- **Key Performance Indicators (KPIs):**
  - Total Rooms (10)
  - Total Beds (25) & Live Occupancy Rate (60% • 15/25 Beds)
  - Vacant Beds Available (10 Beds ready for immediate move-in)
  - Total Active Residents (15 Verified Students)
  - Monthly Rent Billed vs. Actual Rent Collected
  - Pending & Overdue Rent Collection
  - Monthly Operating Expenses
  - **Net Operating Profit** calculated dynamically:
    $$\text{Net Profit} = \text{Actual Rent Collected} - \text{Recorded Expenses}$$
- **Interactive Visualizations:**
  - Multi-month Revenue vs. Expense trend chart (Recharts)
  - Bed Occupancy Ratio Donut chart
- **Operational Widgets:**
  - Upcoming rent deadlines with 1-click **"Collect Now"** modal
  - Urgent maintenance tickets list with quick resolve action
  - Live activity ledger stream
  - Active visitors currently inside the building

### 2. Room & Bed Management
- **Visual Bed Slots Layout:** View every room with interactive bed cards (Bed A, Bed B, Bed C...) showing occupant name, phone, or a green "+ Allocate Bed" button for vacant slots.
- **Floor & Room Configuration:** Manage floors (Ground, 1st, 2nd, 3rd), room capacity (1 to 4 sharing), rent tariffs, AC / Non-AC specifications, and amenity tags.
- **Bed Transfers & Anti-Duplicate Protection:** Transfer residents between rooms with automatic vacancy validation and conflict prevention.

### 3. Student & Resident Directory
- **Indian Resident Profiles:** Full name, photo avatar, generated Student ID (`STU-2026-xxx`), contact number, email, parent/guardian name and phone, emergency contact, college & course, academic year, permanent address, joining date, room & bed number, monthly rent, and security deposit.
- **KYC Verification:** Tracks Aadhaar Card, PAN Card, Passport, or Driving License.
- **Comprehensive Profile Modal:** View personal details, assigned bed, full payment history ledger, complaints logged, and 1-click **"Check Out Resident"** flow (settles security deposit and vacates bed).

### 4. Rent Collection & Invoices
- **Financial Statuses:** `Paid`, `Partially Paid`, `Pending`, and `Overdue`.
- **Flexible Payments:** Supports full settlement as well as custom partial payments (automatically updates balance and status).
- **Payment Modes:** UPI (GPay, PhonePe, Paytm), Bank Transfer (IMPS, NEFT), Cash at counter, and Card with UTR / Transaction Reference tracking.
- **Official Printable Rent Receipt:** Generates formatted tax invoice with PG address, tenant details, rent breakdown, balance remaining, Indian currency in words (e.g. *Twelve Thousand Five Hundred Rupees Only*), and native print styling (`window.print()`).
- **CSV Export:** 1-click download of rent collection sheets.

### 5. Operating Expenses & Utility Bills
- **8 Tracked Categories:** Electricity (e.g., BESCOM), Water (tankers & RO), Food (mess provisions), Internet (Airtel fiber), Maintenance, Staff Salaries (cooks & housekeepers), Cleaning supplies, and Other.
- **Net Margin Calculation:** Real-time net operating margin tracking.
- **Category Allocation Chart:** Donut chart breakdown of operational costs.
- **CSV Audit Export.**

### 6. Complaints & Maintenance Tracker
- **Categories:** Electricity, Water, Wi-Fi, Cleaning, Furniture, Plumbing, Food, and Other.
- **Priority Levels:** `Low`, `Medium`, `High`, and `Urgent` (color-coded).
- **Status Lifecycle:** `New` → `In Progress` → `Resolved` (with technician resolution notes).

### 7. Gate Entry & Visitor Register
- **Visitor Logs:** Visitor name, phone, resident being visited, room number, purpose, date, entry time, and exit time.
- **Active Visitors:** Real-time tracking of guests currently inside the PG with 1-click checkout.

### 8. Reports & Analytics
- **Multi-Month Financials:** Comparative revenue, expense, and profit margins.
- **Floor-wise Occupancy Breakdown:** Compares capacity, occupied beds, and vacant slots per floor.
- **Tabbed Audit Tables:** Collection report, pending dues list, vacant beds directory, and expense audit log with instant CSV export.

### 9. StaySync AI (Verified Database Intelligence)
- Built-in business intelligence interface that deterministic queries live database records:
  - *"How much rent is pending?"*
  - *"Which rooms have vacant beds?"*
  - *"How many students are currently staying?"*
  - *"What is this month's actual collection?"*
  - *"Which complaints are unresolved?"*
  - *"What is our net profit this month?"*
  - *"Who has overdue rent?"*
- Features pre-set prompt chips, structured metrics cards, and mini-tables directly inside the chat.
- Transparently labeled: zero hallucinations, strictly verified against live records.

### 10. Data Persistence & Backup Engine
- Backed by persistent localStorage (`staysync_data_v2`).
- 1-click **"Reset Demo Data"** button to restore the verified 10-room Bangalore dataset anytime.
- Full JSON backup export and restore capabilities.

---

## 🛠️ Technology Stack
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Navy `#0B132B`, `#0F172A`, Electric Blue `#2563EB`)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Storage:** Reactive Persistent Client-Side Engine with localStorage synchronization
- **Formatting:** Indian Rupee (`Intl.NumberFormat('en-IN')`), Number-to-Words INR Converter, CSV Exporter
