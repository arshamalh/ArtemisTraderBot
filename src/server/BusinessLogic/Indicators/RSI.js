import { RSI } from "technicalindicators";

export default class ATR {
  static name = "ATR";
  constructor(src, len) {
    this.src = src;
    this.len = len;
  }

  onTick(candles) {}

  calculation() {}
}

var inputRSI = {
  values: [
    127.75,
    129.02,
    132.75,
    145.4,
    148.98,
    137.52,
    147.38,
    139.05,
    137.23,
    149.3,
    162.45,
    178.95,
    200.35,
    221.9,
    243.23,
    243.52,
    286.42,
    280.27,
    277.35,
    269.02,
    263.23,
    214.9,
  ],
  period: 14,
};
var expectedResult = [86.41, 86.43, 89.65, 86.5, 84.96, 80.54, 77.56, 58.06];

RSI.calculate(inputRSI);
