import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const base = command === 'build' ? 'https://localhost/satellite-explorer/' : './';
  return {
    base,
    plugins: [react()]
  };
});
