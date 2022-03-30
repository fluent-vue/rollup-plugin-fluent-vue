import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

import type { InlineConfig } from 'vite';
import { createServer } from 'vite'
import vue3base from '@vitejs/plugin-vue'
import compiler from '@vue/compiler-sfc'
import rollupVue3 from 'rollup-plugin-vue'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'

import fluentPlugin from '../src'

const vue3 = () => vue3base({
  compiler,
})

const baseDir = dirname(fileURLToPath(import.meta.url))

const testBundle = async(options: InlineConfig, file: string): Promise<string | undefined> => {
  const vite = await createServer({
    root: baseDir,
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

describe('vite plugin', () => {
  it('generates custom block code', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      plugins: [
        vue3(),
        fluentPlugin(),
      ],
    }, '/fixtures/test.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with rollup plugin', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      plugins: [
        rollupVue3({
          customBlocks: ['fluent'],
        }),
        fluentPlugin(),
      ],
    }, '/fixtures/test.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with vue 2', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      plugins: [
        vue2(),
        fluentPlugin(),
      ],
    }, '/fixtures/test.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('custom blockType', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      plugins: [
        vue3(),
        fluentPlugin({
          blockType: 'custom',
        }),
      ],
    }, '/fixtures/blockType.vue')

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('errors with no locale attr', async() => {
    // Arrange
    const func = async(): Promise<string | undefined> => await testBundle({
      plugins: [
        vue3(),
        fluentPlugin(),
      ],
    }, '/fixtures/noLocale.vue')

    // TODO: Use rejects
    try {
      // Act
      await func()
    }
    catch (err) {
      // Assert
      expect(err).toMatchSnapshot()
    }
  })
})
