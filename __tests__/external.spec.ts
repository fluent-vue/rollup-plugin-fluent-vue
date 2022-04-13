import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

import rollupVue3 from 'rollup-plugin-vue'
import vue3base from '@vitejs/plugin-vue'
import compiler from '@vue/compiler-sfc'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'

import type { InlineConfig } from 'vite'
import { createServer } from 'vite'
import fluentPlugin from '../src'

const vue3 = () => vue3base({
  compiler,
})

const baseDir = dirname(fileURLToPath(import.meta.url))

const testBundle = async(options: InlineConfig, file: string): Promise<string | undefined> => {
  const vite = await createServer({
    ...options,
    plugins: [
      ...options.plugins,
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

  const output = await vite.transformRequest(file)
  return output?.code
}

describe('external ftl file support', () => {
  it('works with vue 3', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
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

  it('works with vue 3 in production', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
      mode: 'production',
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
    }, '/fixtures/components/external.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with vue 3 rollup plugin', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
      plugins: [
        rollupVue3(),
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

  it('works with vue 3 rollup plugin in production', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
      mode: 'production',
      plugins: [
        rollupVue3(),
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

  it('works with vue 2', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
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
    }, '/fixtures/components/external.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with vue 2 in production', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      root: baseDir,
      mode: 'production',
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
    }, '/fixtures/components/external.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })
})
