const { sizeLimit } = require("@next-core/build-config-factory");

module.exports = sizeLimit({
  libs: {
    "*": "10 KB",
    forms: "12 KB",
    "basic-components": "31 KB",
    charts: "20 KB",
    "cmdb-instances": "465 KB",
    crontab: "25 KB",
    "permission-utils": "18 KB",
    "storyboard-visualization": "45 KB",
    "editor-components": "411 KB",
    svga: "50 KB",
  },
});
