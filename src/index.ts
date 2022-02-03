import type { Plugin } from 'rollup'
import { URLSearchParams } from 'url'

export interface PluginOptions {
  blockType?: string
}

export default function fluentPlugin ({ blockType = 'fluent' }: PluginOptions = {}): Plugin {
  return {
    name: 'rollup-plugin-fluent-vue',
    transform (code, id) {
      if (!id.includes(`vue&type=${blockType}`)) {
        return
      }

      // vite-plugin-vue2 pads SFC file sections with newlines - trim those
      const data = code.replace(/^(\n|\r\n)+|(\n|\r\n)+$/g, '')

      const [, rawQuery] = id.split('?', 2)
      const query = new URLSearchParams(rawQuery)

      const locale = query.get('locale')

      if (locale == null) {
        return this.error('Custom block does not have locale attribute')
      }

      return `
import { FluentResource } from '@fluent/bundle'

export default function (Component) {
  const target = Component.options || Component
  target.fluent = target.fluent || {}
  target.fluent['${locale}'] = new FluentResource(\`${data}\`)
}`
    }
  }
}
