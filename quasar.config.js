/* eslint-env node */
/*eslint-disable*/
/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const { configure } = require("quasar/wrappers");
const path = require("path");

module.exports = configure(function (/* ctx */) {
  return {
    eslint: {
      warnings: true,
      errors: true
    },

    // Boot files
    boot: [
      "diagnostics",
      "capacitor-debug",
      "i18n",
      "axios",
      "auth",
      "resume-check",
      "capacitor-status-bar"
    ],

    // App CSS
    css: ["main.scss"],

    // Quasar extras
    extras: [
      "roboto-font",
      "material-icons"
    ],

    // Build configuration
    build: {
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16"
      },

      vueRouterMode: "history",
      analyze: true,
      minify: true,

      vitePlugins: [
        [
          "@intlify/vite-plugin-vue-i18n",
          {
            include: path.resolve(__dirname, "./src/i18n/**")
          }
        ]
      ],

      extendViteConf(cfg) {
        cfg.define = {
          ...(cfg.define || {}),
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
          __VUE_OPTIONS_API__: true,
          __VUE_PROD_DEVTOOLS__: false
        }
        cfg.build = cfg.build || {}
        cfg.build.rollupOptions = cfg.build.rollupOptions || {}
        const output = cfg.build.rollupOptions.output || {}
        cfg.build.rollupOptions.output = {
          ...output,
          manualChunks: {
            ...(typeof output.manualChunks === "object" ? output.manualChunks : {}),
            vue: ["vue", "vue-router", "pinia"],
            axios: ["axios"],
            i18n: ["vue-i18n"],
            capacitor: ["@capacitor/core", "@capacitor/camera", "@capacitor/app", "@capacitor/haptics", "@capacitor/keyboard", "@capacitor/status-bar"]
          }
        }
      }
    },

    // Dev server
    devServer: {
      open: {
        app: { name: "google chrome" }
      }
    },

    // Quasar framework config
    framework: {
      config: {},
      plugins: ["Notify"]
    },

    animations: ['fadeIn', 'fadeOut', 'backInRight', 'backInLeft', 'flipInY'],

    // SSR
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        "render"
      ]
    },

    // PWA
    pwa: {
      workboxMode: "generateSW",
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false
    },

    // Cordova
    cordova: {},

    // Capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Electron configuration
    electron: {
      inspectPort: 5858,

      bundler: "packager",

      packager: {},

      builder: {
        appId: "dreamhubb"
      }
    },

    // Browser extension
    bex: {
      contentScripts: ["my-content-script"]
    }
  };
});
