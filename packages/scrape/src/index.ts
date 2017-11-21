import { launch } from 'puppeteer'

export interface Document {
  readonly source: string
  readonly headers: { [key: string]: string }
  readonly html: string
}

export interface Image {
  readonly source: string
  readonly data: string
}

(async (): Promise<void> => {
  const browser = await launch({
    headless: true
  })

  const page = await browser.newPage()

  const documents: Array<Document> = []
  const images: Array<Image> = []

  page.on('response', async response => {
    if (!response.ok) {
      return
    }

    const type = response.headers['content-type']

    if (!type) {
      return
    }

    if (type.match(/^image/)) {
      const buffer = await response.buffer()

      images.push({
        source: response.url,
        data: buffer.toString('base64')
      })
    }

    if (type.match(/^text\/html/)) {
      const buffer = await response.buffer()

      documents.push({
        source: response.url,
        headers: response.headers,
        html: buffer.toString('utf8')
      })
    }
  })

  console.time('Scrape')

  await page.goto('https://siteimprove.com', {
    waitUntil: 'networkidle0'
  })

  console.timeEnd('Scrape')

  await page.close()

  console.log('Document:', JSON.stringify(documents).length, 'bytes')
  console.log('Images:', JSON.stringify(images).length, 'bytes')

  await browser.close()
})()
