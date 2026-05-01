// =========================================================
// Declaraciones globales para TypeScript
// Permite importar archivos de imagen y otros assets
// =========================================================

declare module '*.png' {
    const value: string;
    export default value;
  }
  
  declare module '*.jpg' {
    const value: string;
    export default value;
  }
  
  declare module '*.jpeg' {
    const value: string;
    export default value;
  }
  
  declare module '*.svg' {
    const value: string;
    export default value;
  }
  
  declare module '*.webp' {
    const value: string;
    export default value;
  }