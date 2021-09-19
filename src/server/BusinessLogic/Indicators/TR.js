import { TrueRange as TR } from "technicalindicators";

export default class TRindicator {
  constructor() {
    this.name = "tr";
  }

  exec(candles) {
    if (candles.length <= 2) return false; // 2 is because of tr can be calculated just by two candles
    let tr_feed = {
      high: [],
      low: [],
      close: [],
    };
    for (let i = candles.length - 2; i < candles.length; i++) {
      tr_feed.close.push(candles[i].close);
      tr_feed.high.push(candles[i].high);
      tr_feed.low.push(candles[i].low);
    }

    return TR.calculate(tr_feed)[0];
  }

  get_name() {
    return this.name;
  }
}
