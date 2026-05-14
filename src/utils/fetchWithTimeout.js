const DEFAULT_MS = 25000

/**
 * fetch that aborts after timeoutMs. If options.signal is passed, aborting either signal cancels the request.
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_MS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const { signal: userSignal, ...rest } = options

  const onUserAbort = () => controller.abort()
  if (userSignal) {
    if (userSignal.aborted) {
      clearTimeout(timeoutId)
      const aborted = new Error('Aborted')
      aborted.name = 'AbortError'
      throw aborted
    }
    userSignal.addEventListener('abort', onUserAbort)
  }

  try {
    return await fetch(url, {
      ...rest,
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted && !userSignal?.aborted) {
      const t = new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`)
      t.cause = err
      throw t
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
    if (userSignal) userSignal.removeEventListener('abort', onUserAbort)
  }
}
