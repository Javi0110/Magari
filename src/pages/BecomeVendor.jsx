import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Store, TrendingUp, Users, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react'

export default function BecomeVendorPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-cream-dark/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="text-sm text-neutral-500">
            <Link to="/" className="hover:text-sage transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/momade" className="hover:text-sage transition-colors">
              MOMade Market
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700">Become a Vendor</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16">
        {/* Hero / Mission */}
        <section className="grid md:grid-cols-[1.4fr,1fr] gap-10 md:gap-14 items-center">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-neutral-800 mb-4">
              Grow your mom-made business with MOMade Market.
            </h1>
            <p className="text-lg text-neutral-600 mb-4">
              MOMade Market is a curated marketplace by Magari &amp; Co. featuring products
              made by moms, for homes that feel warm, lived-in, and loved.
            </p>
            <p className="text-neutral-600 mb-6">
              We handle the storefront, marketing, and customer experience so you can stay
              focused on designing, making, and shipping beautiful pieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/momade/become-a-vendor"
                className="btn-primary inline-flex items-center justify-center"
              >
                Apply now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/momade"
                className="btn-outline inline-flex items-center justify-center"
              >
                Explore the marketplace
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-sage/10 to-taupe/10 p-6 md:p-7"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sage mb-3">
              Mission of MOMade Market
            </p>
            <p className="text-neutral-700 mb-4">
              We exist to spotlight mom-owned brands and creative businesses, giving them a
              beautifully designed home on the internet and connecting their work to
              design-minded shoppers.
            </p>
            <p className="text-neutral-700">
              When you join MOMade, you&apos;re not just listing products—you&apos;re joining a
              community that believes in slow-made pieces, fair pay, and building
              business on your own terms.
            </p>
          </motion.div>
        </section>

        {/* Why sell here / Benefits */}
        <section className="space-y-8">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="font-serif text-3xl text-neutral-800 mb-3">
                Why sell on MOMade Market
              </h2>
              <p className="text-neutral-600 mb-4">
                Instead of building a shop from scratch, you plug into an existing brand
                that already speaks to your ideal customer—design-forward, values-driven,
                and willing to invest in handmade work.
              </p>
              <ul className="space-y-3 text-neutral-700 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-sage" />
                  <span>Curated environment that positions your products next to aligned brands.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-sage" />
                  <span>Story-driven merchandising that highlights the maker behind each piece.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-sage" />
                  <span>Marketing support through Magari &amp; Co. channels and design clients.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-2xl text-neutral-800 mb-3">
                Benefits for vendors
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="w-5 h-5 text-sage" />
                    <p className="font-medium text-neutral-800 text-sm">
                      Done-for-you storefront
                    </p>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Professionally designed product pages, photography guidelines, and a
                    branded environment that elevates your work.
                  </p>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-sage" />
                    <p className="font-medium text-neutral-800 text-sm">
                      Built-in audience
                    </p>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Access shoppers from Magari &amp; Co.&apos;s design studio, email list, and
                    social media—already primed to shop curated home goods.
                  </p>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-sage" />
                    <p className="font-medium text-neutral-800 text-sm">
                      Community of mom makers
                    </p>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Join a network of women balancing motherhood and business, sharing
                    insights and support as you grow.
                  </p>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-sage" />
                    <p className="font-medium text-neutral-800 text-sm">
                      Vendor-friendly structure
                    </p>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Clear commission model, transparent communication, and a small team you
                    can actually talk to.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commission structure / Who can apply */}
        <section className="grid md:grid-cols-[1.1fr,1fr] gap-10 md:gap-14 items-start">
          <div className="card p-6 md:p-8">
            <h3 className="font-serif text-2xl text-neutral-800 mb-3">
              Commission structure (simple &amp; transparent)
            </h3>
            <p className="text-neutral-600 text-sm mb-4">
              We only earn when you earn. There are no listing fees or monthly
              subscriptions—just a straightforward commission per sale.
            </p>
            <ul className="space-y-2 text-sm text-neutral-700 mb-4">
              <li className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 mt-0.5 text-sage" />
                <span>You keep <strong>88% of every sale</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 mt-0.5 text-sage" />
                <span>
                  MOMade Market retains a <strong>12% platform fee</strong> to cover payment
                  processing, marketing, and platform operations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 mt-0.5 text-sage" />
                <span>Payouts are batched and sent every 2 weeks.</span>
              </li>
            </ul>
            <div className="border border-cream-dark rounded-2xl p-4 text-sm bg-cream">
              <p className="font-medium text-neutral-800 mb-1">Example:</p>
              <p className="text-neutral-700">
                Your product sells for <strong>$50</strong>.<br />
                • MOMade commission (12%): <strong>$6.00</strong><br />
                • Your payout (88%): <strong>$44.00</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-2xl text-neutral-800 mb-2">
                Who can apply
              </h3>
              <p className="text-sm text-neutral-600 mb-3">
                MOMade Market is intentionally small and curated. We&apos;re a great fit if:
              </p>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-sage" />
                  <span>You are a mom or primary caregiver running a product-based business.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-sage" />
                  <span>Your products are handmade, small-batch, or thoughtfully sourced.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-sage" />
                  <span>
                    Your aesthetic aligns with warm, textural, design-forward homes (think:
                    ceramics, textiles, decor, art, paper goods, and gifting).
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Application process */}
        <section className="space-y-6">
          <h2 className="font-serif text-3xl text-neutral-800">
            Application process
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: 'Step 1',
                title: 'Tell us about your business',
                text: 'Share what you make, how you got started, and where you are based. Include links to your Instagram or website if you have them.'
              },
              {
                label: 'Step 2',
                title: 'Submit product photos',
                text: 'Upload 3–6 product images that show your pieces clearly. They don’t have to be perfect—natural light and simple styling are enough.'
              },
              {
                label: 'Step 3',
                title: 'Review & onboarding',
                text: 'We review applications within 3–5 business days. If approved, you’ll receive your vendor login and a short onboarding guide.'
              }
            ].map((step) => (
              <div key={step.title} className="card p-6">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-sage mb-2">
                  {step.label}
                </p>
                <h3 className="font-serif text-xl text-neutral-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vendor success stories */}
        <section className="space-y-6">
          <h2 className="font-serif text-3xl text-neutral-800">
            Vendor success stories
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-neutral-700">
            <div className="card p-6">
              <p className="italic mb-3">
                “Listing on MOMade has helped me reach design clients I never would have
                found on my own. My ceramics now live in homes I&apos;ve only seen in
                magazines.”
              </p>
              <p className="text-xs text-neutral-500">
                — Ceramic artist &amp; mom of two
              </p>
            </div>
            <div className="card p-6">
              <p className="italic mb-3">
                “As a busy mom, I don&apos;t have the capacity to manage my own website.
                MOMade lets me plug into a curated shop and focus on creating.”
              </p>
              <p className="text-xs text-neutral-500">
                — Textile artist
              </p>
            </div>
            <div className="card p-6">
              <p className="italic mb-3">
                “The team really cares about storytelling. They helped me refine my
                product descriptions and photos so my work feels as special online as it
                does in person.”
              </p>
              <p className="text-xs text-neutral-500">
                — Stationery designer
              </p>
            </div>
          </div>
        </section>

        {/* Apply now CTA */}
        <section className="card p-8 md:p-10 text-center">
          <h2 className="font-serif text-3xl text-neutral-800 mb-3">
            Ready to apply?
          </h2>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            The application takes about 5–10 minutes. There&apos;s no obligation—this simply
            helps us understand your business, your products, and whether MOMade Market is
            the right fit for your next chapter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/momade/become-a-vendor"
              className="btn-primary inline-flex items-center justify-center"
            >
              Apply now to MOMade Market
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="btn-outline inline-flex items-center justify-center"
            >
              Ask a question first
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

