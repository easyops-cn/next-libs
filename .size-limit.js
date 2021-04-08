const { sizeLimit } = require("@next-core/build-config-factory");

module.exports = sizeLimit({
  libs: {
    "*": "10 KB",
    forms: "12 KB",
    "basic-components": "30 KB",
    charts: "20 KB",
    "cmdb-instances": "76 KB",
    crontab: "25 KB",
    "permission-utils": "18 KB",
    "storyboard-visualization": "45 KB",
    "editor-components": "330 KB",
  },
});
