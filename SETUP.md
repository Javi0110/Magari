# 🚀 Quick Setup Guide — Magari & Co.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Step 3: Explore the Site

The site is fully functional as a frontend demo with:
- ✅ **Home page** with hero, features, gallery, testimonials
- ✅ **Shop** with filterable products and cart
- ✅ **Services** with booking flow (Virtual Styling)
- ✅ **Magari Mamas Marketplace** with vendor application and dashboard
- ✅ **Testimonials**, About, Contact pages
- ✅ **Admin dashboard** (mock — login with any credentials)

## What Works Now (Demo Mode)

- Navigation between all pages
- Add products to cart (persists in localStorage)
- Complete booking forms (data logged to console)
- Apply to vendor marketplace (data logged to console)
- Submit reviews and contact forms (data logged to console)
- Mobile-responsive design

## What Needs Backend Integration

All forms and actions currently log to console. To make them functional:

### 🔌 Priority Integrations:

1. **Payments** — Add Stripe Checkout
   - File: `src/components/Cart.jsx` (line 15)
   - File: `src/pages/Services.jsx` (line 60)

2. **Database** — Connect Supabase or similar
   - Store products, orders, vendors, reviews
   - See README.md → Integration Guide → Database

3. **Authentication** — Add Clerk or Supabase Auth
   - File: `src/pages/Marketplace.jsx` (line 40)
   - File: `src/pages/Admin.jsx` (line 25)

4. **Email** — Set up SendGrid for transactional emails
   - Order confirmations
   - Virtual styling deliverables
   - Contact form notifications

5. **File Uploads** — Configure Supabase Storage or S3
   - Product images
   - Virtual styling photos
   - Vendor application images

See **README.md** for detailed integration instructions.

## Adding Real Content

### Replace Sample Data

Edit `src/data/sampleData.js`:
- Update product titles, prices, descriptions
- Add real vendor information
- Update testimonials

### Add Images

Add your images to `public/` folder:
```
public/
  gallery/
    1.jpg
    2.jpg
    ...
  products/
    tray-1.jpg
    mug-1.jpg
    ...
  hero-reel.mp4 (optional video)
  og-image.jpg (for social sharing)
```

Then update image paths in components.

## Deployment

When ready to deploy:

```bash
# Build for production
npm run build

# Deploy to Vercel (easiest)
npm install -g vercel
vercel

# Or deploy dist/ folder to Netlify
```

## Next Steps

1. ✅ Review the site locally
2. 🔌 Set up backend (see README.md)
3. 🎨 Replace placeholder images
4. 📝 Update content in `src/data/sampleData.js`
5. 🔐 Add authentication (Clerk/Supabase)
6. 💳 Connect Stripe payments
7. 📧 Set up transactional emails
8. 🚀 Deploy!

## Questions?

See the full **README.md** for comprehensive integration guides.

---

**Happy building! 🎨✨**

