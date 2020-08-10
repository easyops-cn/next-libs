const fs = require("fs");
const antdIcons = require("@ant-design/icons/lib/icons");

const antdIconKeys = Object.keys(antdIcons);

fs.writeFileSync(
  __dirname + "/../src/utils/antdIcons.ts",
  `export const antdIconKeys: string[] = ${JSON.stringify(antdIconKeys)};`
);
