module.exports = {
  setupFilesAfterEnv: ["<rootDir>/__jest__/setup.ts"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "\\.spec\\.[jt]sx?$",
    "/__jest__/",
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 85.55,
      branches: 75.29,
      functions: 81.46,
      lines: 85.77,
    },
  },
  coverageDirectory: "<rootDir>/.coverage",
  coverageReporters: ["lcov", "text-summary"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "\\.module\\.css$": "identity-obj-proxy",
    "\\.css$": "<rootDir>/__mocks__/styleMock.js",
    "\\.svg": "<rootDir>/__mocks__/svgrMock.js",
  },
  // Ref https://github.com/facebook/jest/issues/2070#issuecomment-431706685
  // Todo(steve): remove next line when issue fixed.
  modulePathIgnorePatterns: ["<rootDir>/.*/__mocks__"],
  // Use jsdom@14 which supports MutationObserver
  timers: "fake",
};
