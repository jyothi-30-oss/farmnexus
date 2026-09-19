# 🌾 FarmNexus — Farmer-to-Buyer Direct Marketplace

FarmNexus is a modern, responsive full-stack web application designed to strengthen market linkages and price discovery for farmers. It allows farmers to directly list crops at their own expected price (which becomes the final selling price) and buyers to purchase crops with zero unnecessary intermediaries and no price negotiation.

---

## 🌟 Key Features & Business Logic

### 1. Dual User Roles (Strictly 2 Roles)
- **Farmer**: Lists crops, reviews pending buyer purchase requests, accepts/rejects, manages fulfilment statuses, and specifies delivery charges.
- **Buyer**: Browses farmer crops with fixed final prices, submits purchase requests with **quantity only**, and tracks orders.
- **Zero Admin**: No admin role, no admin credentials, and no admin dashboard.

### 2. Trilingual Support
- Supports **English**, **Telugu (తెలుగు)**, and **Hindi (हिंदी)**.
- Initial interactive language selection screen on first launch.
- Instant language switcher in the navigation bar dynamically updates all labels, buttons, forms, status badges, and messages.

### 3. Pricing Rules
- **Reference Market Prices** (Fixed project reference demo values):
  - Rice: ₹24/kg
  - Wheat: ₹30/kg
  - Maize: ₹25/kg
  - Cotton: ₹70/kg
  - Chilli: ₹120/kg
  - Tomato: ₹30/kg
  - Potato: ₹25/kg
  - Onion: ₹35/kg
  - Groundnut: ₹80/kg
  - Sugarcane: ₹4/kg
- **Farmer Final Price**: The farmer enters their *Expected Price Per Unit*, which becomes the **final, non-negotiable selling price**.
- **Buyer Quantity Only**: Buyers enter only the required quantity. Crop amount is computed automatically:
  $$\text{Crop Amount} = \text{Quantity} \times \text{Final Price Per Unit}$$

### 4. Requests & Fulfilment Workflow
- **Pending Requests Only**: Farmer's *Buyer Requests* page shows **strictly pending requests**.
- Once a request is accepted or rejected:
  - It **immediately disappears** from Buyer Requests.
  - It moves automatically into **My Orders**.
- **Accepted Orders**:
  - Sequential status flow: `Accepted` &rarr; `Ready` &rarr; `Shipped` &rarr; `Delivered`.
  - Farmer can set a **Delivery Charge** for accepted orders:
    $$\text{Total Amount} = \text{Crop Amount} + \text{Delivery Charge}$$
- **Rejected Orders**:
  - Permanently remain `Rejected` and cannot transition to Ready, Shipped, or Delivered.
- **Inventory Depletion**:
  - When an order is accepted, the listing's available quantity is reduced by the accepted quantity.
  - When quantity reaches 0, the listing is automatically removed from active browse listings.

### 5. Direct Phone Visibility
- Buyers can view the farmer's verified phone number on listings and orders.
- Farmers can view the buyer's phone number on pending requests and orders.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React icons.
- **Backend**: Node.js, Express, bcryptjs (password hashing), jsonwebtoken (JWT auth).
- **Database**: Firebase Firestore (configured via `firebase-admin`).
  - *Seamless Local Fallback*: Includes a built-in persistent Firestore emulator stored at `server/data/firestore_db.json`. Runs out-of-the-box without requiring Google Cloud credentials, but seamlessly connects to production Cloud Firestore as soon as a service account is configured in `.env`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Environment Configuration
The backend is pre-configured with default values in `server/.env`.
```env
PORT=5055
JWT_SECRET=farmnexus_secure_jwt_secret_key_2025_agri

# (Optional) To connect to your Google Firebase Cloud Firestore project:
# FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### 3. Run the Application
You can run both server and client together from the root:
```bash
# Start backend server (runs on http://localhost:5055)
npm run server

# In another terminal, start frontend client (runs on http://localhost:5173 or 5174)
npm run client
```

### 4. Run Automated Integration Tests
Run the comprehensive test suite verifying 35 business rules, security guards, and database transactions:
```bash
npm run test
```

---

## 📁 Project Structure

```
farm/
├── package.json               # Root scripts
├── README.md
├── client/                    # React + Vite Frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/        # Navbar, Footer, LanguageSelectorModal
│   │   ├── context/           # AuthContext, LanguageContext
│   │   ├── i18n/              # English, Telugu, Hindi dictionaries
│   │   ├── pages/
│   │   │   ├── Auth/          # LoginPage, FarmerRegister, BuyerRegister
│   │   │   ├── Farmer/        # Dashboard, SellCrops, Listings, Requests, Orders
│   │   │   ├── Buyer/         # Dashboard, BrowseCrops, Orders
│   │   │   └── Shared/        # ProfilePage
│   │   ├── constants/         # Crops list & reference market prices
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
└── server/                    # Node.js + Express Backend
    ├── package.json
    ├── .env
    ├── test_flow.js           # Automated end-to-end integration tests
    └── src/
        ├── config/            # firebase.js (Admin SDK & Local Firestore Adapter)
        ├── constants/         # marketPrices.js
        ├── middleware/        # auth.js (JWT & role authorization)
        ├── routes/            # auth, listings, requests, orders
        └── server.js          # Express app entry point
```
