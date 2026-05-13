/**
 * Generates public/home-prep-checklist.pdf
 * Run: npm run generate:checklist
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'public', 'home-prep-checklist.pdf')

const SAGE = rgb(0.42, 0.49, 0.44)
const MUTED = rgb(0.4, 0.4, 0.4)
const BLACK = rgb(0.18, 0.17, 0.16)

function wrapLine(text, maxW, font, size) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (font.widthOfTextAtSize(test, size) <= maxW) line = test
    else {
      if (line) lines.push(line)
      line = w
    }
  }
  if (line) lines.push(line)
  return lines
}

function wrapParagraph(text, maxW, font, size) {
  const out = []
  for (const raw of String(text).split('\n')) {
    out.push(...wrapLine(raw.trim(), maxW, font, size))
  }
  return out
}

const sections = [
  { title: 'HOME PREP CHECKLIST', subtitle: 'Sell faster and look better', size: 20 },
  {
    intro:
      'Use this 1 to 2 weeks before photos and showings. Check off what applies; skip the rest. Small edits photograph big.',
  },
  {
    h: 'Curb and entry',
    body: 'Sweep porch, walk, and driveway. Hide bins and hoses. Clean front door glass; polish hardware. Replace dead plants; one simple planter helps.',
  },
  {
    h: 'Light and air',
    body: 'Open blinds; clean windows inside (outside if you can). Replace dead bulbs; same warm-white temp everywhere. Turn on every lamp for photos, even daytime.',
  },
  {
    h: 'Declutter and depersonalize',
    body: 'Clear counters to one accent plus essentials. Pack family photos, fridge magnets, and diplomas. Thin closets about 30 percent so rods read spacious.',
  },
  {
    h: 'Quick repairs',
    body: 'Patch nail holes; touch up scuffs. Fix drips, loose handles, squeaky doors. Re-caulk tub or kitchen seams if yellowed.',
  },
  {
    h: 'Kitchen and baths (photo priority)',
    body: 'Empty sink; stash sponges under sink on shoot day. Fresh neutral towels, folded evenly. Toilet lids down; empty trash with a new liner.',
  },
  {
    h: 'Rooms and flow',
    body: 'Clear walking paths; remove one bulky piece if a room feels tight. Simple bedding; pillows stacked cleanly. Straighten rugs; tuck cables.',
  },
  {
    h: 'Odors and HVAC',
    body: 'Change HVAC filter; deep clean if pets or heavy cooking. Avoid strong perfumes. Refresh litter areas or relocate for showings.',
  },
  {
    h: 'Photo and showing day',
    body: 'Lights on; fans off unless needed for comfort. Chargers, toiletries, and pet bowls out of frame. One simple floral or bowl of citrus is enough.',
  },
  {
    h: 'When in doubt',
    body: 'Book a staging walkthrough or listing prep consult. A trained eye catches what the camera will magnify.',
  },
]

async function main() {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageW = 612
  const pageH = 792
  const margin = 54
  const maxW = pageW - margin * 2

  let page = pdfDoc.addPage([pageW, pageH])
  let y = pageH - margin

  const ensureSpace = (need) => {
    if (y < margin + need) {
      page = pdfDoc.addPage([pageW, pageH])
      y = pageH - margin
    }
  }

  const drawLines = (lines, size, useBold, color, leading) => {
    const f = useBold ? fontBold : font
    for (const ln of lines) {
      ensureSpace(size + leading)
      page.drawText(ln, { x: margin, y, size, font: f, color })
      y -= size + leading
    }
  }

  // Title
  drawLines([sections[0].title], sections[0].size, true, SAGE, 6)
  y -= 4
  drawLines(wrapParagraph(sections[0].subtitle, maxW, fontBold, 11), 11, false, MUTED, 4)
  y -= 14

  drawLines(wrapParagraph(sections[1].intro, maxW, font, 10), 10, false, BLACK, 3)
  y -= 10

  for (let i = 2; i < sections.length; i++) {
    const s = sections[i]
    drawLines([s.h], 11, true, SAGE, 5)
    y -= 2
    drawLines(wrapParagraph(s.body, maxW, font, 9), 9, false, BLACK, 3)
    y -= 8
  }

  y -= 6
  drawLines(
    wrapParagraph(
      'Magari and Co.  |  casamagari.com  |  magaribyelena@gmail.com  |  @magari.andco',
      maxW,
      font,
      9
    ),
    9,
    false,
    SAGE,
    3
  )
  drawLines(
    wrapParagraph(
      'Real estate services: Elena Fadhel, Realtor at eXp Realty.',
      maxW,
      font,
      8
    ),
    8,
    false,
    MUTED,
    3
  )

  const bytes = await pdfDoc.save()
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, bytes)
  console.log('Wrote', outPath, `(${(bytes.length / 1024).toFixed(1)} KB)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
