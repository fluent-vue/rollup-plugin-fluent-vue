import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

import rollupVue3 from 'rollup-plugin-vue'
import vue3base from '@vitejs/plugin-vue'
import compiler from '@vue/compiler-sfc'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'

import fluentPlugin from '../src'
import { testBundle } from './util/helpers'

const vue3 = () => vue3base({
  compiler,
})

const baseDir = dirname(fileURLToPath(import.meta.url))

describe.each(['development', 'production'])('external ftl file support mode:%s', (mode) => {
  it('works with vue 3', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      mode,
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
      mode,
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

  it('works with vue 3 rollup plugin', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      mode,
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
      mode,
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
