import coreWebVitals from "eslint-config-next/core-web-vitals"
import typescript from "eslint-config-next/typescript"

// eslint-config-next 16 ships flat configs directly. FlatCompat is not needed and in fact
// crashes ESLint 10 with a circular-structure error while validating the legacy shape.
const config = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      ".next/**",
      // Generated from Natural Earth by the .gen.mjs scripts — not hand-maintained.
      "lib/africa-geo.ts",
      "lib/globe-geo.ts",
      "lib/*.gen.mjs",
      // Unused shadcn scaffolding; only accordion is imported by the app.
      "components/ui/**",
      "hooks/**",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
]

export default config
