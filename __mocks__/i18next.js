export default {
  addResourceBundle: jest.fn(),
  t: (key) => key,
  getFixedT: () => (key) => key,
};
