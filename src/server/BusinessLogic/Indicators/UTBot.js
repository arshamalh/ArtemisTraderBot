export default class UTBot {
  constructor(source = "close", options, key = null) {
    if (key)
      this.name = "utbot_" + key;
    else
      this.name = "utbot";

    this.period = options.atrlen;
    this.src = source.toLowerCase();
    this.xATRTrailingStopPrev = 0;
    // this.prevPos = 0;
    this.sensitivity = options.sensitivity;
  }

  getParams() {
    return {
      atrlen: this.period,
      sensitivity: this.sensitivity
    }
  }

  exec(data) {
    if (data.length <= this.period + 1) return false;
    let atr = data[data.length - 1].indValues.atr;
    if (data.length > 1)
      this.xATRTrailingStopPrev = data[data.length - 2].indValues[this.name];
    else this.xATRTrailingStopPrev = 0;
    let src = [data[data.length - 1][this.src], data[data.length - 2][this.src]];
    let nLoss = this.sensitivity * atr;
    let xATRTrailingStop;
    if (src[0] > this.xATRTrailingStopPrev && src[1] > this.xATRTrailingStopPrev) {
      xATRTrailingStop = Math.max(this.xATRTrailingStopPrev, src[0] - nLoss);
    } else {
      if (src[0] < this.xATRTrailingStopPrev && src[1] < this.xATRTrailingStopPrev) {
        xATRTrailingStop = Math.min(this.xATRTrailingStopPrev, src[0] + nLoss);
      } else {
        if (src[0] > this.xATRTrailingStopPrev) {
          xATRTrailingStop = src[0] - nLoss;
        } else {
          xATRTrailingStop = src[0] + nLoss;
        }
      }
    }
    // console.log("UT Bot is: ", xATRTrailingStop);
    return xATRTrailingStop;
  }

  get_name() {
    return this.name;
  }
}
