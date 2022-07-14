import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import type { InlineConfig } from 'vite'
import { build } from 'vite'

const baseDir = dirname(fileURLToPath(import.meta.url))

export const testBundle = async(options: InlineConfig, file: string): Promise<string | undefined> => {
  const out = await build({
    root: resolve(baseDir, '..'),
    mode: 'production',
    ...options,
    build: {
      rollupOptions: {
        input: file,
        shimMissingExports: true,
      },
      minify: false,
      write: false,
    },
    plugins: [
      ...(options.plugins as any),
      {
        resolveId(id) {
          if (id === 'vue' || id === '@fluent/bundle')
            return id
        },
        load(id) {
          if (id === 'vue' || id === '@fluent/bundle')
            return 'export default {}'
        },
      },
    ],
  })

  const output = (out as any).output

  return output
    ?.map((o: { code: string }) => `\n\n${o.code}`)
    .join('\n')
}
