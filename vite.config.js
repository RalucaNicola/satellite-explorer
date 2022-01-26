import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const base = command === "build" ? "http://localhost/arcgis-boilerplate/dist/" : "./"
  return {
    base,
    plugins: [react()]
  }
})