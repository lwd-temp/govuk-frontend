module.exports = {
  browserContext: 'incognito',
  browserPerWorker: true,

  /**
   * @type {import('puppeteer').PuppeteerLaunchOptions}
   */
  launch: {
    args: [
      /**
       * Workaround for 'No usable sandbox! Update your kernel' error
       * see more https://github.com/Googlechrome/puppeteer/issues/290
       */
      '--no-sandbox',
      '--disable-setuid-sandbox',

      /**
       * Prevent empty Chromium startup window
       * Tests use their own `browser.newPage()` instead
       */
      '--no-startup-window'
    ],
    waitForInitialPage: false
  }
}
