import { motion } from 'framer-motion'
import { Heart, Target, Users } from 'lucide-react'
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

        {/* Story Section */}
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
              Magari & Co. was born from a simple dream: to make beautiful, thoughtful design accessible to everyone, 
              while celebrating the incredible creativity of mom makers in our community.
            </p>

            <p>
              As a designer and entrepreneur based in Puerto Rico, I've always been drawn to the handmade, 
              the authentic, and the stories behind every piece. What started as creating ceramic trays in my 
              kitchen has grown into a full design business that serves clients across the US and PR.
            </p>

            <p>
              But Magari is more than just pretty things. It's about the feeling you get when you walk into a 
              space that truly feels like <em>yours</em>. It's about supporting other moms who are building 
              businesses from their homes, just like I did. It's about proving that you don't need a big budget 
              to have a beautiful home — you just need thoughtful guidance and the right pieces.
            </p>

            <p className="font-serif text-2xl text-neutral-700 italic">
              "Magari" means "if only" in Italian — and we're here to turn those "if onlys" into reality.
            </p>
          </div>
        </motion.div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: <Heart className="w-8 h-8" />,
              title: 'Handmade First',
              description: 'We celebrate artisans and makers, prioritizing quality handcrafted pieces over mass production.'
            },
            {
              icon: <Target className="w-8 h-8" />,
              title: 'Accessible Design',
              description: 'Beautiful spaces shouldn\'t be reserved for the wealthy. Good design should be within reach.'
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Community Driven',
              description: 'Supporting mom-made businesses and building a community that lifts each other up.'
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

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-8 mb-12"
        >
          <h2 className="font-serif text-3xl text-neutral-700 mb-8 text-center">
            Our Journey
          </h2>

          <div className="space-y-6">
            {[
              { year: '2021', event: 'Started creating ceramic pieces in my kitchen' },
              { year: '2022', event: 'Launched the Elementos Collection at local markets' },
              { year: '2023', event: 'Introduced Virtual Styling services to help clients remotely' },
              { year: '2024', event: 'Created MOMade Marketplace to support mom makers' },
              { year: '2025', event: 'Expanding to serve clients across the US and Puerto Rico' }
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

        {/* Markets Info */}
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

