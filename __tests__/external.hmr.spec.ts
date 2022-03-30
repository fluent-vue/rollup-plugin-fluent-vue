import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

import type { InlineConfig, Plugin } from 'vite'
import { createServer } from 'vite'
import vue3 from 'rollup-plugin-vue'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'

import fluentPlugin from '../src'

const baseDir = dirname(fileURLToPath(import.meta.url))

const testBundle = async(options: InlineConfig, file: string): Promise<string | undefined> => {
  const vite = await createServer(options)

  const result = await vite.transformRequest(file)
  return result?.code
}

function externals(): Plugin {
  const externals = [
    'vue',
    '@fluent/bundle',
  ]

  return {
    name: 'externals',
    resolveId(id) {
      if (externals.includes(id))
        return id
    },
    load(id) {
      if (externals.includes(id))
        return 'export default function() {}'
    },
  }
}

describe('vite plugin with external support', () => {
  it('works with vue 3', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
      plugins: [
        externals(),
        vue3(),
        fluentPlugin({
          external: {
            baseDir: resolve(baseDir, 'fixtures'),
            ftlDir: resolve(baseDir, 'fixtures/ftl'),
            locales: ['en', 'da'],
          },
        }),
      ],
    }, '/fixtures/components/external.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with vue 3 script setup', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
      plugins: [
        externals(),
        vue3(),
        fluentPlugin({
          external: {
            baseDir: resolve(baseDir, 'fixtures'),
            ftlDir: resolve(baseDir, 'fixtures/ftl'),
            locales: ['en', 'da'],
          },
        }),
      ],
    }, '/fixtures/components/external.setup.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with vue 2', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
      plugins: [
        externals(),
        vue2(),
        fluentPlugin({
          external: {
            baseDir: resolve(baseDir, 'fixtures'),
            ftlDir: resolve(baseDir, 'fixtures/ftl'),
            locales: ['en', 'da'],
          },
        }),
      ],
    }, '/fixtures/components/external.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })
})
