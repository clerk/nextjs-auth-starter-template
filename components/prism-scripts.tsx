"use client";

import { useEffect } from 'react';

export function PrismScripts() {
  useEffect(() => {
    // Load Prism scripts dynamically
    const loadPrismScripts = async () => {
      // Create and load the first script
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js';
      script1.async = true;
      document.body.appendChild(script1);

      // Wait for the first script to load before loading the second
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js';
        script2.async = true;
        document.body.appendChild(script2);
      };
    };

    loadPrismScripts();

    // Cleanup function to remove scripts when component unmounts
    return () => {
      const scripts = document.querySelectorAll('script[src*="prismjs"]');
      scripts.forEach(script => script.remove());
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return null; // This component doesn't render anything
}
