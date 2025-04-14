import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import autoprefixer from 'autoprefixer'
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      AutoImport({
				imports: ['vue', 'vue-router', 'pinia',
          {
            // 自定义模块路径
            '@/utils/request.ts': [
              'useRequest',
              'handleResponse'
            ]
          }
        ], // 自动导入的依赖库数组
				dts: './auto-imports.d.ts', // 自动导入类型定义文件路径
			}),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        'utils': resolve(__dirname, 'src/utils'),
        '~': resolve(__dirname, 'src/components')
      }
    },
    server: {
      host: '127.0.0.1',
      port: 9527,
      open: false,
      cors: true
    },
    build: {
      outDir: `dist/${mode}`,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'ant-design-vue': ['ant-design-vue'],
            'vue-libs': ['vue', 'vue-router', 'pinia']
          }
        }
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "./src/styles/theme.less";',
          javascriptEnabled: true
        }
      },
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: [
              '> 1%',
              'last 2 versions',
              'not ie <= 11',
              'Chrome >= 49',
              'Firefox >= 45'
            ]
          })
        ]
      }
    }
  }
})
