import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Framework initialization logic
    console.log('Framework ready');
    
    // Call the global frameworkReady function if it exists
    window.frameworkReady?.();
  }, []);
}