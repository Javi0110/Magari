import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')
const src = path.join(root, 'src/pages/Marketplace.jsx')
const outDir = path.join(root, 'src/features/marketplace/components')
const lines = fs.readFileSync(src, 'utf8').split('\n')

const blocks = [
  { file: 'VendorOrdersTab.jsx', start: 1285, end: 1330, exports: 'export function VendorOrdersTab' },
  { file: 'VendorAnalyticsTab.jsx', start: 1332, end: 1402, exports: 'export function VendorAnalyticsTab' },
  { file: 'VendorNotificationsDropdown.jsx', start: 1404, end: 1438, exports: 'export function VendorNotificationsDropdown' },
  { file: 'VendorDashboard.jsx', start: 1440, end: 1619, exports: 'export function VendorDashboard' },
  { file: 'ProductsSection.jsx', start: 1622, end: 1818, exports: 'export function ProductsSection' },
  { file: 'VendorProfileSettings.jsx', start: 1821, end: 2117, exports: 'export function VendorProfileSettings' },
  { file: 'VendorProductForm.jsx', start: 2120, end: 2797, exports: 'export function VendorProductForm' },
]

const sharedImports = `import { useState, useEffect } from 'react'
import { Package, Bell, Search, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../utils/supabase'
import { useProductsStore } from '../../../store/productsStore'
import { useVendorProductsStore } from '../../../store/vendorProductsStore'
import { useNotificationsStore } from '../../../store/notificationsStore'
import { isLikelySupabaseProductId, rowToVendorProduct, vendorProductToDbRow } from '../../../utils/marketplaceProductDb'
import { compressImageForUpload } from '../../../utils/imageCompress'
import {
  vendorDeleteProduct,
  vendorGetProfile,
  vendorListOrderItems,
  vendorListPayouts,
  vendorSetPassword,
  vendorUpdateProfile,
  vendorUpsertProduct,
} from '../../../lib/marketplace/vendorApi'
import { getVendorSecret } from '../../../lib/marketplace/vendorSession'
import { VendorNotificationsDropdown } from './VendorNotificationsDropdown'
import { VendorOrdersTab } from './VendorOrdersTab'
import { VendorAnalyticsTab } from './VendorAnalyticsTab'
import { ProductsSection } from './ProductsSection'
import { VendorProfileSettings } from './VendorProfileSettings'
import { VendorProductForm } from './VendorProductForm'
`

fs.mkdirSync(outDir, { recursive: true })

for (const block of blocks) {
  const chunk = lines.slice(block.start - 1, block.end)
  const body = chunk
    .join('\n')
    .replace(/^function /m, block.exports.replace('export function ', 'export function '))
    .replace(/^function (\w+)/, 'export function $1')

  let imports = sharedImports
  if (block.file === 'VendorOrdersTab.jsx') {
    imports = `import { useState, useEffect } from 'react'\nimport { Package } from 'lucide-react'\nimport { vendorListOrderItems } from '../../../lib/marketplace/vendorApi'\n\n`
  } else if (block.file === 'VendorAnalyticsTab.jsx') {
    imports = `import { useState, useEffect } from 'react'\nimport { vendorListOrderItems, vendorListPayouts } from '../../../lib/marketplace/vendorApi'\n\n`
  } else if (block.file === 'VendorNotificationsDropdown.jsx') {
    imports = ''
  } else if (block.file === 'VendorDashboard.jsx') {
    imports = `import { useState, useEffect } from 'react'\nimport { Bell } from 'lucide-react'\nimport { supabase } from '../../../utils/supabase'\nimport { useNotificationsStore } from '../../../store/notificationsStore'\nimport { isLikelySupabaseProductId, rowToVendorProduct } from '../../../utils/marketplaceProductDb'\nimport { useVendorProductsStore } from '../../../store/vendorProductsStore'\nimport { VendorNotificationsDropdown } from './VendorNotificationsDropdown'\nimport { VendorOrdersTab } from './VendorOrdersTab'\nimport { VendorAnalyticsTab } from './VendorAnalyticsTab'\nimport { ProductsSection } from './ProductsSection'\nimport { VendorProfileSettings } from './VendorProfileSettings'\nimport { VendorProductForm } from './VendorProductForm'\n\n`
  } else if (block.file === 'ProductsSection.jsx') {
    imports = `import { useState } from 'react'\nimport { Search, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'\nimport { useProductsStore } from '../../../store/productsStore'\nimport { useVendorProductsStore } from '../../../store/vendorProductsStore'\nimport { isLikelySupabaseProductId } from '../../../utils/marketplaceProductDb'\nimport { vendorDeleteProduct } from '../../../lib/marketplace/vendorApi'\n\n`
  } else if (block.file === 'VendorProfileSettings.jsx') {
    imports = `import { useState, useEffect } from 'react'\nimport { vendorGetProfile, vendorSetPassword, vendorUpdateProfile } from '../../../lib/marketplace/vendorApi'\nimport { getVendorSecret } from '../../../lib/marketplace/vendorSession'\n\n`
  } else if (block.file === 'VendorProductForm.jsx') {
    imports = `import { useState } from 'react'\nimport { X, Upload, Image as ImageIcon } from 'lucide-react'\nimport InlineSelect from '../../../components/InlineSelect'\nimport { useProductsStore } from '../../../store/productsStore'\nimport { useVendorProductsStore } from '../../../store/vendorProductsStore'\nimport { isLikelySupabaseProductId, rowToVendorProduct, vendorProductToDbRow } from '../../../utils/marketplaceProductDb'\nimport { compressImageForUpload } from '../../../utils/imageCompress'\nimport { vendorUpsertProduct } from '../../../lib/marketplace/vendorApi'\n\n`
  }

  const fnBody = chunk.join('\n').replace(/^function /, 'export function ')
  fs.writeFileSync(path.join(outDir, block.file), imports + fnBody + '\n')
}

const mainLines = lines.slice(0, 1283)
const importBlock = `import { VendorDashboard } from '../features/marketplace/components/VendorDashboard'\n`
const insertAt = mainLines.findIndex((l) => l.includes("from '../lib/marketplace/vendorSession'")) + 1
mainLines.splice(insertAt, 0, importBlock)

const newMain = mainLines.join('\n').replace(/\nfunction VendorOrdersTab[\s\S]*$/s, '\n')
fs.writeFileSync(path.join(root, 'src/features/marketplace/MarketplacePage.jsx'), newMain)
fs.writeFileSync(path.join(root, 'src/pages/Marketplace.jsx'), "export { default } from '../features/marketplace/MarketplacePage'\n")

console.log('Split marketplace into', outDir)
