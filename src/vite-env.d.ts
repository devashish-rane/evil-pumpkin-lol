/// <reference types="vite/client" />

// Vite provides ?raw imports, but we declare this to keep TypeScript strictness happy.
declare module '*?raw' {
  const content: string;
  export default content;
}
