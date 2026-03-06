import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: [],
  },
  envDir: './env',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
      lib: path.resolve(__dirname, './src/lib'),
      hooks: path.resolve(__dirname, './src/hooks'),
      pages: path.resolve(__dirname, './src/pages'),
      enums: path.resolve(__dirname, './src/enums'),
      routes: path.resolve(__dirname, './src/routes'),
      assets: path.resolve(__dirname, './src/assets'),
      helpers: path.resolve(__dirname, './src/helpers'),
      contexts: path.resolve(__dirname, './src/contexts'),
      layouts: path.resolve(__dirname, './src/layouts'),
      services: path.resolve(__dirname, './src/services'),
      interfaces: path.resolve(__dirname, './src/interfaces'),
      components: path.resolve(__dirname, './src/components'),
      constants: path.resolve(__dirname, './src/constants'),
      utils: path.resolve(__dirname, './src/utils'),
    },
  },
});
