import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  // Server-only environment values are never injected into browser bundles.
  const serverEnv=loadEnv(mode,process.cwd(),'');
  for(const name of ['AUTH_FIRESTORE_PROJECT','AUTH_FIRESTORE_DATABASE','AUTH_ADMIN_EMAIL','AUTH_ADMIN_PASSWORD','CONTENT_DATA_DIR','CHAM_ENV','GEMINI_API_KEY']) {
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
          navigateFallbackDenylist: [/^\/api\//],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
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
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

