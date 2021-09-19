import { SMA } from "technicalindicators";

export default class SMAindicator {
  constructor(src, len) {
    this.src = src.toLowerCase();
    this.name = "sma";
    this.period = len;
  }

  exec(candles) {
    if (candles.length <= this.period) return false;
    let sma_feed = [];
    for (let i = candles.length - this.period - 1; i < candles.length; i++) {
      sma_feed.push(candles[i][this.src]);
    }

    return SMA.calculate({ period: this.period, values: sma_feed })[0];
  }

  get_name() {
    return this.name;
  }
}
