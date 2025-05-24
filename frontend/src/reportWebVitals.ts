import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onINP(onPerfEntry);  // This replaced onFID
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;