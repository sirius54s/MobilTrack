import js from "@eslint/js"
import typescript from "@typescript-eslint/eslint-plugin"
import typescriptParser from "@typescript-eslint/parser"
import vue from "eslint-plugin-vue"
import vueParser from "vue-eslint-parser"

export default [
  // Ignorar ciertos archivos
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".quasar/**",
      "src-capacitor/**",
      "src-cordova/**",
      "quasar.config.*.temporary.compiled*",
    ],
  },

  // Configuración base para JavaScript
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      "prefer-promise-reject-errors": "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-console": "off",
      "no-unused-vars": "warn",
    },
  },

  // Configuración para TypeScript
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-var-requires": "off",
      "prefer-promise-reject-errors": "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-console": "off",
    },
  },

  // Configuración para Vue SFC
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      vue,
      "@typescript-eslint": typescript,
    },
    rules: {
      // Reglas básicas de Vue 3
      "vue/no-unused-vars": "error",
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "off",
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],

      // Reglas TypeScript en Vue
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",

      // Reglas generales
      "prefer-promise-reject-errors": "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-console": "off",
    },
  },

  // Configuración específica para archivos de configuración
  {
    files: ["quasar.config.js", "quasar.config.ts", "eslint.config.*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  // Configuración para archivos de Electron
  {
    files: ["src-electron/**/*.js", "src-electron/**/*.ts"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        Buffer: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]
