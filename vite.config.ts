import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite is configured to allow raw imports from the /content directory.
// This keeps the plaintext curriculum editable without touching code.
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow Vite dev server to read /content alongside /src.
      allow: ['.'],
    },
  },
});
