// x402 Payment Protocol Utilities

const X402_ENDPOINT = import.meta.env.VITE_X402_ENDPOINT || '/mcp'

/**
 * Make a payment request using x402 protocol
 * @param {string} service - Service name
 * @param {number} amount - Amount in credits
 * @param {object} params - Service-specific parameters
 * @returns {Promise<any>}
 */
export async function makePayment(service, amount, params = {}) {
  const response = await fetch(X402_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service,
      amount,
      ...params,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Payment failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Check if user has sufficient credits
 * @param {number} required - Required credits
 * @param {number} available - Available credits
 * @returns {boolean}
 */
export function hasSufficientCredits(required, available) {
  return available >= required
}

/**
 * Format credits for display
 * @param {number} credits - Credit amount
 * @returns {string}
 */
export function formatCredits(credits) {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}k`
  }
  return credits.toString()
}

// Service pricing configuration
export const SERVICE_PRICING = {
  ai_generate: { credits: 10, name: 'AI Image Generation' },
  ai_edit: { credits: 5, name: 'AI Image Edit' },
  video_process: { credits: 50, name: 'Video Processing' },
  high_res_export: { credits: 20, name: 'High-Res Export' },
  api_access: { credits: 1, name: 'API Call' },
}
