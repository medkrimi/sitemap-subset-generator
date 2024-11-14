import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const SITEMAP_DIR = path.join(process.cwd(), 'generated_sitemaps')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const filePath = path.join(SITEMAP_DIR, `${params.id}.xml`)

  try {
    const sitemap = await fs.readFile(filePath, 'utf-8')
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error reading sitemap file:', error)
    return new NextResponse('Sitemap not found', { status: 404 })
  }
}