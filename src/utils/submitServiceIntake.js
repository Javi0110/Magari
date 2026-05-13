import { supabase } from './supabase'
import { sendServiceRequestEmail, isEmailRelayConfigured } from './emailService'
import { getIntakeConfig } from '../constants/serviceIntakeConfigs'

function buildIntakeSummary(fields, answers) {
  if (!Array.isArray(fields)) return []
  return fields.map((f) => ({
    label: f.label,
    value: String(answers[f.name] ?? '').trim() || '—',
  }))
}

function generateReference(intakeKey) {
  const slug = (intakeKey || 'req').replace(/[^a-z0-9]+/gi, '').slice(0, 4).toUpperCase() || 'REQ'
  const tail = Date.now().toString(36).toUpperCase().slice(-6)
  return `SI-${slug}-${tail}`
}

/**
 * @param {object} opts
 * @param {string} opts.intakeKey — virtual-design | interior-design | home-staging | package
 * @param {string} [opts.packageName] — when intakeKey === 'package'
 * @param {Record<string, string>} opts.answers
 * @param {{ fullName: string, email: string, phone: string, cityZip?: string }} opts.contact
 */
export async function submitServiceIntake({ intakeKey, packageName, answers, contact }) {
  const config = getIntakeConfig(intakeKey)
  if (!config) {
    return { ok: false, error: 'Invalid intake type' }
  }
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured; we cannot save your request.' }
  }

  const reference = generateReference(intakeKey)
  const serviceLabel =
    intakeKey === 'package' && packageName
      ? `${packageName} — package inquiry`
      : `${config.serviceLabel} — inquiry`

  const intakeSummary = buildIntakeSummary(config.fields, answers)

  const payload = {
    source: 'services_page_intake',
    intakeKey,
    packageName: packageName || null,
    intakeTitle: intakeKey === 'package' && packageName ? `${packageName} — inquiry` : config.title,
    answers: { ...answers },
    intakeSummary,
  }

  const row = {
    service: serviceLabel,
    reference,
    contact: {
      fullName: contact.fullName?.trim(),
      email: contact.email?.trim(),
      phone: (contact.phone || '').trim(),
      cityZip: (contact.cityZip || '').trim() || undefined,
    },
    subtotal: 0,
    deposit: 0,
    payload,
    status: 'new',
  }

  const { error } = await supabase.from('service_requests').insert(row)
  if (error) {
    console.error('[submitServiceIntake]', error)
    return { ok: false, error: error.message || 'Could not save request' }
  }

  const serviceData = {
    service: serviceLabel,
    reference,
    contact: row.contact,
    subtotal: 0,
    deposit: 0,
    payload,
  }

  if (isEmailRelayConfigured()) {
    const emailRes = await sendServiceRequestEmail(serviceData)
    if (!emailRes.success) {
      return {
        ok: true,
        reference,
        emailWarning: emailRes.error || 'Email could not be sent',
      }
    }
  }

  return { ok: true, reference }
}
