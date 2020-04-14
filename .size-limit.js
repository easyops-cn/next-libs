const { sizeLimit } = require("@easyops/build-config-factory");

module.exports = sizeLimit({
  libs: {
    "*": "10 KB",
    "basic-components": "30 KB",
    charts: "20 KB",
    "cmdb-instances": "65 KB",
    crontab: "25 KB",
    "permission-utils": "15 KB",
    "storyboard-visualization": "95 KB",
  },
});
