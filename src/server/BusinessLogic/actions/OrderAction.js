import Strategy, {Signal} from "../lib/Strategy";
import Order from "../lib/Order";

export default class OrderAction {
  static makeOrder(side, symbol, amount, leverage, stopLoss) {
    return new Promise((resolve, reject) => {
      let s = new Strategy(symbol, chart.candles);
      let stop;
      if (stopLoss){
        stop = stopLoss
      }
      else {
        stop = s.c_utbot();
      }
      // let stop; // if stop enterd, use that number, if not, use utbot;
      // console.log("USTBOT is : ", utbot)
      if (side === Signal.Buy) {
        if (s.c_close() > stop) {
          Order.newOrder(side, symbol, amount, null, leverage, stop).then(res => {
            console.log(res)
            if (res.orderId) {
              resolve({
                code: 200,
                msg: "order successfully created."
              })
            } else {
              resolve({
                  code: -1102,
                  msg: "A mandatory parameter was not sent, was empty/null, or malformed, maybe you don't have enough amount."
                }
              )
            }
          });
        } else {
          resolve({
            code: 400,
            msg: "for BUY position, price must be greater than utbot rate."
          });
        }
      } else if (side === Signal.Sell) {
        if (s.c_close() < stop) {
          Order.newOrder(side, symbol, amount, null, leverage, stop).then(res => {
            if (res.orderId) {
              console.log(res)
              resolve({
                code: 200,
                msg: "order successfully created."
              })
            } else {
              resolve({
                code: -1102,
                msg: "A mandatory parameter was not sent, was empty/null, or malformed, maybe you don't have enough amount."
              })
            }

          })
        } else {
          resolve({
            code: 400,
            msg: "for SELL position, price must be less than utbot rate."
          });
        }
      }
    })
  }

  static closeOrder(symbol, closeAmount = null) {
    return new Promise((resolve, reject)=> {
      Order.closeOrder(symbol, closeAmount).then((res) => {
        if (res) {
          resolve({
            code: 200,
            msg: "order closed"
          })
        }
        else {
          resolve({
            code: 400,
            msg: "opperation failed"
          })
        }
      });
    })

  }
}
