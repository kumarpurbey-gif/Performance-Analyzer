import type { PerformanceMetrics } from '../types';

const TEST_TIMEOUT = 30000; // 30 seconds

// This script will be injected and run inside the iframe
const iframeScript = () => {
  window.addEventListener('message', (event) => {
    if (event.data.type !== 'run-performance-test') return;
    
    const { simulateExtension } = event.data;
    let lcp = 0;
    let fcp = 0;
    let cls = 0;
    let tbt = 0;

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        if (entry.entryType === 'largest-contentful-paint') {
          lcp = entry.startTime;
        }
        // FIX: Cast PerformanceEntry to any to access hadRecentInput property.
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      }
      // FIX: Use `entryTypes` instead of `type` for PerformanceObserver.
    }).observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'], buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
        fcp = entry.startTime;
      }
      // FIX: Use `entryTypes` instead of `type` for PerformanceObserver.
    }).observe({ entryTypes: ['paint'], buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        tbt += (entry as any).duration - 50;
      }
      // FIX: Use `entryTypes` instead of `type` for PerformanceObserver.
    }).observe({ entryTypes: ['longtask'], buffered: true });


    const simulateExtensionWorkload = () => {
      // Simulate heavy DOM manipulation
      for (let i = 0; i < 100; i++) {
        const el = document.createElement('div');
        el.className = 'simulated-extension-element';
        el.textContent = `Injected Element ${i}`;
        el.style.position = 'fixed';
        el.style.bottom = `${i*5}px`;
        el.style.right = '10px';
        el.style.padding = '2px';
        el.style.background = 'rgba(255,0,0,0.1)';
        el.style.border = '1px solid red';
        el.style.zIndex = '9999';
        document.body.appendChild(el);
      }
      // Simulate a long task
      const start = performance.now();
      while (performance.now() - start < 100) {
        // blocking script
      }
    };
    
    if (simulateExtension) {
        simulateExtensionWorkload();
    }
    
    // Use a timeout to ensure all observers have had a chance to run
    setTimeout(() => {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = timing.loadEventEnd - timing.startTime;
        const speedIndex = 0; // Calculating real speed index is complex and requires visual analysis

        const metrics: PerformanceMetrics = {
            fcp: Math.round(fcp),
            lcp: Math.round(lcp),
            cls: parseFloat(cls.toFixed(4)),
            tbt: Math.round(tbt > 0 ? tbt : 0),
            loadTime: Math.round(loadTime),
            speedIndex: speedIndex
        };

        window.parent.postMessage({ type: 'performance-results', metrics }, '*');
    }, 3000);

  });
};

// Inject the script into a blob URL and import it into the iframe.
// This is a workaround for some sites' CSP that might block inline scripts.
// The script itself will only run after receiving the 'run-performance-test' message.
const scriptUrl = URL.createObjectURL(new Blob([`(${iframeScript.toString()})()`], { type: 'application/javascript' }));
(window as any).iframeScriptUrl = scriptUrl;

export function runPerformanceTest(url: string, simulateExtension: boolean): Promise<PerformanceMetrics> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.position = 'absolute';
    iframe.style.opacity = '0';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Test timed out for URL: ${url}`));
    }, TEST_TIMEOUT);

    const messageHandler = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow || !event.data.type || event.data.type !== 'performance-results') {
        return;
      }
      cleanup();
      resolve(event.data.metrics);
    };

    const cleanup = () => {
        clearTimeout(timeoutId);
        window.removeEventListener('message', messageHandler);
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
    };

    window.addEventListener('message', messageHandler);

    let hasInjectedScript = false;

    iframe.onload = () => {
      // The onload event fires twice: once for 'about:blank', and once for the target URL.
      // We can't check location.href on the second load due to cross-origin restrictions.
      // So, we use a flag to track our state.
      if (!hasInjectedScript) {
        hasInjectedScript = true;
        // This is the first load (about:blank). Inject our test script and navigate to the real URL.
        const doc = iframe.contentDocument;
        if (doc && iframe.contentWindow) {
            const script = doc.createElement('script');
            script.src = (window as any).iframeScriptUrl;
            doc.head.appendChild(script);
            // Navigate to the target URL, which will trigger onload again.
            iframe.contentWindow.location.href = url;
        } else {
            cleanup();
            reject(new Error('Iframe is not ready for script injection.'));
        }
      } else {
        // This is the second load (target URL). The script is injected.
        // Send a message to the iframe to start the performance measurement.
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'run-performance-test', simulateExtension }, '*');
        } else {
            cleanup();
            reject(new Error('Iframe is not ready to start the test.'));
        }
      }
    };
    
    iframe.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load iframe for URL: ${url}`));
    };
    
    document.body.appendChild(iframe);
    // Setting src after listeners are attached is safer.
    iframe.src = 'about:blank';
  });
}
