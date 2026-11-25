import type { Metadata } from 'next'
import TierList from '@/components/TierList'

export const metadata: Metadata = {
  title: 'Rankings',
}

export default function RankingsPage() {
  return <TierList />
}
