import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['**/__tests__/unit/**/*.{test,spec}.{ts,tsx}'],
    },
  })
);
