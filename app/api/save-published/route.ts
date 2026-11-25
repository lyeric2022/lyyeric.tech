import { savePublicJson } from '@/lib/save-json'

export async function POST(request: Request) {
  return savePublicJson(request, 'tier_list_published.json')
}
