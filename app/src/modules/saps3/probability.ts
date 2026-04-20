import { Saps3Region } from "./types";

export function calculateProbability(score: number, region: Saps3Region): { logit: number; probability: number } {
  let logit = 0;

  switch (region) {
    case "GLOBAL":
      // logit = -32.6659 + ln(score + 20.5958) * 7.3068
      logit = -32.6659 + Math.log(score + 20.5958) * 7.3068;
      break;
    case "CENTRAL_SOUTH_AMERICA":
      // logit = -64.5990 + ln(score + 71.0599) * 13.2322
      logit = -64.5990 + Math.log(score + 71.0599) * 13.2322;
      break;
    case "AUSTRALASIA":
      // logit = -22.5717 + ln(score + 1) * 5.3163
      logit = -22.5717 + Math.log(score + 1) * 5.3163;
      break;
    case "CENTRAL_WESTERN_EUROPE":
      // logit = -36.0877 + ln(score + 22.2655) * 7.9867
      logit = -36.0877 + Math.log(score + 22.2655) * 7.9867;
      break;
    case "EASTERN_EUROPE":
      // logit = -60.1771 + ln(score + 51.4043) * 12.6847
      logit = -60.1771 + Math.log(score + 51.4043) * 12.6847;
      break;
    case "NORTH_EUROPE":
      // logit = -26.9065 + ln(score + 5.5077) * 6.2746
      logit = -26.9065 + Math.log(score + 5.5077) * 6.2746;
      break;
    case "SOUTHERN_EUROPE":
      // logit = -23.8501 + ln(score + 5.5708) * 5.5709
      logit = -23.8501 + Math.log(score + 5.5708) * 5.5709;
      break;
    case "NORTH_AMERICA":
      // logit = -18.8839 + ln(score + 1) * 4.3979
      logit = -18.8839 + Math.log(score + 1) * 4.3979;
      break;
    default:
      // Default to Global if unknown
      logit = -32.6659 + Math.log(score + 20.5958) * 7.3068;
  }

  const probability = Math.exp(logit) / (1 + Math.exp(logit));
  return { logit, probability };
}
