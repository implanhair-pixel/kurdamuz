/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^framer-motion$': '<rootDir>/src/lib/shims/framer-motion.tsx',
    '^canvas-confetti$': '<rootDir>/src/lib/shims/canvas-confetti.ts',
    '^zustand$': '<rootDir>/src/lib/shims/zustand.ts',
    '^zustand/middleware$': '<rootDir>/src/lib/shims/zustand-middleware.ts',
    '^zustand/middleware$': '<rootDir>/src/lib/shims/zustand-middleware.ts'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    'src/lib/srs/__tests__/integration.test.ts',
    'src/lib/__tests__/stories-api.test.ts',
    'src/lib/community/validation.test.ts',
  ],
};

module.exports = config;
    '/src/lib/srs/__tests__/integration.test.ts',
    '/src/lib/__tests__/stories-api.test.ts',
    '/src/lib/community/validation.test.ts'
  ],
  setupFiles: ['<rootDir>/jest.setup.js']
};

module.exports = createJestConfig(customJestConfig);
