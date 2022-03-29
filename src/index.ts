import { URLSearchParams } from 'url'
import { join, relative } from 'path'
import { promises as fs } from 'fs'
import MagicString from 'magic-string'

import type { Plugin } from 'vite'
import { normalizePath } from 'vite'

export interface ExternalConfig {
  baseDir: string
  ftlDir: string
  locales: string[]
}

export interface PluginOptions {
  blockType?: string
  external?: ExternalConfig
}

interface InsertInfo {
  insertPos: number
  target: string
}

/*
* Get insert position and target component object.
*/
function getInsertInfo(source: string): InsertInfo {
  let vue = null
  let insertPos = source.indexOf('__component__.options.__file')
  if (insertPos > -1) {
    vue = 2
  }
  else {
    insertPos = source.indexOf('script.render = render')
    vue = 3
  }

  if (insertPos === -1)
    throw new Error('Could not parse vue component')

  const target = vue === 2 ? '__component__.options' : 'script'

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
        const ftl = await fs.readFile(id, 'utf8')
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
        magic.appendLeft(insertPos - 1, `${target}.fluent = { ${external.locales.map(locale => `${locale}: ${locale}_ftl`).join(', ')} }`)

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
