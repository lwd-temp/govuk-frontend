const { compileSassString } = require('../../../lib/jest-helpers')

const sassConfig = {
  outputStyle: 'compressed'
}

describe('@function font-url', () => {
  it('by default concatenates the font path and the filename', async () => {
    const sass = `
      @import "tools/font-url";

      $govuk-fonts-path: '/path/to/fonts/';

      @font-face {
        font-family: "whatever";
        src: govuk-font-url("whatever.woff2");
      }
    `

    await expect(compileSassString(sass, sassConfig))
      .resolves
      .toMatchObject({
        css: '@font-face{font-family:"whatever";src:url("/path/to/fonts/whatever.woff2")}'
      })
  })

  it('can be overridden to use a defined Sass function', async () => {
    const sass = `
      @import "tools/font-url";

      $govuk-fonts-path: '/path/to/fonts/';
      $govuk-font-url-function: 'to_upper_case';

      @font-face {
        font-family: "whatever";
        src: govuk-font-url("whatever.woff2");
      }
    `

    await expect(compileSassString(sass, sassConfig))
      .resolves
      .toMatchObject({
        css: '@font-face{font-family:"whatever";src:"WHATEVER.WOFF2"}'
      })
  })

  it('can be overridden to use a custom function', async () => {
    const sass = `
      @import "tools/font-url";

      @function custom-url-handler($filename) {
        @return url("/custom/#{$filename}");
      }

      $govuk-fonts-path: '/assets/fonts/';
      $govuk-font-url-function: 'custom-url-handler';

      @font-face {
        font-family: "whatever";
        src: govuk-font-url("whatever.woff2");
      }
    `

    await expect(compileSassString(sass, sassConfig))
      .resolves
      .toMatchObject({
        css: '@font-face{font-family:"whatever";src:url("/custom/whatever.woff2")}'
      })
  })
})
