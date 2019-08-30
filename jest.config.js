module.exports = {
  setupFilesAfterEnv: ["<rootDir>/__jest__/setup.ts"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "\\.spec\\.[jt]sx?$"
  ],
  collectCoverage: true,
  collectCoverageFrom: ["libs/*/src/**/*.{ts,tsx,js,jsx}"],
  coverageThreshold: {
    global: {
      statements: 85.24,
      branches: 71.78,
      functions: 80.79,
      lines: 85.57
    }
  },
  coverageDirectory: "<rootDir>/.coverage",
  coverageReporters: ["lcov", "text-summary"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/template/"],
  moduleNameMapper: {
    "\\.module\\.css$": "identity-obj-proxy",
    "\\.css$": "<rootDir>/__mocks__/styleMock.js"
  },
  // Ref https://github.com/facebook/jest/issues/2070#issuecomment-431706685
  // Todo(steve): remove next line when issue fixed.
  modulePathIgnorePatterns: ["<rootDir>/libs/[^/]*/src/.*/__mocks__"],
  // Use jsdom@14 which supports MutationObserver
  testEnvironment: "jest-environment-jsdom-fourteen",
  timers: "fake"
};
