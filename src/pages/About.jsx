import { motion } from 'framer-motion'
import { Heart, Target, Users, Baby, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'
import BookConsultButton from '../components/BookConsultButton'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-5xl md:text-6xl text-neutral-600 mb-6">
            About Magari &amp; Co.
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-4">
            Hi, I&apos;m Elena — founder of Magari &amp; Co. I&apos;ve always believed that a home should feel like peace,
            beauty, and purpose. What started as a creative dream became a design studio built around helping families
            transform their spaces with intention.
          </p>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-4">
            Now, as a{' '}
            <strong className="font-medium text-neutral-700">
              Realtor<sup>®</sup> @ eXp Realty
            </strong>
            , I&apos;m able to
            guide clients not only in design — but in the entire home journey: buying, selling, and creating a space you
            truly love. Magari &amp; Co. is not a brokerage; licensed brokerage is only through eXp Realty in my name as
            Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty.
          </p>
          <p className="font-serif text-2xl md:text-3xl text-neutral-700 italic mb-2">
            From a dream to your reality
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap mt-10">
            <BookConsultButton variant="modal" className="btn-primary">
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </BookConsultButton>
            <Link to="/services" className="btn-outline">
              Services &amp; pricing
            </Link>
            <a href="/#lead-magnet" className="btn-outline">
              Download Checklist
            </a>
            <InstagramDmCta className="btn-outline" />
          </div>
        </motion.div>

        {/* Founder story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-greige-light">
              <img 
                src="/elena-photo.jpeg" 
                alt="Elena" 
                className="w-full h-full object-cover scale-150 md:scale-[1.8] origin-center object-[60%_40%]"
                onError={(e) => {
                  e.target.parentElement.style.display = 'none'
                }}
              />
            </div>
            <div>
              <h2 className="font-serif text-3xl text-neutral-700">
                Meet Elena
              </h2>
              <p className="text-neutral-500">Founder · Interior design background · Realtor® @ eXp Realty</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-neutral-600 space-y-4">
            <p>
              I started as an artist — sketching, painting, clay on the table — long before Magari &amp; Co. had a
              name. Interiors became the through-line: color, texture, light, and the small objects that make a room feel
              lived-in on purpose.
            </p>

            <p>
              Motherhood turned the volume up on everything: less time, louder ideas, zero interest in choosing between
              family and building something of my own. Magari is the answer — art, business, and home under one roof,
              with packages written in plain English.
            </p>

            <p>
              On the real estate side I hang my license with eXp Realty as Elena Fadhel, Realtor<sup>®</sup> @ eXp
              Realty — separate from the Magari studio, always labeled. Today the studio does interiors and staging; Shop
              Magari and MOMade layer in when clients are ready for goods, not before the plan is clear.
            </p>

            <p className="font-serif text-xl md:text-2xl text-neutral-700 italic">
              “Magari” is Italian for “if only” — the version of your home you picture when you close your eyes. My
              job is to drag that daydream into real square footage you can live in.
            </p>

            <p>
              <strong>Casa Magari</strong> is the someday file: a real building where studio, shop, and makers share
              walls. Until then, this site is chapter one — honest process posts, shoppable rooms, and consults that
              start on time.
            </p>
          </div>
        </motion.div>

        {/* Values Section – art, motherhood, community */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: <Heart className="w-8 h-8" />,
              title: 'Handmade first',
              description: 'Small batches, real hands, pieces that age well — not landfill filler.',
            },
            {
              icon: <Baby className="w-8 h-8" />,
              title: 'Parents who build',
              description: 'Kids and deadlines coexist here. We plan work like adults and laugh like humans.',
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Lift while we climb',
              description: 'MOMade spotlights other mom makers — shelf space and storytelling, not gatekeeping.',
            },
            {
              icon: <Target className="w-8 h-8" />,
              title: 'Art-led decisions',
              description: 'Color, proportion, narrative — every install and product edit starts there.',
            },
          ].map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center text-sage mx-auto mb-4">
                {value.icon}
              </div>
              <h3 className="font-serif text-2xl text-neutral-700 mb-3">
                {value.title}
              </h3>
              <p className="text-neutral-600">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Journey / Vision – Magari, MOMade, Casa Magari */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-8 mb-12"
        >
          <h2 className="font-serif text-3xl text-neutral-700 mb-8 text-center">
            Timeline — kitchen table to Casa Magari
          </h2>

          <div className="space-y-6">
            {[
              { year: 'Before Magari', event: 'Art school habits: sketchbooks, clay tests, late-night “what if” floor plans.' },
              { year: 'Early Magari', event: 'First mugs sold off the kitchen table; friends asked for room help — staging showed up naturally.' },
              { year: 'Studio', event: 'Formal packages: consults, listing prep, installs — still one visual voice.' },
              { year: 'MOMade', event: 'Marketplace launch so mom makers share a cart, not just a hashtag.' },
              { year: 'Casa (someday)', event: 'Brick space: stay, shop, workshop — still fundraising and floor-planning.' },
            ].map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-serif text-2xl text-sage font-bold">
                    {milestone.year}
                  </span>
                </div>
                <div className="flex-1 pb-6 border-l-2 border-neutral-200 pl-6">
                  <p className="text-neutral-700">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Markets / in-person connection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-8 text-center bg-gradient-to-br from-sage/10 to-taupe/10"
        >
          <h2 className="font-serif text-3xl text-neutral-700 mb-2">
            Georgetown Square — 2nd Saturday
          </h2>
          <p className="text-neutral-600 mb-3 text-sm md:text-base">
            We set up most second Saturdays <span className="font-semibold">(not December)</span>. Cash + card; inventory
            rotates.
          </p>
          <p className="text-neutral-500 text-sm">
            Weather or holiday hour changes post first on Instagram — save the handle before you drive in.
          </p>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="font-serif text-4xl text-neutral-700 mb-6">
            From a dream to your reality
          </h2>
          <p className="text-neutral-600 max-w-lg mx-auto mb-8">
            When you are ready, send photos and your timeline — consult first, shopping later if it fits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <BookConsultButton variant="modal" className="btn-primary">
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </BookConsultButton>
            <Link to="/services" className="btn-outline">
              View services
            </Link>
            <InstagramDmCta className="btn-outline" />
          </div>
        </div>

        <PageBottomCta
          headline="Still reading?"
          body="No pressure — when you have dates or photos, drop them in the contact form or DM. We answer in plain English."
        />
      </div>
    </div>
  )
}

