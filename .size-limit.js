const { sizeLimit } = require("@next-core/build-config-factory");

module.exports = sizeLimit({
  libs: {
    "*": "20 KB",
    "cmdb-instances": "120 KB",
    "storyboard-visualization": "40 KB",
  },
});
