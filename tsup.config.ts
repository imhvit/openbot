import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/bot.ts'],
  outDir: 'dist',
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
});
