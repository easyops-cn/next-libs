const { sizeLimit } = require("@next-core/build-config-factory");

module.exports = sizeLimit({
  libs: {
    "*": "20 KB",
    "cmdb-instances": "80 KB",
    "storyboard-visualization": "40 KB",
  },
});
