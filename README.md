# Magari & Co. — Official Website

**From a dream to your reality**

A complete React website for Magari & Co., featuring handmade decor shop, virtual styling services, and the Magari Mamas multi-vendor marketplace.

---

## 🎨 Design & Aesthetic

This site follows the aesthetic of the staging site at `magariandco-staging.b12sites.com`:
- **Airy, neutral, handmade × modern** feeling
- **Color Palette:**
  - Cream: `#FBF7F3` (main background)
  - Neutrals: `#F2ECE6`, `#C7B9AA`, `#8F7A6B`
  - Turquoise accent: `#17BEBB` (primary CTA)
  - Orange accent: `#FF6A00` (secondary CTA)
  - Lime green: `#8AE234` (success/badges)
- **Typography:** Inter (sans-serif) + Lora (serif for headings)
- **Spacing:** Generous padding, rounded corners (2xl), soft shadows

---

## 📦 Tech Stack

- **React 18** with React Router for routing
- **Tailwind CSS** for styling (custom color palette configured)
- **Framer Motion** for animations
- **Lucide React** for icons
- **Zustand** for state management (cart)
- **Vite** for build tooling

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The dev server will start at `http://localhost:5173` (or next available port).

---

## 📁 Project Structure

```
magari-cursor/
├── src/
│   ├── components/        # Shared components
│   │   ├── Header.jsx     # Main navigation
│   │   ├── Footer.jsx     # Footer with newsletter
│   │   └── Cart.jsx       # Shopping cart sidebar
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Landing page
│   │   ├── Shop.jsx       # Product catalog
│   │   ├── Services.jsx   # Virtual styling & bookings
│   │   ├── Marketplace.jsx # Magari Mamas vendor area
│   │   ├── Testimonials.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── Admin.jsx      # Admin dashboard (mock)
│   ├── store/
│   │   └── cartStore.js   # Zustand cart state
│   ├── data/
│   │   └── sampleData.js  # Mock products, vendors, testimonials
│   ├── utils/
│   │   └── cn.js          # Tailwind class utility
│   ├── App.jsx            # Main app with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles + Tailwind
├── public/                # Static assets (add images here)
├── index.html             # HTML template
├── package.json
├── tailwind.config.js     # Custom Tailwind config
└── vite.config.js
```

---

## 🔌 Integration Guide

This is a **frontend-only build** with placeholders for backend integrations. Below are the recommended services and implementation steps for production.

### 1. Authentication

**Recommended:** [Clerk](https://clerk.dev) or [Supabase Auth](https://supabase.com/auth)

**Where to integrate:**
- Vendor login: `src/pages/Marketplace.jsx` (line ~40)
- Admin login: `src/pages/Admin.jsx` (line ~25)

**Implementation:**
```bash
# For Clerk
npm install @clerk/clerk-react

# For Supabase
npm install @supabase/supabase-js
```

**Clerk Example:**
```jsx
// Wrap app in ClerkProvider (main.jsx)
import { ClerkProvider } from '@clerk/clerk-react'

<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_KEY}>
  <App />
</ClerkProvider>

// Use in components
import { useUser } from '@clerk/clerk-react'
const { user } = useUser()
```

---

### 2. Payments (Stripe)

**Recommended:** [Stripe Checkout](https://stripe.com/docs/payments/checkout) + [Stripe Connect](https://stripe.com/docs/connect) for marketplace

**Where to integrate:**
- Cart checkout: `src/components/Cart.jsx` (line ~15)
- Service booking payment: `src/pages/Services.jsx` (line ~60)
- Marketplace vendor payouts: Backend implementation needed

**Implementation:**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Setup:**
1. Create Stripe account
2. Get publishable key (`pk_live_...`)
3. Create backend endpoint: `POST /api/checkout`
4. Backend creates Checkout Session
5. Redirect user to Stripe Checkout

**Example Backend (Node.js):**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

app.post('/api/checkout', async (req, res) => {
  const { items } = req.body
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.title },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: 'https://yourdomain.com/success',
    cancel_url: 'https://yourdomain.com/cart',
  })
  
  res.json({ sessionId: session.id })
})
```

**Frontend:**
```jsx
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items })
})
const { sessionId } = await response.json()
await stripe.redirectToCheckout({ sessionId })
```

**Marketplace Payouts (Stripe Connect):**
- Set up Stripe Connect for multi-vendor payouts
- Each vendor gets onboarded via Stripe Connect
- Platform takes 12% commission (configurable in Admin settings)
- See [Stripe Connect docs](https://stripe.com/docs/connect)

---

### 3. Database & Backend

**Recommended:** [Supabase](https://supabase.com) (Postgres + Auth + Storage)

**Alternative:** Firebase, or custom backend (Node.js + Postgres)

**Tables needed:**
- `products` (id, title, description, price, category, images[], vendor_id)
- `vendors` (id, name, business_name, email, status, commission_rate)
- `orders` (id, user_id, items[], total, status, created_at)
- `testimonials` (id, name, rating, text, photo_url, approved, created_at)
- `bookings` (id, user_id, service_id, form_data, status, created_at)

**Supabase Setup:**
```bash
npm install @supabase/supabase-js
```

```javascript
// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

### 4. File Uploads

**Recommended:** Supabase Storage or AWS S3

**Where to integrate:**
- Virtual styling photo upload: `src/pages/Services.jsx` (line ~80)
- Vendor product images: `src/pages/Marketplace.jsx` (line ~200)
- Review photos: `src/pages/Testimonials.jsx` (line ~45)

**Supabase Storage Example:**
```javascript
const uploadFile = async (file) => {
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`public/${Date.now()}-${file.name}`, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)
  
  return publicUrl
}
```

---

### 5. Email (Transactional)

**Recommended:** [SendGrid](https://sendgrid.com) or [Postmark](https://postmarkapp.com)

**Where to send emails:**
- Order confirmations
- Virtual styling deliverables (PDF moodboard)
- Vendor application status
- Review approval notifications
- Contact form submissions

**SendGrid Setup:**
```bash
npm install @sendgrid/mail
```

**Backend example:**
```javascript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendOrderConfirmation = async (order) => {
  await sgMail.send({
    to: order.email,
    from: 'hello@magariandco.com',
    subject: 'Order Confirmation — Magari & Co.',
    html: `<p>Thanks for your order! Order #${order.id}</p>`
  })
}
```

---

### 6. Calendly Integration (Scheduling)

**Where to integrate:** `src/pages/Services.jsx` (line ~150)

**Options:**
1. **Calendly Embed** (easiest):
```html
<!-- Add to index.html or embed in component -->
<div class="calendly-inline-widget" data-url="https://calendly.com/yourusername" style="min-width:320px;height:630px;"></div>
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js"></script>
```

2. **React Calendly Package:**
```bash
npm install react-calendly
```

```jsx
import { InlineWidget } from 'react-calendly'

<InlineWidget url="https://calendly.com/yourusername" />
```

---

### 7. Analytics

**Where to integrate:** Already in `index.html` (lines 18-38)

**Google Analytics:**
1. Create GA4 property
2. Replace `GA_MEASUREMENT_ID` in `index.html` with your actual ID
3. Page view tracking is automatic

**Meta Pixel:**
1. Create Meta Pixel in Facebook Events Manager
2. Replace `META_PIXEL_ID` in `index.html`
3. Add event tracking for purchases:

```javascript
// After successful checkout
fbq('track', 'Purchase', {
  value: total,
  currency: 'USD'
})
```

---

### 8. Newsletter Signup

**Where to integrate:** `src/components/Footer.jsx` (line ~9)

**Recommended:** Mailchimp, ConvertKit, or SendGrid Marketing

**Example (Mailchimp):**
```javascript
const subscribeToNewsletter = async (email) => {
  await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
}

// Backend
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body
  // Add to Mailchimp via API
  await mailchimp.lists.addListMember(LIST_ID, {
    email_address: email,
    status: 'subscribed'
  })
  res.json({ success: true })
})
```

---

## 🎯 API Endpoints Needed

Create these backend endpoints for full functionality:

### Products
- `GET /api/products` — Get all products (with filters)
- `GET /api/products/:id` — Get single product
- `POST /api/products` — Create product (admin/vendor)
- `PATCH /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product

### Orders
- `POST /api/checkout` — Create Stripe checkout session
- `POST /api/webhooks/stripe` — Handle Stripe webhooks
- `GET /api/orders` — Get user's orders
- `GET /api/orders/:id` — Get single order

### Marketplace
- `POST /api/marketplace/apply` — Vendor application
- `GET /api/vendors` — Get all vendors
- `POST /api/vendors/:id/approve` — Approve vendor (admin)
- `POST /api/vendors/:id/reject` — Reject vendor (admin)
- `GET /api/vendors/:id/sales` — Get vendor sales

### Bookings
- `POST /api/bookings` — Create service booking
- `GET /api/bookings` — Get user's bookings
- `PATCH /api/bookings/:id` — Update booking status

### Testimonials
- `POST /api/testimonials` — Submit review
- `GET /api/testimonials` — Get approved reviews
- `PATCH /api/testimonials/:id` — Approve/reject review (admin)

### Contact
- `POST /api/contact` — Send contact form email

### Newsletter
- `POST /api/newsletter` — Subscribe to newsletter

---

## 🌍 Environment Variables

Create `.env` file in project root:

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Clerk (if using)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# Backend URL (for API calls)
VITE_API_URL=https://api.magariandco.com
```

**Backend `.env`:**
```env
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://...
```

---

## 🚢 Deployment

### Frontend (Recommended: Vercel or Netlify)

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Drag dist/ folder to Netlify or use Netlify CLI
```

**Build settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18+

### Backend

**Recommended:**
- **Vercel Serverless Functions** (for simple API)
- **Railway** or **Render** (for full Node.js backend)
- **Supabase Edge Functions** (for Supabase-native)

---

## 📝 Content Management

### Images

Replace placeholder images in:
- `public/gallery/` — Gallery images (6 images)
- `public/products/` — Product photos
- `public/testimonials/` — Testimonial photos
- `public/vendor/` — Vendor product images
- `/hero-reel.mp4` — Hero video (optional)
- `/og-image.jpg` — Open Graph image for social sharing

### Product Data

Replace mock data in `src/data/sampleData.js`:
- Update `sampleProducts` with real products
- Update `sampleVendors` with real vendors
- Update `sampleTestimonials` with real reviews
- Update `servicesData` with real pricing

### SEO

Update meta tags in `src/App.jsx` (pageMeta object) for each page.

---

## 🧪 Testing

Before going live:

1. **Test checkout flow** (with Stripe test mode)
2. **Test booking flow** (Virtual Styling)
3. **Test vendor application** (both approval and rejection)
4. **Test cart persistence** (add items, refresh page)
5. **Test mobile responsiveness** (all pages)
6. **Test email deliverability** (all transactional emails)
7. **Test form validations** (all forms)

---

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change the color palette.

### Typography

Change fonts in `index.html` (Google Fonts) and `tailwind.config.js`.

### Commission Rate

Default marketplace commission is 12%. Change in Admin → Settings page (currently mock — implement backend save).

---

## 📚 Resources

- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Supabase Docs](https://supabase.com/docs)
- [Clerk Docs](https://clerk.dev/docs)

---

## 🐛 Known Issues / TODO

- [ ] Connect real payment processing (Stripe)
- [ ] Implement backend API
- [ ] Add real product images
- [ ] Set up email templates
- [ ] Configure Stripe Connect for marketplace payouts
- [ ] Add unit tests for checkout and booking flows
- [ ] Implement search functionality in shop
- [ ] Add product filtering by price range
- [ ] Implement vendor dashboard features (upload, edit, delete products)
- [ ] Add order tracking for customers

---

## 📞 Support

For questions about this codebase, contact: [your-email@example.com]

For Magari & Co. inquiries: hello@magariandco.com

---

## 📄 License

© 2025 Magari & Co. All rights reserved.

---

**Built with ❤️ for Elena & Magari & Co.**

*"From a dream to your reality"*

