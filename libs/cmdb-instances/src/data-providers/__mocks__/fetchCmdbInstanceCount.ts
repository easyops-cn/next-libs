export const fetchCmdbInstanceCount = jest.fn(() =>
  Promise.resolve({
    code: 0,
    error: "",
    message: "",
    data: 55,
  })
);
