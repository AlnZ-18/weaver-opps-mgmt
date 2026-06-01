module.exports = {
  // Use Node.js environment for testing backend APIs
  testEnvironment: 'node',

  // Setup files to execute before running any test files
  setupFilesAfterEnv: ['./tests/setup.js'],

  // Enable test coverage gathering
  collectCoverage: true,

  // Folders to target or ignore for coverage metrics
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!config/**/*.js',
    '!tests/**/*.js',
  ],

  // Root test directory name
  coverageDirectory: 'coverage',

  // Timeouts for async tests (e.g. database transactions)
  testTimeout: 30000,
};
