// Performance monitoring stub
export const performanceMonitoring = {
  measureExecutionTime: (fn) => {
    const start = performance.now();
    const result = fn();
    return { result, executionTime: performance.now() - start };
  },
};
