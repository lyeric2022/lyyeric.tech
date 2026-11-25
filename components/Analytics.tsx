'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export function Analytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key || posthog.__loaded) return

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: 'history_change',
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
      },
    })
    posthog.capture('app_loaded')
  }, [])

  return null
}
