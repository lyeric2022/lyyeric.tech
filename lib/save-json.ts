import { writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function savePublicJson(request: Request, filename: string) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Saving is only available locally' }, { status: 403 })
  }

  const data: unknown = await request.json()
  if (!Array.isArray(data)) {
    return NextResponse.json({ error: 'Expected an array of items' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'public', filename)
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
  return NextResponse.json({ success: true })
}
