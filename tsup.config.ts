import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['cjs'],
  sourcemap: true,
  clean: true,
  bundle: false,
});
