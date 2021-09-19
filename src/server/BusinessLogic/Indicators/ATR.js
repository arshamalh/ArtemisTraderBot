import {ATR} from "technicalindicators";
import {TrueRange as TR} from "technicalindicators";
import {SMA} from "technicalindicators";

export default class ATRindicator {
  constructor(src, len, smoothing = '') {
    this.name = "atr";
    this.period = len;
    this.smoothing = smoothing.toLowerCase();

  }

  exec(candles) {
    if (this.smoothing === '') return this.no_smoothing(candles);
    let tr_list = this.tr_calculator(candles);
    if (!tr_list) return false;
    if (this.smoothing === 'sma') {
      let result = this.sma_smoother(tr_list);
      return result[result.length - 1];
    } else if (this.smoothing === 'rma') {
      return this.rma_smoother(candles, tr_list);
    } else if (this.smoothing === 'ema') {
      return this.ema_smoother(tr_list);
    } else if (this.smoothing === 'wma') {
      return this.wma_smoother(tr_list);
    }
    return false;
  }

  getParams() {
    return {
      len: this.period,
      smoothing: this.smoothing
    }
  }

  no_smoothing(candles) {
    if (candles.length <= this.period) return false;
    let atr_feed = {
      high: [],
      low: [],
      close: [],
      period: this.period,
    };
    for (let i = candles.length - this.period - 1; i < candles.length; i++) {
      atr_feed.close.push(candles[i].close);
      atr_feed.high.push(candles[i].high);
      atr_feed.low.push(candles[i].low);
    }

    return ATR.calculate(atr_feed)[0];
  }

  tr_calculator(candles) {
    if (candles.length <= this.period) return false; // 2 is because of tr can be calculated just by two candles. (1 returns false)
    let tr_feed = {
      high: [],
      low: [],
      close: [],
    };

    for (let i = candles.length - this.period - 1; i < candles.length; i++) {
      tr_feed.close.push(candles[i].close);
      tr_feed.high.push(candles[i].high);
      tr_feed.low.push(candles[i].low);
    }

    return TR.calculate(tr_feed);
  }

  sma_smoother(tr_list) { // tr list len is 1 unit smaller than first candles.len
    let sma_feed = [];
    for (let i = tr_list.length - this.period; i < tr_list.length; i++) {
      sma_feed.push(tr_list[i]);
    }
    return SMA.calculate({period: this.period, values: sma_feed});
  }

  rma_smoother(candles, tr_list) {
    // if (candles.length <= this.period + 1) return false;
    let alpha = 1 / this.period;
    let rmaValue;
    let last_rma = candles[candles.length - 2].indValues[this.name];

    if (!last_rma) { // !last_rma returns true for each undefined, it says: "Yes, you are right, it is undefined";
      rmaValue = this.sma_smoother(tr_list)[0]
      // console.log("rmaValue is: ", rmaValue, " SMA Values: ", this.sma_smoother(tr_list), tr_list, candles[candles.length - 1].open, candles[candles.length - 1].close)
    } else {
      // console.log("tr value used: ", tr_list[tr_list.length - 1]); // last candle is the right last candle and don't need any change.
      rmaValue = alpha * tr_list[tr_list.length - 1] + (1 - alpha) * last_rma;
    }
    // console.log("RMA: ", rmaValue, new Date(candles[candles.length - 1].time), "Last RMA: ", last_rma, "\n")
    return rmaValue;
  }

  ema_smoother(tr_list) {

  }

  wma_smoother(candles) {

  }

  get_name() {
    return this.name;
  }
}
