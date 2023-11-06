const { render } = require('@govuk-frontend/helpers/puppeteer')
const { getExamples } = require('@govuk-frontend/lib/components')

describe('Skip Link', () => {
  let examples

  beforeAll(async () => {
    examples = await getExamples('skip-link')
  })

  describe('/examples/template-default', () => {
    beforeAll(async () => {
      await render(page, 'skip-link', examples.default)
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
    })

    it('focuses the linked element', async () => {
      const activeElementId = await page.evaluate(
        () => document.activeElement.id
      )

      expect(activeElementId).toBe('content')
    })

    it('adds the tabindex attribute to the linked element', async () => {
      const tabindex = await page.$eval('#content', (el) =>
        el.getAttribute('tabindex')
      )

      expect(tabindex).toBe('-1')
    })

    it('adds the class for removing the native focus style to the linked element', async () => {
      const cssClass = await page.$eval('#content', (el) =>
        el.classList.contains('govuk-skip-link-focused-element')
      )

      expect(cssClass).toBeTruthy()
    })

    it('removes the tabindex attribute from the linked element on blur', async () => {
      await page.$eval(
        '#content',
        (el) => el instanceof window.HTMLElement && el.blur()
      )

      const tabindex = await page.$eval('#content', (el) =>
        el.getAttribute('tabindex')
      )

      expect(tabindex).toBeNull()
    })

    it('removes the class for removing the native focus style from the linked element on blur', async () => {
      await page.$eval(
        '#content',
        (el) => el instanceof window.HTMLElement && el.blur()
      )

      const cssClass = await page.$eval('#content', (el) =>
        el.getAttribute('class')
      )

      expect(cssClass).not.toContain('govuk-skip-link-focused-element')
    })
  })

  describe('errors at instantiation', () => {
    it('throws when GOV.UK Frontend is not supported', async () => {
      await expect(
        render(page, 'skip-link', examples.default, {
          beforeInitialisation() {
            document.body.classList.remove('govuk-frontend-supported')
          }
        })
      ).rejects.toMatchObject({
        cause: {
          name: 'SupportError',
          message: 'GOV.UK Frontend is not supported in this browser'
        }
      })
    })

    it('throws when $module is not set', async () => {
      await expect(
        render(page, 'skip-link', examples.default, {
          beforeInitialisation($module) {
            $module.remove()
          }
        })
      ).rejects.toMatchObject({
        cause: {
          name: 'ElementError',
          message: 'Skip link: Root element (`$module`) not found'
        }
      })
    })

    it('throws when receiving the wrong type for $module', async () => {
      await expect(
        render(page, 'skip-link', examples.default, {
          beforeInitialisation($module) {
            // Replace with an `<svg>` element which is not an `HTMLElement` in the DOM (but an `SVGElement`)
            $module.outerHTML = `<svg data-module="govuk-skip-link"></svg>`
          }
        })
      ).rejects.toMatchObject({
        cause: {
          name: 'ElementError',
          message:
            'Skip link: Root element (`$module`) is not of type HTMLAnchorElement'
        }
      })
    })

    it('throws when the linked element is missing', async () => {
      await expect(
        render(page, 'skip-link', {
          context: {
            text: 'Skip to main content',
            href: '#this-element-does-not-exist'
          }
        })
      ).rejects.toMatchObject({
        cause: {
          name: 'ElementError',
          message:
            'Skip link: Target content (`id="this-element-does-not-exist"`) not found'
        }
      })
    })

    it('throws when the href does not contain a hash', async () => {
      await expect(
        render(page, 'skip-link', {
          context: {
            text: 'Skip to main content',
            href: 'this-element-does-not-exist'
          }
        })
      ).rejects.toMatchObject({
        cause: {
          name: 'ElementError',
          message:
            'Skip link: Root element (`$module`) attribute (`href`) has no URL fragment'
        }
      })
    })
  })
})