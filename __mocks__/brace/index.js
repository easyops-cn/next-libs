export default {
  acequire: jest.fn().mockImplementation(() => ({
    JavaScriptHighlightRules: jest.fn().mockImplementation(() => ({})),
    YamlHighlightRules: jest.fn().mockImplementation(() => ({})),
    Mode: jest.fn().mockImplementation(() => ({})),
    JsonHighlightRules: jest.fn().mockImplementation(() => ({})),
    TextHighlightRules: jest.fn().mockImplementation(() => ({})),
  })),
};
