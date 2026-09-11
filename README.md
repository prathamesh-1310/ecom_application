# Luxury Piercing Jewelry E-Commerce & B2B Platform

A modern, high-performance, and premium full-stack e-commerce solution tailored for piercing jewelry retail and wholesale (B2B) businesses. Built with **Node.js, Express, Prisma ORM, SQLite, React (Vite), and Tailwind CSS**.

The platform features a dual-storefront architecture with an integrated Admin Dashboard, strict **No Return and No Refund Policy** enforcement, B2B wholesale onboarding workflows, and exceptional case support ticket handling.

---

## 🌟 Key Architecture & Features

### 🛍️ Dual-Platform Experience
1. **Retail E-Commerce Portal**: Open to all retail customers for browsing, adding to cart, wishlist management, address book, checkout, and order tracking.
2. **B2B Wholesale Portal**: Restricted portal for verified business clients featuring wholesale pricing, Minimum Order Quantity (MOQ) validation, and custom business registration approvals.
3. **Unified Admin Panel**: Single dashboard for managing products, categories, B2B applications, orders, support requests, and metrics.

---

## ✅ Completed Features

### 🏢 Core Platform & Design
- [x] **Monorepo Architecture**: Clean separation between `frontend` (React + Vite + Tailwind CSS) and `backend` (Node.js + Express + Prisma ORM).
- [x] **Luxury UI/UX Design**: Elegant dark gold/beige palette with Playfair Display and Inter fonts, responsive navigation, and mobile-first design.
- [x] **Strict No Return & No Refund Policy System**:
  - Enforced default product policy attributes (`returnable: false`, `refundable: false`).
  - Dedicated Policy Page (`/policy`).
  - Mandatory policy acceptance checkbox & warning notice on Checkout before payment.
  - Policy notices across Product Details, Cart, Confirmation, Account, and Footer.
  - Complete DB audit trail (`PolicyAcceptance`) storing timestamp, version, user IP, and order linkage.

### 🛒 Retail Storefront & Customer Features
- [x] **Homepage**: Dynamic hero sections, curated collections, featured products, trust highlights, and newsletter signup.
- [x] **Product Catalog & Filters**: Category/Subcategory filtering, search bar, stock badges, and visibility badges (Retail / B2B / Both).
- [x] **Product Details Page**: Image galleries, variant selectors (Size, Material, Color), hygiene notices, care instructions, and stock indicators.
- [x] **Cart & Wishlist Management**: Full CRUD cart management, variant preservation, subtotal/shipping/tax calculation, and coupon code application.
- [x] **Checkout Flow**: Step-by-step checkout with address selection/creation, shipping method selection, mandatory policy agreement, and Razorpay payment gateway integration.
- [x] **Customer Account Area**: Saved address management, order history list, order detail view with breakdown, and real-time shipping status tracking.

### 🏢 B2B Wholesale Management
- [x] **Business Onboarding**: B2B Registration (`/register-b2b`) capturing GSTIN, company details, business type, and expected volumes.
- [x] **Approval Lifecycle**: Status flow (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) with dedicated `B2BPendingApproval` screen.
- [x] **B2B Portal Access**: Restricted wholesale catalog (`/b2b/catalog`) accessible only to approved wholesale buyers.
- [x] **Wholesale Pricing & MOQ**: Enforced wholesale pricing tiers and Minimum Order Quantity (MOQ) validation on cart & checkout.

### 🛠️ Exceptional Case Support System
- [x] **No-Return Support Workflow**: Replaced generic return buttons with "Contact Support for Exceptional Issue".
- [x] **Support Request Intake**: Dedicated ticket creation for damaged items, wrong shipments, or lost packages with file attachments.
- [x] **Admin Resolution Paths**: Audit log & admin remedies (Replacement, Store Credit, Manual Refund Exception).

### ⚙️ Admin Dashboard & Management
- [x] **Analytics Overview**: Dashboard KPI metrics (Total Revenue, Order Count, Pending B2B Applications, Open Support Tickets).
- [x] **Product CRUD**: Create/edit/delete products, SKU management, multi-image upload, variants, and pricing rules.
- [x] **Category Management**: Hierarchical category and subcategory creation and modification.
- [x] **Order Fulfillment**: Order status updates (`Pending` -> `Confirmed` -> `Processing` -> `Shipped` -> `Delivered`), tracking ID assignment.
- [x] **B2B Account Moderation**: Approve, reject, or suspend wholesale applicant accounts.
- [x] **Support Case Resolution**: Review and resolve exceptional support requests.

### 🔒 Security & Authentication
- [x] **JWT Authentication**: Password hashing with bcrypt, JSON Web Token session handling, and role-based route protection (`SUPER_ADMIN`, `STAFF_ADMIN`, `RETAIL_CUSTOMER`, `B2B_CUSTOMER`).
- [x] **File Upload System**: Multer backend middleware for handling image & document uploads.

---

## ⏳ Pending & Future Roadmap Points

- [ ] **Domain-Based Subdomain Routing**: Dynamic hostname routing (`b2b.brandname.com` vs `brandname.com`) via reverse proxy / DNS middleware.
- [ ] **Third-Party Logistics (3PL) API Integration**: Real-time shipping rate calculators and automated tracking webhooks (e.g. Shiprocket / Delhivery / FedEx).
- [ ] **Automated Transactional Emails**: Automated email dispatch for order confirmations, B2B approval notifications, and tracking updates (Nodemailer / SendGrid / AWS SES).
- [ ] **Customer Review & Moderation System**: Product reviews submission with star ratings, customer photos, and admin approval queue.
- [ ] **Store Credit Wallet**: Integrated customer wallet balance for automated store credit disbursements.
- [ ] **Social Authentication**: Google & Apple OAuth 2.0 social login integration.
- [ ] **Tiered B2B Credit Terms**: B2B credit period management (Net 30 / Net 60) and customer-specific discount matrices.
- [ ] **Advanced Financial Reporting**: Exportable CSV/Excel sales reports, inventory valuation, and tax reports.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router DOM v6
- **Backend**: Node.js, Express.js, Prisma ORM, Multer
- **Database**: SQLite (Development) / PostgreSQL compatible via Prisma
- **Payments**: Razorpay Gateway Integration

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/ecom_application.git
   cd ecom_application
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy sample environment file and configure secrets
   cp .env.example .env
   
   # Run Prisma database migrations and seed data
   npx prisma db push
   node src/seed.js
   
   # Start the backend server
   npm run dev
   ```
   *Backend runs on `http://localhost:5000`*

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start Vite dev server
   npm run dev
   ```
   *Frontend runs on `http://localhost:5173`*

---

## 🔒 License & Privacy
This repository is configured for public deployment. Internal business requirements and confidential documents have been excluded from git tracking.
