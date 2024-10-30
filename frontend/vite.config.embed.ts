import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'fs';

const fileExists = (filePath: string) => {
  return fs.existsSync(filePath);
};

export default defineConfig(({ mode, command }) => {
  console.log(`Build mode: ${mode}`);
  const postCSSPlugins =
    command === 'build'
      ? [
          tailwind({
            config: `./environments/${mode}/tailwind.config.js`,
          }),
          autoprefixer,
          cssnano,
        ]
      : [
          tailwind({
            config: `./environments/${mode}/tailwind.config.js`,
          }),
          autoprefixer,
        ];

  const demoPageCssPath = resolve(__dirname, `environments/${mode}/demo-page.css`);
  const inputConfig: any = {
    main: resolve(__dirname, 'src/main-embed.tsx'),
    'widget-script': resolve(__dirname, 'src/embed/widget-script.ts'),
    'button-style': resolve(__dirname, 'src/styles/button-style.css'),
    demo: resolve(__dirname, 'demo.html'),
    'demo-page': resolve(__dirname, 'src/embed/demo-page.css'),
  };

  if (fileExists(demoPageCssPath)) {
    inputConfig['demo-page'] = demoPageCssPath;
  }

  return {
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    },
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: `environments/${mode}/public_assets/*`,
            dest: '.', // Copy client-specific files to dist/embed
          },
          {
            src: `environments/${mode}/demo-page.css`,
            dest: '.',
          },
          {
            src: `environments/${mode}/demo.html`,
            dest: '.',
          },
        ],
      }),
    ],
    build: {
      outDir: 'dist/embed', // Output directory for the embeddable script
      rollupOptions: {
        input: inputConfig,
        output: {
          entryFileNames: chunkInfo => {
            if (chunkInfo.name === 'widget-script') {
              return 'widget-script.js';
            }
            return 'assets/[name].js';
          },
          chunkFileNames: 'assets/[name].js',
          assetFileNames: asset => {
            return '[name].[ext]';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      postcss: {
        plugins: postCSSPlugins,
      },
    },
  };
});
