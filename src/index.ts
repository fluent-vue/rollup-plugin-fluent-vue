import { URLSearchParams } from 'url'
import { join, relative } from 'path'
import { promises as fs } from 'fs'
import MagicString from 'magic-string'

import type { Plugin } from 'vite'

export interface ExternalConfig {
  baseDir: string
  ftlDir: string
  locales: string[]
  warnMissing?: boolean
}

export interface PluginOptions {
  blockType?: string
  external?: ExternalConfig
}

interface InsertInfo {
  insertPos: number
  target: string
}

function normalizePath(path: string) {
  return path.replace(/\\/g, '/')
}

/*
* Get insert position and target component object.
*/
function getInsertInfo(source: string): InsertInfo {
  let target = null

  // vite-plugin-vue2
  let insertPos = source.indexOf('__component__.options.__file')
  if (insertPos !== -1)
    target = '__component__.options'

  // rollup-plugin-vue
  if (insertPos === -1) {
    insertPos = source.indexOf('script.__file')
    if (insertPos !== -1)
      target = 'script'
  }

  // @vitejs/plugin-vue
  if (insertPos === -1) {
    insertPos = source.indexOf('_sfc_main.__hmrId')
    if (insertPos !== -1)
      target = '_sfc_main'
  }

  if (insertPos === -1 || target === null)
    throw new Error('Could not parse vue component')

  return { insertPos, target }
}

export default function fluentPlugin({ blockType = 'fluent', external }: PluginOptions = {}): Plugin {
  return {
    name: 'rollup-plugin-fluent-vue',
    async resolveId(id) {
      if (id.endsWith('.ftl'))
        return id
    },
    async load(id) {
      if (id.endsWith('.ftl')) {
        let ftl
        try {
          ftl = await fs.readFile(id, 'utf8')
        }
        catch (e) {
          if (external?.warnMissing === true)
            this.warn(`Missing ftl file: ${id}`)
          ftl = ''
        }

        return `
import { FluentResource } from '@fluent/bundle'
export default new FluentResource(${JSON.stringify(ftl)})
`
      }
    },
    async transform(code, id) {
      if (!id.includes(`vue&type=${blockType}`) && external == null)
        return

      if (external != null && !id.endsWith('.vue'))
        return

      if (external != null) {
        const relativePath = relative(external.baseDir, id)

        const magic = new MagicString(code, { filename: id })

        magic.prepend(`${external.locales.map(locale => `import ${locale}_ftl from '${normalizePath(join(external.ftlDir, locale, relativePath))}.ftl'`).join(';\n')};\n`)
        magic.prepend('import { FluentResource } from \'@fluent/bundle\';\n')

        const { insertPos, target } = getInsertInfo(code)
        magic.appendLeft(insertPos, `${target}.fluent = { ${external.locales.map(locale => `'${locale}': ${locale}_ftl`).join(', ')} };\n`)

        return {
          code: magic.toString(),
          map: magic.generateMap({ hires: true }),
        }
      }
      else {
        // Custom block support

        // vite-plugin-vue2 pads SFC file sections with newlines - trim those
        const data = code.replace(/^(\n|\r\n)+|(\n|\r\n)+$/g, '')

        const [, rawQuery] = id.split('?', 2)
        const query = new URLSearchParams(rawQuery)

        const locale = query.get('locale')

        if (locale == null)
          return this.error('Custom block does not have locale attribute')

        return `
import { FluentResource } from '@fluent/bundle'

export default function (Component) {
  const target = Component.options || Component
  target.fluent = target.fluent || {}
  target.fluent['${locale}'] = new FluentResource(\`${data}\`)
}`
      }
    },
  }
}
