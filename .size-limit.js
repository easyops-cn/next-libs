const { sizeLimit } = require("@next-core/build-config-factory");

module.exports = sizeLimit({
  libs: {
    "*": "10 KB",
    "basic-components": "30 KB",
    charts: "20 KB",
    "cmdb-instances": "73 KB",
    crontab: "25 KB",
    "permission-utils": "15 KB",
    "storyboard-visualization": "100 KB",
  },
});
