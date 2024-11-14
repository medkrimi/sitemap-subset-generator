'use server'

import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import fs from 'fs/promises'
import path from 'path'

const SITEMAP_DIR = '/tmp/generated_sitemaps';

export async function processSitemap(formData: FormData) {
  const sitemapUrl = formData.get('sitemapUrl') as string
  const sitemapContent = formData.get('sitemapContent') as string
  const subsetSize = parseInt(formData.get('subsetSize') as string, 10)

  let xmlData: string

  try {
    if (sitemapUrl) {
      const response = await fetch(sitemapUrl)
      xmlData = await response.text()
    } else if (sitemapContent) {
      xmlData = sitemapContent
    } else {
      throw new Error('No sitemap URL or content provided')
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    })
    const result = parser.parse(xmlData)

    if (!result.urlset || !Array.isArray(result.urlset.url)) {
      throw new Error('Invalid sitemap format')
    }

    const urls = result.urlset.url.map((url: unknown) => {
      if (typeof url === 'string') {
        return url
      } else if (typeof url === 'object' && url !== null && 'loc' in url) {
        return (url as { loc: string }).loc
      } else {
        throw new Error('Invalid URL format')
      }
    })

    // Group URLs by their structure
    const groupedUrls: { [key: string]: string[] } = {}
    urls.forEach((url: string) => {
      const structure = url.split('/').slice(0, -1).join('/')
      if (!groupedUrls[structure]) {
        groupedUrls[structure] = []
      }
      groupedUrls[structure].push(url)
    })

    // Get subset for each group
    const subsetUrls: string[] = []
    Object.values(groupedUrls).forEach(group => {
      const subset = group.slice(0, subsetSize)
      subsetUrls.push(...subset)
    })

    // Generate new sitemap XML
    const builder = new XMLBuilder({
      arrayNodeName: "url",
      format: true,
      ignoreAttributes: false,
      suppressEmptyNode: true
    })
    const newSitemap = builder.build({
      '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
      urlset: {
        '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        url: subsetUrls.map(url => ({ loc: url }))
      }
    })

    // Generate a unique ID for this sitemap
    const sitemapId = Date.now().toString()
    
    // Ensure the directory exists
    await fs.mkdir(SITEMAP_DIR, { recursive: true })

    // Write the sitemap to a file
    const filePath = path.join(SITEMAP_DIR, `${sitemapId}.xml`)
    await fs.writeFile(filePath, newSitemap)

    return {
      success: true,
      totalUrls: urls.length,
      subsetUrls,
      subsetSize: subsetUrls.length,
      sitemapId
    }
  } catch (error) {
    console.error('Error processing sitemap:', error)
    return {
      success: false,
      error: 'Failed to process sitemap. Please check the input and try again.'
    }
  }
}