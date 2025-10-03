/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        'android/',
        'electron/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Fix Radix UI imports with version numbers
      ...Object.fromEntries(
        Object.entries({
          '@radix-ui/react-slot': '@radix-ui/react-slot',
          'class-variance-authority': 'class-variance-authority',
          'clsx': 'clsx',
          'tailwind-merge': 'tailwind-merge'
        })
      )
    }
  }
});
