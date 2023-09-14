const { sizeLimit } = require("@next-core/build-config-factory");

module.exports = sizeLimit({
  libs: {
    "*": "20 KB",
    "cmdb-instances": "97.5 KB",
    "storyboard-visualization": "40 KB",
  },
});
