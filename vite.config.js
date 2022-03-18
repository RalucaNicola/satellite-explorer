import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const base = command === 'build' ? 'https://apl-apps4.s3.us-west-2.amazonaws.com/satellite-explorer/' : './';
  // const base = command === 'build' ? 'https://10.195.20.28/demo-apps/satellite-explorer/dist' : './';
  // const base = command === 'build' ? 'https://10.195.20.28/demo-apps/satellite-explorer/dist/' : './';
  return {
    base,
    plugins: [react()]
  };
});
