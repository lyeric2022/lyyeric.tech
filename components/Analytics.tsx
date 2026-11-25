'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

const REVEAL_ANIMATIONS = new Set([
  'fadeIn',
  'fadeInDown',
  'fadeInSimple',
  'resumeBackdropIn',
  'resumeSheetIn',
])

export function Analytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (key && !posthog.__loaded) {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        defaults: '2026-08-30',
        capture_pageview: 'history_change',
        capture_pageleave: true,
        autocapture: true,
        session_recording: {
          maskAllInputs: true,
        },
      })
      posthog.capture('app_loaded')
    }

    // CSS keyframes never write opacity onto DOM nodes, so session replay can
    // snapshot reveal elements as invisible. Lock the end state after each fade.
    const onAnimationEnd = (event: AnimationEvent) => {
      const el = event.target
      if (!(el instanceof Element)) return
      if (REVEAL_ANIMATIONS.has(event.animationName)) {
        el.classList.add('is-revealed')
      }
    }

    document.addEventListener('animationend', onAnimationEnd, true)
    return () => {
      document.removeEventListener('animationend', onAnimationEnd, true)
    }
  }, [])

  return null
}
