import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react()],
    assetsInclude: ['**/*.csv', '**/*.txt', '**/*.json']
  };
});
