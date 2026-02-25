import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://blog.miguelzubieta.me',
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare(),
});