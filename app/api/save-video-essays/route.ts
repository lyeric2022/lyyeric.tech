import { savePublicJson } from '@/lib/save-json'

export async function POST(request: Request) {
  return savePublicJson(request, 'video_essays_published.json')
}
