import type { Metadata } from 'next'
import { PaydayPurgatory } from '@/components/payday/PaydayPurgatory'
import '@/styles/payday.scss'

export const metadata: Metadata = {
  title: 'Penny PowerPlays',
  description: 'An all-pay survival auction game. Bid from your bank each round — lowest contributor loses a heart.',
}

export default function PaydayPurgatoryPage() {
  return <PaydayPurgatory />
}
