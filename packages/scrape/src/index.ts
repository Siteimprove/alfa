import { launch, Browser } from 'puppeteer'
import browserify from 'browserify'
import { Node } from '@endal/dom'
import { Context } from '@endal/rule'
import { parentize } from '@endal/pickle'

const PICKLE = require.resolve('@endal/pickle')

function bundle (file: string, options: object): Promise<string> {
  return new Promise((resolve, reject) =>
    browserify(file, options).bundle((error, buffer) => {
      if (error) {
        reject(error)
      } else {
        resolve(buffer.toString('utf8'))
      }
    })
  )
}

export enum Wait {
  Ready = 'domcontentloaded',
  Loaded = 'load',
  Idle = 'networkidle0'
}

export interface ScrapeOptions {
  timeout: number
  wait: Wait
}

export class Scraper {
  private readonly _browser = launch({
    headless: true
  })

  private readonly _pickle = bundle(PICKLE, {
    standalone: 'Endal.Pickle'
  })

  async scrape (url: string, options: Partial<ScrapeOptions> = {}): Promise<Context> {
    const browser = await this._browser
    const pickle = await this._pickle

    const page = await browser.newPage()
    await page.goto(url, {
      timeout: options.timeout || 10000,
      waitUntil: options.wait || Wait.Loaded
    })

    await page.evaluate(pickle)

    const dom: Node = await page.evaluate(`
      Endal.Pickle.virtualize(document, { parents: false })
    `)

    await page.close()

    return { dom }
  }

  async close (): Promise<void> {
    const browser = await this._browser
    await browser.close()
  }
}
