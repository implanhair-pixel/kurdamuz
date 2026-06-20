const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    'src/lib/srs/__tests__/integration.test.ts',
    'src/lib/__tests__/stories-api.test.ts',
    'src/lib/community/validation.test.ts',
    'tests/',
  ],
  setupFiles: ['<rootDir>/jest.setup.js']
};

module.exports = createJestConfig(customJestConfig);
