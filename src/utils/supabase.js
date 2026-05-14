import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const SUPABASE_FETCH_TIMEOUT_MS = 25000

function createTimeoutFetch(timeoutMs) {
  return (url, options = {}) => {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    const { signal: userSignal, ...rest } = options

    const onUserAbort = () => controller.abort()
    if (userSignal) {
      if (userSignal.aborted) {
        clearTimeout(t)
        return Promise.reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
      }
      userSignal.addEventListener('abort', onUserAbort)
    }

    return fetch(url, { ...rest, signal: controller.signal })
      .catch((err) => {
        if (controller.signal.aborted && !userSignal?.aborted) {
          const e = new Error(`Supabase request timed out after ${Math.round(timeoutMs / 1000)}s`)
          e.cause = err
          throw e
        }
        throw err
      })
      .finally(() => {
        clearTimeout(t)
        if (userSignal) userSignal.removeEventListener('abort', onUserAbort)
      })
  }
}

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          fetch: createTimeoutFetch(SUPABASE_FETCH_TIMEOUT_MS),
        },
      })
    : null

