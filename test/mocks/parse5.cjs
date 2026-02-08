// Minimal parse5 mock for tests to avoid ESM/CJS interop
module.exports = {
  parse: function () {
    // return a minimal Document structure expected by jsdom when present
    return {};
  },
  parseFragment: function () {
    return {};
  },
  serialize: function () {
    return '';
  },
  serializeOuter: function () {
    return '';
  },
};
