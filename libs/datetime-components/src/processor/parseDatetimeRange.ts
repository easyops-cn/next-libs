import moment from "moment";

export const parseDatetimeRange = (
  range: "now-1h" | "now-1d" | "now/d" | "now-7d" | "now-30d"
) => {
  let from: any = "";
  let to: any = "";
  switch (range) {
    case "now-1h":
      from = +moment() - 3600000;
      to = +moment();
      break;
    case "now-1d":
      from = +moment() - 86400000;
      to = +moment();
      break;
    case "now/d":
      from = +moment(0, "HH");
      to = +moment();
      break;
    case "now-7d":
      from = +moment() - 604800000;
      to = +moment();
      break;
    case "now-30d":
      from = +moment() - 2592000000;
      to = +moment();
      break;
    default:
      break;
  }
  return { from, to };
};
