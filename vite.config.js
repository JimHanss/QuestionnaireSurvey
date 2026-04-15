import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-stack': ['react', 'react-dom', 'formik', 'yup'],
                    'chart-stack': [
                        'echarts/core',
                        'echarts/charts',
                        'echarts/components',
                        'echarts/renderers'
                    ]
                }
            }
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: [
                'src/features/questionnaire/components/QuestionCard.tsx',
                'src/features/questionnaire/utils/questionFlow.ts',
                'src/features/questionnaire/utils/draftStorage.ts',
                'src/features/questionnaire/utils/reportExport.ts'
            ]
        }
    }
});
