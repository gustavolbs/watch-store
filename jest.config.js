module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
  },
  testPathIgnorePatterns: ['/cypress/'],
  moduleFileExtensions: ['js', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
  },
  collectCoverage: false,
  collectCoverageFrom: [
    '<rootDir>/components/**/*.{vue,js}',
    '<rootDir>/layouts/**/*.{vue,js}',
    '<rootDir>/managers/**/*.{vue,js}',
    '<rootDir>/pages/**/*.{vue,js}',
    '!<rootDir>/node_modules',
  ],
  testEnvironment: 'jsdom',
};
