import { motion } from 'framer-motion'
import { Heart, Target, Users, Sparkles, Baby } from 'lucide-react'
import { Link } from 'react-router-dom'

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
            About Magari & Co.
          </h1>
          <p className="text-xl text-neutral-500 leading-relaxed">
            From a dream to your reality — creating beautiful, accessible spaces and supporting mom-made businesses.
          </p>
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
              <p className="text-neutral-500">Founder & Creative Director</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-neutral-600 space-y-4">
            <p>
              I&apos;ve always seen the world in layers: color on top of texture, light on top of shadow,
              stories woven into everyday objects. Long before Magari &amp; Co. existed, I was an artist—
              sketching, painting, and shaping clay into little altars for daily life.
            </p>

            <p>
              My background as an artist lives at the center of everything I do. I&apos;m obsessed with the way a
              hand-thrown mug sits in your palm, the way a textile softens a room, the way a simple object can
              make a space feel like a quiet exhale. Design, for me, has never been about perfection—it&apos;s about
              emotion, memory, and the stories we hold in our homes.
            </p>

            <p>
              Then came motherhood—and with it, a different kind of creativity. Overnight, my days were divided
              between feedings and nap schedules, but the ideas didn&apos;t slow down. If anything, they got louder.
              In the middle of the mess and magic of being a mom, I realized I didn&apos;t want to choose between
              being present with my child and building something of my own.
            </p>

            <p>
              Magari &amp; Co. was born from that tension: the desire to create a life where art, motherhood, and
              entrepreneurship could live together under one roof. What started as small ceramic pieces on my
              kitchen table has grown into a design studio and curated marketplace that serves clients and
              customers in Puerto Rico and beyond.
            </p>

            <p className="font-serif text-xl md:text-2xl text-neutral-700 italic">
              “Magari” means “if only” in Italian—whispered wishes, quiet daydreams, the version of your home
              you imagine when you close your eyes. My work is about turning those “if onlys” into something
              you can actually walk through, touch, and live inside.
            </p>

            <p>
              As Magari grew, I kept meeting other moms who were also creating—from their dining tables, garages,
              and borrowed studio corners—trying to build sustainable businesses between school pick-ups and bedtime
              routines. Their work was beautiful. Their stories were powerful. And yet, it was hard to find them all
              in one place.
            </p>

            <p>
              That&apos;s where <strong>MOMade Market</strong> comes in. It&apos;s the marketplace I wished existed when I
              was first starting: a curated home for mom-owned brands where the story of the maker matters as much
              as the product. Every piece in the market is selected through the lens of design and storytelling,
              so when you shop, you&apos;re not just buying “things”—you&apos;re investing in a mom&apos;s dream, a family,
              a future.
            </p>

            <p>
              Long term, my dream is <strong>Casa Magari</strong>: a physical space that holds all of this under one roof.
              A studio, a shop, and a gathering place where you can feel the work of mom makers with your own hands;
              where design clients, makers, and families can come together for workshops, pop-ups, and slow, beautiful
              moments. Until then, this online home is the first chapter—the place where we start turning “if only”
              into “this is our life now.”
            </p>
          </div>
        </motion.div>

        {/* Values Section – art, motherhood, community */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: <Heart className="w-8 h-8" />,
              title: 'Handmade First',
              description: 'We celebrate artisans and makers, prioritizing quality handcrafted pieces over mass production.'
            },
            {
              icon: <Baby className="w-8 h-8" />,
              title: 'Motherhood & Entrepreneurship',
              description: 'We believe motherhood can be a birthplace for ideas, not the end of your creative dreams.'
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Community Driven',
              description: 'Supporting mom-made businesses and building a community that lifts each other up.'
            },
            {
              icon: <Target className="w-8 h-8" />,
              title: 'Art-Led, Story-First',
              description: 'Every service, product, and partnership is guided by an artistic eye and a human story.'
            }
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
            From kitchen table to Casa Magari (one day)
          </h2>

          <div className="space-y-6">
            {[
              { year: 'Before Magari', event: 'Years of making art—on paper, in clay, in sketchbooks—while dreaming of a home for all of it.' },
              { year: 'Early Magari', event: 'Started creating ceramic pieces at the kitchen table and styling corners of our own home.' },
              { year: 'Design Studio', event: 'Magari & Co. grows into a design studio, blending artful styling with accessible interiors.' },
              { year: 'MOMade Market', event: 'The idea for a curated marketplace of mom-made products becomes real—MOMade Market is born.' },
              { year: 'Casa Magari (someday)', event: 'A physical space where the studio, the market, and the community can gather under one roof.' }
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
            2nd Saturday Market Days — Georgetown Square
          </h2>
          <p className="text-neutral-600 mb-4">
            We pop up on the second Saturday of every month <span className="font-semibold">(except December)</span> at the historic Georgetown Square.
          </p>
          <p className="text-neutral-500 text-sm">
            Tip: Follow us on Instagram for any weather updates or special holiday schedules.
          </p>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="font-serif text-4xl text-neutral-700 mb-6">
            Ready to work together?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/design-services" className="btn-primary">
              Book Design Services
            </Link>
            <Link to="/shop" className="btn-outline">
              Shop Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

