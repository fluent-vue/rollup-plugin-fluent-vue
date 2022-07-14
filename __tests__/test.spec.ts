import { describe, expect, it } from 'vitest'

import vue3base from '@vitejs/plugin-vue'
import compiler from '@vue/compiler-sfc'
import rollupVue3 from 'rollup-plugin-vue'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'

import fluentPlugin from '../src'
import { testBundle } from './util/helpers'

const vue3 = () => vue3base({
  compiler,
})

describe.each(['production', 'development'])('vite plugin mode:%s', (mode) => {
  it('generates custom block code', async() => {
    // Arrange
    // Act
    const code = await testBundle({
      mode,
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
      mode,
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
      mode,
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
      mode,
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
})
