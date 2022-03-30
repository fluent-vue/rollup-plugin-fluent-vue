
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

import type { RollupOptions } from 'rollup'
import { rollup } from 'rollup'
import vue3 from 'rollup-plugin-vue'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'

import fluentPlugin from '../src'

const baseDir = dirname(fileURLToPath(import.meta.url))

const testBundle = async(options: RollupOptions): Promise<string> => {
  const bundle = await rollup({
    ...options,
    external: ['vue', '@fluent/bundle'],
  })

  const { output } = await bundle.generate({ format: 'cjs', exports: 'auto' })
  const [{ code }] = output
  return code
}

describe('external ftl file support', () => {
  it('works with vue 3', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      input: resolve(baseDir, 'fixtures/components/external.vue'),
      plugins: [
        vue3(),
        fluentPlugin({
          external: {
            baseDir: resolve(baseDir, 'fixtures'),
            ftlDir: resolve(baseDir, 'fixtures/ftl'),
            locales: ['en', 'da'],
          },
        }),
      ],
    })

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with vue 3 script setup', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      input: resolve(baseDir, 'fixtures/components/external.setup.vue'),
      plugins: [
        vue3(),
        fluentPlugin({
          external: {
            baseDir: resolve(baseDir, 'fixtures'),
            ftlDir: resolve(baseDir, 'fixtures/ftl'),
            locales: ['en', 'da'],
          },
        }),
      ],
    })

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with vue 2', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      input: resolve(baseDir, 'fixtures/components/external.vue'),
      plugins: [
        vue2(),
        fluentPlugin({
          external: {
            baseDir: resolve(baseDir, 'fixtures'),
            ftlDir: resolve(baseDir, 'fixtures/ftl'),
            locales: ['en', 'da'],
          },
        }),
      ],
    })

    // Assert
    expect(code).toMatchSnapshot()
  })
})
