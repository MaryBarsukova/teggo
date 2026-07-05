import posthog from 'posthog-js'

export function initAnalytics() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
  })
}

export function track(event: string, props?: Record<string, unknown>) {
  posthog.capture(event, props)
}

export function identifyUser(userId: string) {
  posthog.identify(userId)
}
