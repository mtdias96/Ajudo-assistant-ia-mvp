import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/functions/**', 'src/lib/**'],
      thresholds: {
        lines: 70,
        functions: 70,
      },
    },
    setupFiles: ['src/tests/setup.ts'],
  },
});
