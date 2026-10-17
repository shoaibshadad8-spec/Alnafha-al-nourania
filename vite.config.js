import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' => يشتغل على GitHub Pages داخل مسار فرعي (user.github.io/repo/)
export default defineConfig({ base: './', plugins: [react()] });
