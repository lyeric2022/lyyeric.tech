import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

// Initialize PostHog only in the browser and when a key is present
if (typeof window !== 'undefined' && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: true,
    },
    loaded: (ph) => {
      // Enable verbose logging locally to verify events
      if (import.meta.env.DEV) {
        ph.debug();
      }
    },
  });
}

// CSS keyframes never write opacity onto nodes, so session replay would otherwise
// snapshot reveal elements as invisible. Lock the end state after each fade.
if (typeof document !== 'undefined' && !window.__lyyericRevealLock) {
  window.__lyyericRevealLock = true;
  const revealAnimations = new Set([
    'fadeIn',
    'fadeInDown',
    'fadeInSimple',
    'resumeBackdropIn',
    'resumeSheetIn',
  ]);
  document.addEventListener(
    'animationend',
    (event) => {
      const el = event.target;
      if (!(el instanceof Element)) return;
      if (revealAnimations.has(event.animationName)) {
        el.classList.add('is-revealed');
      }
    },
    true
  );
}

export default posthog;
