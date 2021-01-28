import { rollupFactory } from "@next-core/rollup-config-factory";
import svgr from "@svgr/rollup";

export default rollupFactory({
  umdName: "Charts",
  plugins: [
    svgr({
      svgoConfig: {
        plugins: [
          {
            // Keep `viewbox`
            removeViewBox: false,
          },
        ],
      },
    }),
  ],
});
