'use server'

import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import fs from 'fs/promises'
import path from 'path'

const SITEMAP_DIR = path.join(process.cwd(), 'public', 'generated_sitemaps')

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

    const urls = result.urlset.url.map((url: any) => typeof url === 'string' ? url : url.loc)

    // Group URLs by their structure
    const groupedUrls: { [key: string]: string[] } = {}
    urls.forEach((url: string) => {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        const groupKey = '/' + pathParts[0]
        if (!groupedUrls[groupKey]) {
          groupedUrls[groupKey] = []
        }
        groupedUrls[groupKey].push(url)
      } else {
        // Handle root URLs
        if (!groupedUrls['/']) {
          groupedUrls['/'] = []
        }
        groupedUrls['/'].push(url)
      }
    })

    // Get subset for each group
    const subsetUrls: string[] = []
    Object.entries(groupedUrls).forEach(([group, groupUrls]) => {
      const groupSubset = groupUrls.slice(0, subsetSize)
      subsetUrls.push(...groupSubset)
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