import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

import type { RollupOptions } from 'rollup'
import { rollup } from 'rollup'
import vue from 'rollup-plugin-vue'
import { createVuePlugin } from 'vite-plugin-vue2'

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

describe('rollup plugin', () => {
  it('generates custom block code', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      input: resolve(baseDir, 'fixtures/test.vue'),
      plugins: [
        vue({
          customBlocks: ['fluent'],
        }),
        fluentPlugin(),
      ],
    })

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('works with vue 2', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      input: resolve(baseDir, 'fixtures/test.vue'),
      plugins: [
        createVuePlugin(),
        fluentPlugin(),
      ],
    })

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('custom blockType', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      input: resolve(baseDir, 'fixtures/blockType.vue'),
      plugins: [
        vue({
          customBlocks: ['custom'],
        }), fluentPlugin({
          blockType: 'custom',
        }),
      ],
      external: ['vue', '@fluent/bundle'],
    })

    // Assert
    expect(code).toMatchSnapshot()
  })

  it('errors with no locale attr', async() => {
    // Arrange
    const func = async(): Promise<string> => await testBundle({
      input: resolve(baseDir, 'fixtures/noLocale.vue'),
      plugins: [
        vue({
          customBlocks: ['fluent'],
        }),
        fluentPlugin(),
      ],
      external: ['vue', '@fluent/bundle'],
    })

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
