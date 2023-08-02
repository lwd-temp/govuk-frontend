import { stat } from 'fs/promises'
import { join, parse } from 'path'

import { filesize } from 'filesize'
import { paths, pkg } from 'govuk-frontend-config'
import { getComponentNames, filterPath, getYaml } from 'govuk-frontend-lib/files'

/**
 * Components with JavaScript
 */
const componentNamesWithJavaScript = await getComponentNames((componentName, componentFiles) =>
  componentFiles.some(filterPath([`**/${componentName}.mjs`])))

/**
 * Package options
 *
 * @type {import('govuk-frontend-lib/names').PackageOptions}
 */
export const packageOptions = {
  type: 'module',
  modulePath: 'all.mjs',
  moduleRoot: paths.stats
}

/**
 * Target files for file size analysis
 */
const filesForAnalysis = {
  dist: {
    js: join(paths.root, `dist/govuk-frontend-${pkg.version}.min.js`),
    css: join(paths.root, `dist/govuk-frontend-${pkg.version}.min.css`)
  },
  package: {
    esModule: join(paths.package, 'dist/govuk/all.mjs'),
    esModuleBundle: join(paths.package, 'dist/govuk/all.bundle.mjs'),
    umdBundle: join(paths.package, 'dist/govuk/all.bundle.js')
  }
}

/**
 * Rollup input paths
 */
export const modulePaths = [packageOptions.modulePath]
  .concat(componentNamesWithJavaScript.map((componentName) =>
    `components/${componentName}/${componentName}.mjs`))

/**
 * Rollup module stats
 *
 * @param {string} modulePath - Rollup input path
 * @returns {Promise<{ total: number, modules: ModulesList }>} Rollup module stats
 */
export async function getStats (modulePath) {
  const { base, dir, name } = parse(modulePath)

  // Path to Rollup `npm run build` YAML stats
  /** @type {Record<string, ModulesList> | undefined} */
  const stats = await getYaml(join(paths.stats, `dist/${dir}/${name}.yaml`))
    .catch(() => undefined)

  // Modules bundled
  const modules = stats?.[base] ?? {}

  // Modules total size
  const total = Object.values(modules)
    .map(({ rendered }) => rendered)
    .reduce((total, rendered) => total + rendered, 0)

  return { total, modules }
}

export async function getFileSizes () {
  const [distJs, distCSS, esModule, esModuleBundle, umdBundle] = await Promise.all([
    stat(filesForAnalysis.dist.js),
    stat(filesForAnalysis.dist.css),
    stat(filesForAnalysis.package.esModule),
    stat(filesForAnalysis.package.esModuleBundle),
    stat(filesForAnalysis.package.umdBundle)
  ])

  return {
    'Minified release JS': filesize(distJs.size, { base: 2 }),
    'Minified release CSS': filesize(distCSS.size, { base: 2 }),
    'Package ES Module': filesize(esModule.size, { base: 2 }),
    'Package ES Module Bundle': filesize(esModuleBundle.size, { base: 2 }),
    'Package UMD Bundle': filesize(umdBundle.size, { base: 2 })
  }
}

/**
 * @typedef {{ [modulePath: string]: { rendered: number } }} ModulesList
 */
