'use client'

import { useEffect, useState } from 'react'

export function useMounted() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  return ready
}
