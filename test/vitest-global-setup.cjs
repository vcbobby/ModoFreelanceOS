// Global setup to patch parse5 before jsdom initializes.
module.exports = () => {
  const Module = require('module');
  const originalLoad = Module._load;

  Module._load = function (request, parent, isMain) {
    const loaded = originalLoad.apply(this, arguments);
    if (typeof request === 'string' && request.indexOf('parse5') !== -1) {
      if (loaded && typeof loaded.serializeOuter !== 'function') {
        loaded.serializeOuter = () => '';
      }
      if (loaded && typeof loaded.serialize !== 'function') {
        loaded.serialize = () => '';
      }
      if (loaded && typeof loaded.parse !== 'function') {
        loaded.parse = () => ({});
      }
      if (loaded && typeof loaded.parseFragment !== 'function') {
        loaded.parseFragment = () => ({});
      }
    }
    return loaded;
  };
};
