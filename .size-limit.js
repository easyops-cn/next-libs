const { sizeLimit } = require("@next-core/build-config-factory");

module.exports = sizeLimit({
  libs: {
    "*": "10 KB",
    forms: "12 KB",
    "basic-components": "31 KB",
    charts: "20 KB",
    "cmdb-instances": "480 KB",
    crontab: "25 KB",
    "permission-utils": "18 KB",
    "storyboard-visualization": "45 KB",
    "code-display-components": "30 KB",
    "code-editor-components": "365 KB",
    svga: "50 KB",
  },
});
