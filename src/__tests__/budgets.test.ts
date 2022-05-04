import puppeteer, { Browser, Page } from 'puppeteer'
import { Budget } from '../types'
import { createBudget } from '../lib/api/budgets'

describe('App.js', () => {
  let browser: Browser
  let page: Page
  let budget: Budget

  beforeAll(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage()
    budget = await createBudget({ name: 'Test Budget' })
  })

  it('stores the selected budget as default', async () => {
    await page.goto('http://localhost:3000')
    await page.waitForNavigation()

    // TODO: expect budget switch to be rendered
    const text = await page.evaluate(() => document.body.textContent)
    expect(text).toContain(budget.name)

    // TODO: select a budget

    // await page.goto('http://localhost:3000')
    // await page.waitForNavigation()

    // TODO: expect budget dashboard to be rendered
  })

  afterAll(() => browser.close())
})
