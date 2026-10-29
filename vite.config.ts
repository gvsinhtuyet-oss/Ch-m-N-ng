import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode, command}) => {
  // Server-only environment values are never injected into browser bundles.
  const serverEnv=loadEnv(mode,process.cwd(),'');
  for(const name of ['GOOGLE_CLIENT_ID','AUTH_FIRESTORE_PROJECT','AUTH_FIRESTORE_DATABASE','AUTH_ADMIN_EMAIL','AUTH_ADMIN_PASSWORD','CONTENT_DATA_DIR','CHAM_ENV','GEMINI_API_KEY']) {
    if(process.env[name]===undefined && serverEnv[name])process.env[name]=serverEnv[name];
  }
  const connectApi=(server:any)=>{
    let api:Promise<any>|undefined;
    server.middlewares.use((req:any,res:any,next:any)=>{
      if(!req.url?.startsWith('/api/'))return next();
      api ||= import('./content-server.mjs');
      api.then(({apiServer})=>apiServer.emit('request',req,res)).catch((error)=>{
        console.error('Preview API startup:',error.message);
        res.writeHead(503,{'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'Máy chủ Preview chưa khởi động được. Kiểm tra cấu hình máy chủ.'}));
      });
    });
  };
  return {
    plugins: [
      {name:'cham-preview-api',configureServer:connectApi,configurePreviewServer:connectApi},
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['adventure-background.svg', 'icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'CHẠM ĐÀ NẴNG – Hành trình số khám phá quê hương',
          short_name: 'ChạmĐàNẵng',
          description: 'Hành trình số khám phá giáo dục địa phương thành phố Đà Nẵng',
          theme_color: '#0284c7',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/api\//, /^\/nam-o-background-review\.html(?:\?|$)/],
          // Install only the shell. Lesson assets and feature chunks are cached on use.
          globPatterns: ['index.html', 'registerSW.js', 'assets/*.{js,css}', '*.{ico,png,svg}'],
          // Keep only startup scripts referenced by HTML, never lazy features.
          manifestTransforms: [async entries => {
            const shellPath = path.resolve('dist/index.html');
            if (command !== 'build' || !existsSync(shellPath)) {
              return { manifest: entries, warnings: [] };
            }
            const html = readFileSync(shellPath, 'utf8');
            const startupScripts = new Set(Array.from(html.matchAll(/(?:src|href)=["']\/([^"']+\.js)["']/g), match => match[1]));
            return {
              manifest: entries.filter(entry => !entry.url.endsWith('.js') || startupScripts.has(entry.url)),
              warnings: [],
            };
          }],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({url, request}) => url.origin === self.location.origin && request.destination === 'script',
              handler: 'NetworkFirst',
              options: {
                networkTimeoutSeconds: 4,
                cacheName: 'cham-feature-scripts-v2',
                expiration: {maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30},
                cacheableResponse: {statuses: [200]},
              },
            },
            {
              urlPattern: ({url, request}) => url.origin === self.location.origin && request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'cham-learning-images-v1',
                expiration: {maxEntries: 180, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true},
                cacheableResponse: {statuses: [200]},
              },
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
      },
    },
    server: {
      allowedHosts: ['terminal.local'],
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});



