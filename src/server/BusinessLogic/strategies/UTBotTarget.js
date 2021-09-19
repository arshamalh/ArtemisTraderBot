import Strategy from "../lib/Strategy";

export default class UTBotTarget extends Strategy {
  constructor(symbol) {
    super(symbol);
  }

  getSuggestions(candles, side) {
    let FiboFactors = [1.1, 1.618, 2.618, 3.618, 4.236, 6.85, 11.09] // TODO: fibo 1.1 is just for test and is not true value.
    this.c_candles = candles;
    // this.c_close() < this.c_utbot(0) && this.c_close(1) > this.c_utbot(1)
    let targets = [];
    for (let i = 0; i < candles.length; i++) {
      let Hight = Math.abs(this.c_utbot(i) - this.c_close(i));
      if (this.c_utbot(i + 1) >= this.c_close(i + 1) && side === "BUY") {
        targets = FiboFactors.map((factor) => {
          let target = this.c_utbot(i) + Hight * factor
          if (target > this.c_close(0)) return Math.round(target * 100) / 100;
          // target has to be greater than the last candle closing price
        });

      } else if (this.c_utbot(i + 1) <= this.c_close(i + 1) && side === "SELL") {
        targets = FiboFactors.map((factor) => {
          let target = this.c_utbot(i) - Hight * factor
          if (target < this.c_close(0)) return Math.round(target * 100) / 100;
          // target has to be less than the last candle closing price
        })
      }
      targets = targets.filter(item => item !== null);
      if (targets.length !== 0) {
        break;
      }
    }
    return targets;
  }
}
