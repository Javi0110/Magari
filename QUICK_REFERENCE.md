# 🎯 Quick Reference — Magari & Co. Website

## 🚀 Get Started (3 Commands)

```bash
npm install        # Install dependencies
npm run dev        # Start dev server → http://localhost:5173
npm run build      # Build for production
```

## 📱 Live Demo Features

| Feature | Status | Location |
|---------|--------|----------|
| Homepage with hero | ✅ Working | `/` |
| Product shop + filters | ✅ Working | `/shop` |
| Shopping cart | ✅ Working | Click cart icon |
| Virtual Styling booking | ✅ Working | `/services` |
| Vendor marketplace | ✅ Working | `/marketplace` |
| Vendor dashboard | ✅ Working | Login from marketplace |
| Submit testimonials | ✅ Working | `/testimonials` |
| Contact form | ✅ Working | `/contact` |
| Admin dashboard | ✅ Working | `/admin` (any login) |

## 🔌 Integration Checklist

Before going live, connect these services:

- [ ] **Stripe** — Payments (cart + services)
- [ ] **Supabase** — Database + Auth + Storage
- [ ] **SendGrid** — Transactional emails
- [ ] **Consultation booking** — `/contact#book` (Supabase slots + `create_consultation_request`)
- [ ] **Google Analytics** — Add your tracking ID
- [ ] **Meta Pixel** — Add your pixel ID

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Routing + SEO |
| `src/data/sampleData.js` | **Edit this** for your products |
| `src/components/Cart.jsx` | Shopping cart logic |
| `src/store/cartStore.js` | Cart state management |
| `tailwind.config.js` | Color palette + theme |
| `README.md` | **Full integration guide** |

## 🎨 Brand Colors

```javascript
Cream:      #FBF7F3  // Background
Turquoise:  #17BEBB  // Primary CTAs
Orange:     #FF6A00  // Secondary CTAs
Lime:       #8AE234  // Success/badges
Neutrals:   #C7B9AA, #8F7A6B
```

## 🔍 Find Integration Points

Search codebase for `🔌 INTEGRATION:` to find all places that need backend connection.

## 💡 Common Tasks

### Add a new product
Edit `src/data/sampleData.js` → `sampleProducts` array

### Change commission rate
Default: 12% → Edit in Admin → Settings (needs backend to save)

### Update contact info
Edit `src/components/Footer.jsx` and `src/pages/Contact.jsx`

### Add real images
Place images in `public/` folder and update image paths in components

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Vite will auto-select next available port
# Or kill process on 5173: lsof -ti:5173 | xargs kill
```

**Styles not updating?**
```bash
# Restart dev server
# Or clear browser cache (Cmd+Shift+R)
```

## 📚 Documentation

- **SETUP.md** — Quick start guide
- **README.md** — Comprehensive integration guide (⭐ **Start here**)
- **PROJECT_SUMMARY.md** — What's built + next steps

## 🚢 Ready to Deploy?

```bash
npm run build              # Creates dist/ folder
vercel                     # Deploy to Vercel
# or drag dist/ to Netlify
```

## ✅ Pre-Launch Checklist

- [ ] Test all pages on mobile
- [ ] Add real product images
- [ ] Update meta tags for SEO
- [ ] Test cart + checkout flow
- [ ] Test booking flow
- [ ] Set up domain + SSL
- [ ] Configure analytics
- [ ] Test all forms

---

**Need help?** See README.md for detailed guides.

**Questions?** magaribyelena@gmail.com

**Built for Magari & Co. with ❤️**

