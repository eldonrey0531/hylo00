/**
 * Bundle Size Monitoring Configuration
 *
 * Constitutional requirement: Maintain <200KB bundle size
 * Ensures performance and efficient edge function deployment
 */

module.exports = {
  files: [
    {
      path: 'dist/assets/*.js',
      maxSize: '150KB', // Main JS bundle limit
      compression: 'gzip',
    },
    {
      path: 'dist/assets/*.css',
      maxSize: '30KB', // CSS bundle limit
      compression: 'gzip',
    },
    {
      path: 'dist/index.html',
      maxSize: '10KB', // HTML size limit
      compression: 'gzip',
    },
  ],
  ci: {
    trackBranches: ['main', 'develop'],
    repoBranch: 'main',
  },
  alertThreshold: 10, // Alert if bundle size increases by more than 10%
  analysisOptions: {
    showDetails: true,
    trackHistory: true,
  },
};
