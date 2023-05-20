import {defineConfig} from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['./src/index.ts', './src/helpers/index.ts'],
  format: ['cjs', 'esm'],
  legacyOutput: true,
  outDir: 'dist',
  sourcemap: true,
})
