/**
 * btn-* classes now include layout in index.css — strip duplicate utilities.
 * Run: node scripts/normalize-button-classes.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, acc)
    else if (p.endsWith('.jsx') || p.endsWith('.tsx')) acc.push(p)
  }
  return acc
}

const files = walk(join(root, 'src'))

const pairs = [
  [/btn-outline text-sm py-2\.5 px-4 inline-flex items-center justify-center/g, 'btn-outline btn-sm'],
  [/btn-primary text-sm py-2\.5 px-4 inline-flex items-center justify-center/g, 'btn-primary btn-sm'],
  [/btn-outline text-sm py-2 px-4 inline-flex items-center justify-center/g, 'btn-outline btn-sm'],
  [/btn-primary text-sm py-2 px-4 inline-flex items-center justify-center/g, 'btn-primary btn-sm'],
  [/btn-outline text-sm py-2 px-3 inline-flex items-center justify-center/g, 'btn-outline btn-sm'],
  [/btn-primary text-sm py-2 px-3 inline-flex items-center justify-center/g, 'btn-primary btn-sm'],
  [/btn-outline text-sm inline-flex items-center justify-center px-4 py-2\.5/g, 'btn-outline btn-sm'],
  [/ text-center inline-flex items-center justify-center gap-2/g, ''],
  [/ inline-flex items-center justify-center gap-2/g, ''],
  [/ inline-flex items-center justify-center/g, ''],
  [/btn-outline inline-flex items-center justify-center text-center/g, 'btn-outline'],
]

let changed = 0
for (const file of files) {
  let s = readFileSync(file, 'utf8')
  const orig = s
  for (const [re, rep] of pairs) {
    s = s.replace(re, rep)
  }
  if (s !== orig) {
    writeFileSync(file, s)
    changed++
  }
}
console.log(`Updated ${changed} files`)
