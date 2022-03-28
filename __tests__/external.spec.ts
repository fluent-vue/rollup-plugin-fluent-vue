
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
  it('can read files from a directory', async() => {
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
    expect(code).toMatchInlineSnapshot(`
      "'use strict';
      
      var bundle = require('@fluent/bundle');
      var vue = require('vue');
      
      var en_ftl = new bundle.FluentResource(\\"# Simple things are simple.\\\\nhello-user = Hello, {\$userName}!\\\\n\\\\n# Complex things are possible.\\\\nshared-photos =\\\\n  {\$userName} {\$photoCount ->\\\\n     [one] added one photo\\\\n    *[other] added {\$photoCount} new photos\\\\n  } to {\$userGender ->\\\\n     [male] his stream\\\\n     [female] her stream\\\\n    *[other] their stream\\\\n  }.\\\\n\\");
      
      var da_ftl = new bundle.FluentResource(\\"\\");
      
      function render(_ctx, _cache) {
        return (vue.openBlock(), vue.createElementBlock(\\"div\\", null, [
          vue.createElementVNode(\\"div\\", null, vue.toDisplayString(_ctx.\$t('hello-user', { userName: _ctx.userName })), 1 /* TEXT */),
          vue.createElementVNode(\\"div\\", null, vue.toDisplayString(_ctx.\$t('shared-photos', { userName: _ctx.userName, photoCount: _ctx.photoCount, userGender: _ctx.userGender })), 1 /* TEXT */)
        ]))
      }
      
      const script = {};
      
      script.fluent = { en: en_ftl, da: da_ftl };
      script.render = render;
      script.__file = \\"__tests__/fixtures/components/external.vue\\";
      
      module.exports = script;
      "
    `)
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
    expect(code).toMatchInlineSnapshot(`
      "'use strict';
      
      var bundle = require('@fluent/bundle');
      
      var en_ftl = new bundle.FluentResource(\\"# Simple things are simple.\\\\nhello-user = Hello, {\$userName}!\\\\n\\\\n# Complex things are possible.\\\\nshared-photos =\\\\n  {\$userName} {\$photoCount ->\\\\n     [one] added one photo\\\\n    *[other] added {\$photoCount} new photos\\\\n  } to {\$userGender ->\\\\n     [male] his stream\\\\n     [female] her stream\\\\n    *[other] their stream\\\\n  }.\\\\n\\");
      
      var da_ftl = new bundle.FluentResource(\\"\\");
      
      var render = function () {var _vm=this;var _h=_vm.\$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',[_vm._v(_vm._s(_vm.\$t('hello-user', { userName: _vm.userName })))]),_c('div',[_vm._v(_vm._s(_vm.\$t('shared-photos', { userName: _vm.userName, photoCount: _vm.photoCount, userGender: _vm.userGender })))])])};
      var staticRenderFns = [];
      render._withStripped = true;
      
      function normalizeComponent (
          scriptExports,
          render,
          staticRenderFns,
          functionalTemplate,
          injectStyles,
          scopeId,
          moduleIdentifier, /* server only */
          shadowMode /* vue-cli only */
      ) {
        // Vue.extend constructor export interop
        var options = typeof scriptExports === 'function'
            ? scriptExports.options
            : scriptExports;
      
        // render functions
        if (render) {
          options.render = render;
          options.staticRenderFns = staticRenderFns;
          options._compiled = true;
        }
      
        // functional template
        if (functionalTemplate) {
          options.functional = true;
        }
      
        // scopedId
        if (scopeId) {
          options._scopeId = 'data-v-' + scopeId;
        }
      
        var hook;
        if (moduleIdentifier) { // server build
          hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                (this.\$vnode && this.\$vnode.ssrContext) || // stateful
                (this.parent && this.parent.\$vnode && this.parent.\$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
              context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (injectStyles) {
              injectStyles.call(this, context);
            }
            // register component module identifier for async chunk inferrence
            if (context && context._registeredComponents) {
              context._registeredComponents.add(moduleIdentifier);
            }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
        } else if (injectStyles) {
          hook = shadowMode
              ? function () {
                injectStyles.call(
                    this,
                    (options.functional ? this.parent : this).\$root.\$options.shadowRoot
                );
              }
              : injectStyles;
        }
      
        if (hook) {
          if (options.functional) {
            // for template-only hot-reload because in that case the render fn doesn't
            // go through the normalizer
            options._injectStyles = hook;
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection (h, context) {
              hook.call(context);
              return originalRender(h, context)
            };
          } else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing
                ? [].concat(existing, hook)
                : [hook];
          }
        }
      
        return {
          exports: scriptExports,
          options: options
        }
      }
      
      const __vue2_script = {};
      const __cssModules = {};
      var __component__ = /*#__PURE__*/normalizeComponent(
        __vue2_script,
        render,
        staticRenderFns,
        false,
        __vue2_injectStyles,
        null,
        null,
        null
      );
      
      function __vue2_injectStyles (context) {
        for(let o in __cssModules){
          this[o] = __cssModules[o];
        }
      }
      __component__.options.fluent = { en: en_ftl, da: da_ftl };
      __component__.options.__file = \\"__tests__/fixtures/components/external.vue\\";
      var external = /*#__PURE__*/(function () { return __component__.exports })();
      
      module.exports = external;
      "
    `)
  })
})
