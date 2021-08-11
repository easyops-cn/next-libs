const { jestConfigFactory } = require("@next-core/jest-config-factory");

module.exports = {
  ...jestConfigFactory(),
  coverageThreshold: {
    global: {
      statements: 85.55,
      branches: 75.29,
      functions: 81.46,
      lines: 85.77,
    },
  },
};
