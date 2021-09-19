import binance from "../../Configurations/binance";
import OrderAction from "../actions/OrderAction";

export default class BinanceAPI {
  constructor() {
    this.isBusy = true;
  }

  makeHistory(chart, cb) {
    return new Promise(resolve => {
      let out = [];
      binance
        .futuresCandles(chart.get_symbole(), chart.get_timeframe(), {limit: 1500, startDate: 1606694400, endDate: 1606694400 + 10 * 24 * 60 * 60 * 1000})
        .then((tick) => {

          for (let i = tick.length - 1500; i < tick.length - 1; i++) {
            let [time, open, high, low, close, volume] = tick[i];
            let candle = chart.onTick({
              open: Number(open),
              high: Number(high),
              low: Number(low),
              close: Number(close),
              volume: Number(volume),
              isFinal: true,
              time,
              indValues: {},
            });
            out.push(candle);
            cb(out);
          }
          resolve(out);
        });
    });
  }

  terminateTicker() {
    try {
      binance.futuresTerminate(chart.get_symbole().toLowerCase() + "@kline_" + chart.get_timeframe());
    } catch (e) {
      console.log(e)
    }
  }

  makeTicker(chart, cb = null) {
    binance.futuresSubscribe(
      chart.get_symbole().toLowerCase() + "@kline_" + chart.get_timeframe(),
      (candlesticks) => {
        let {E: eventTime, k: ticks} = candlesticks;
        let {
          o: open,
          h: high,
          l: low,
          c: close,
          v: volume,
          x: isFinal,
        } = ticks;

        chart.onTick({
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
          volume: Number(volume),
          time: eventTime,
          isFinal,
          indValues: {},
          // indValues is a object held key-value pairs of indicator name and indicator value for each candle
        });
        if (cb)
          cb(chart.candles);
        if (targetCond) {
          if (targetCond.side === "BUY" && close >= targetCond.price) {
            targetCond = null;
            OrderAction.closeOrder(chart.get_symbole()).then((res) => {
              console.log("TouchedTarget: ", res)
              SOCKET.emit("TouchedTarget", res)
            });
          }
          else if (targetCond.side === "SELL" && close <= targetCond.price) {
            targetCond = null;
            OrderAction.closeOrder(chart.get_symbole()).then((res) => {
              console.log("TouchedTarget: ", res)
              SOCKET.emit("TouchedTarget", res)
            })
          }
        }
        if(lastOrder){
          if(lastOrder['stopTarget']) {
            if(lastOrder.side.toLowerCase() === "buy" && lastOrder.stopTarget > close) { /// price goes up and when is less than stop target, we close the position
              OrderAction.closeOrder(chart.get_symbole()).then((res) => {
                console.log("TouchedTarget: ", res)
                SOCKET.emit("TouchedTarget", res)
              })
            }
            if(lastOrder.side.toLowerCase() === "sell" && lastOrder.stopTarget <= close) { /// price goes down and when is greater than stop target, we close the position
              OrderAction.closeOrder(chart.get_symbole()).then((res) => {
                console.log("TouchedTarget: ", res)
                SOCKET.emit("TouchedTarget", res)
              })
            }
          }
        }
      })
  }
}



/*****
if (lastOrder) {
          if (lastOrder['stopTargets'].length > 0) {
            let targets = lastOrder['stopTargets'];
            for (let i = 0; i < targets.length; i++) {
              // lastOrder['stopTargets'].forEach((stopTarget, idx) => {
              if (lastOrder.side.toLowerCase() === "buy" && targets[i].price > close) { /// price goes up and when is less than stop target, we close the position
                let res = await OrderAction.closeOrder(chart.get_symbole(), targets[i].amount);
                lastOrder = lastOrder['stopTargets'].splice(i, 1);
                console.log("TouchedTarget: ", res);
                SOCKET.emit("TouchedTarget", res);
                break;
              } else if (lastOrder.side.toLowerCase() === "sell" && targets[i].price <= close) { /// price goes down and when is greater than stop target, we close the position
                let res = await OrderAction.closeOrder(chart.get_symbole());
                lastOrder = lastOrder['stopTargets'].splice(i, 1);
                console.log("TouchedTarget: ", res);
                SOCKET.emit("TouchedTarget", res);
                break;


 */