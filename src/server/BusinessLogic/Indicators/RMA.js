import {SMA} from "technicalindicators";

export default class RMAindicator {
    constructor(src, len) {
        this.src = src.toLowerCase();
        this.name = "rma";
        this.period = len;
    }

    exec(candles) {
        if (candles.length <= this.period) return false;
        let alpha = 1 / this.period;
        let rmaValue;
        let last_rma = candles[candles.length - 3].indValues[this.name];

        
        if (!last_rma) { // !last_rma returns true for each undefined, it says: "Yes, you are right, it is undefined";
            rmaValue = this.sma(candles)
        } else {
            rmaValue = alpha * candles[candles.length - 2][this.src] + (1 - alpha) * last_rma;
        }
        return rmaValue;
    }


    /*
      pine_rma(src, length) =>
      alpha = 1/length
      sum = 0.0
      sum := na(sum[1]) ? sma(src, length) : alpha * src + (1 - alpha) * nz(sum[1])
    */

    sma(candles) {
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
