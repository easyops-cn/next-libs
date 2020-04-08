import { rollupFactory } from "@easyops/rollup-config-factory";
import svgr from "@svgr/rollup";

export default rollupFactory({
  umdName: "StoryboardVisualization",
  plugins: [
    svgr({
      svgoConfig: {
        plugins: [
          {
            // Keep `viewbox`
            removeViewBox: false
          }
        ]
      }
    })
  ]
});
