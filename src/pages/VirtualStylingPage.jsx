import React from 'react'

export default function VirtualStylingPage() {
  return (
    <div className="min-h-screen bg-cream py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero / Intro */}
        <section className="mb-10 md:mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mb-3">
            Virtual Interior Design Services
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-neutral-800 mb-4">
            Virtual Interior Design Services for Cozy, Collected Spaces
          </h1>
          <p className="text-neutral-600 text-base md:text-lg leading-relaxed max-w-3xl">
            If you&apos;re not in Austin — or you just prefer to move at your own pace — our virtual interior design
            services give you a complete design plan you can execute from anywhere. You send us photos, measurements,
            and inspiration, and we send back a clickable design package with product links, layout suggestions, and
            styling notes.
          </p>
        </section>

        {/* Detailed Description */}
        <section className="mb-8">
          <h2 className="font-serif text-2xl text-neutral-800 mb-3">
            How virtual interior design with Magari &amp; Co. works
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-3">
            Virtual design is ideal if you like the idea of having a designer guide your decisions, but you&apos;re
            comfortable handling ordering and installation at your own pace. We focus on clarity and practicality so you
            always know exactly what to buy and where it goes.
          </p>
        </section>

        {/* Process */}
        <section className="mb-8">
          <h2 className="font-serif text-2xl text-neutral-800 mb-4">Our virtual interior design process</h2>
          <ol className="space-y-4 text-neutral-700">
            <li>
              <p className="font-semibold">1. Online questionnaire &amp; photos</p>
              <p className="text-neutral-600 text-sm md:text-base">
                You fill out a simple form about your room, budget, and style, then upload photos, a short video, and
                basic measurements. No fancy tools required.
              </p>
            </li>
            <li>
              <p className="font-semibold">2. Optional kickoff call</p>
              <p className="text-neutral-600 text-sm md:text-base">
                A quick Zoom call (if you&apos;d like) to clarify priorities, talk through what&apos;s working and
                what&apos;s not, and make sure we&apos;re aligned on your goals.
              </p>
            </li>
            <li>
              <p className="font-semibold">3. Concept &amp; layout</p>
              <p className="text-neutral-600 text-sm md:text-base">
                We create a moodboard that sets the tone of the space and a recommended furniture layout so you know
                what goes where and how big each piece should be.
              </p>
            </li>
            <li>
              <p className="font-semibold">4. Shoppable design board</p>
              <p className="text-neutral-600 text-sm md:text-base">
                You receive a design board with specific furniture and decor picks, each linked so you can purchase
                directly online. We mix accessible, in‑stock items with a few special finds.
              </p>
            </li>
            <li>
              <p className="font-semibold">5. Styling guide &amp; notes</p>
              <p className="text-neutral-600 text-sm md:text-base">
                Written instructions show you exactly how to bring the design to life: where to hang art, how high to
                mount curtains, how to style shelves, and how to layer textiles.
              </p>
            </li>
            <li>
              <p className="font-semibold">6. One round of revisions</p>
              <p className="text-neutral-600 text-sm md:text-base">
                You can request reasonable swaps or adjustments so the design feels just right before you start
                ordering.
              </p>
            </li>
            <li>
              <p className="font-semibold">7. Support window</p>
              <p className="text-neutral-600 text-sm md:text-base">
                A short period after delivery where you can ask quick questions while you order and install. We&apos;re
                there to help you make confident decisions.
              </p>
            </li>
          </ol>
        </section>

        {/* Pricing Guidance */}
        <section className="mb-8">
          <h2 className="font-serif text-2xl text-neutral-800 mb-3">Virtual interior design pricing</h2>
          <p className="text-neutral-600 leading-relaxed mb-3">
            Investment varies by room size and complexity, but most clients fall into these ranges:
          </p>
          <ul className="list-disc list-inside text-neutral-700 space-y-2">
            <li>
              <span className="font-semibold">Single room virtual design package:</span> from{' '}
              <span className="font-semibold">$450–$650</span> (living room, bedroom, dining, office).
            </li>
            <li>
              <span className="font-semibold">Add‑on spaces:</span> smaller areas like entries, hallways, or nooks at a
              reduced rate when combined with a main room.
            </li>
            <li>
              <span className="font-semibold">Multi‑room or whole‑home packages:</span> custom proposals based on number
              of spaces and depth of support.
            </li>
          </ul>
          <p className="text-neutral-600 text-sm mt-2">
            You&apos;ll receive a clear proposal before we begin so there are no surprises.
          </p>
        </section>

        {/* Portfolio Examples */}
        <section className="mb-8">
          <h2 className="font-serif text-2xl text-neutral-800 mb-3">
            Virtual interior design project snapshots
          </h2>
          <ul className="space-y-3 text-neutral-700 text-sm md:text-base">
            <li>
              <span className="font-semibold">Small apartment living room:</span> full virtual redesign with new
              seating, rug, storage, and art; client implemented over a few weekends while keeping rental‑friendly.
            </li>
            <li>
              <span className="font-semibold">Nursery for an out‑of‑state family:</span> neutral palette, layered
              textures, and storage solutions; all items were shoppable online and shipped directly to the client.
            </li>
            <li>
              <span className="font-semibold">Remote office refresh:</span> ergonomic furniture, styled backdrop for
              video calls, and improved lighting, all done virtually.
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl text-neutral-800 mb-3">
            Virtual interior design services — FAQ
          </h2>
          <div className="space-y-4 text-neutral-700 text-sm md:text-base">
            <div>
              <p className="font-semibold">What do I need to get started?</p>
              <p className="text-neutral-600">
                Photos of the room, a few basic measurements (even hand‑drawn), your budget range, and any inspiration
                images or Pinterest boards you already have.
              </p>
            </div>
            <div>
              <p className="font-semibold">Do you order the products for me?</p>
              <p className="text-neutral-600">
                In our virtual package, you receive shoppable links and you place orders directly. This keeps things more
                flexible for you and transparent budget‑wise.
              </p>
            </div>
            <div>
              <p className="font-semibold">What if items go out of stock?</p>
              <p className="text-neutral-600">
                We aim to choose widely available pieces, but if something sells out shortly after delivery, we can
                recommend comparable alternatives within your support window.
              </p>
            </div>
            <div>
              <p className="font-semibold">Can you design around existing furniture?</p>
              <p className="text-neutral-600">
                Absolutely. We love designing around pieces you already own, then layering in new items to complete the
                look.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
          <h2 className="font-serif text-2xl text-neutral-800 mb-3">
            Ready to start your virtual design project?
          </h2>
          <p className="text-neutral-600 mb-4">
            Tell us about your room and we&apos;ll send back a shoppable, easy‑to‑follow plan that turns it into a cozy,
            collected space.
          </p>
          <a href="/design-services/virtual-styling" className="btn-primary inline-flex items-center">
            Start Virtual Styling
          </a>
        </section>
      </div>
    </div>
  )
}

