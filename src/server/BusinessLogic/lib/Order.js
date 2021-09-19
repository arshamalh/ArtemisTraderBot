import { Promise } from "core-js";
import binance from "../../Configurations/binance";
import Chart from "./Chart";
import { Signal } from "./Strategy";

export default class Order {
    constructor() {

    }

    init(exchange) {
        // return void;
    }

    static async newOrder(_side, symbol, amount, new_margin_type = null, new_leverage_value = 0, stop = null) {
            if (lastOrder) {
                return {
                    code: 400,
                    msg: "you already have an order."

                }
            }
            let side = _side.toLowerCase()
            if (new_margin_type)
                await this.adjustMargin(symbol, new_margin_type);
            if (new_leverage_value)
                await this.adjustLeverage(symbol, new_leverage_value);
            let result;
            if (side === Signal.Buy || side === Signal.Long)
                result = await binance.futuresMarketBuy(symbol, amount);
            else if (side === Signal.Sell || side === Signal.Short)
                result = await binance.futuresMarketSell(symbol, amount);

            lastOrder = {
                side,
                symbol,
                amount,
                stop,
                price: chart.candles[chart.get_index(0)].close
            }
            SOCKET.emit("LastOrder", lastOrder);
            
            return new Promise((resolve, reject) => {
                resolve(result);
            })
        // JSON { code, msg, orderId }
    
    }

    static closeOrder(symbol, closeAmount = null) {
        if (lastOrder) {
            if (!closeAmount){
                lastOrder = null;
            }
            else {
                // delete that target from stopTargets and check for remained amount to make last order null or not.
                /*
                last order = {
                    price: ...
                    stop: ...
                    stopTargets = [
                        {
                            price: ...,
                            amount: ...,
                        },{
                            price: ...,
                            amount: ...,
                        }
                    ]
                }
                */
            }
            return new Promise(async (resolve, reject) => {
              let openPositions = await binance.futuresPositionRisk();
              let totalAmount;
              openPositions.forEach(item => {
                  if (item.symbol === symbol) {
                      totalAmount = Number(item.positionAmt)
                  }
              })
              let result;
              let amount = closeAmount ? closeAmount : totalAmount;
              let side = amount > 0 ? Signal.Buy : Signal.Sell;
              console.log(side, amount);
              if (side === Signal.Buy || side === Signal.Long) {
                result = await binance.futuresMarketSell(symbol, amount);
              }
              else if (side === Signal.Sell || side === Signal.Short) {
                result = await binance.futuresMarketBuy(symbol, amount * -1);
              }
              
              if (!result) console.log("Order Closed")
              resolve(true);
              // JSON { code, msg }
            })
        }
        else {
            return new Promise(async (resolve, reject) => {
                resolve(false);
            });
        }
    }

    getOrder(symbol, orderId) {
        return binance.futuresOrderStatus(symbol, {orderId});
        // JSON { symbole, side, profit, amount, state, openPrice, closePrice }
    }

    static adjustMargin(pair, type) { // type can be: (ISOLATED, CROSSED)
        return binance.futuresMarginType(pair, type); // return a promise
        // JSON { code, msg }
    }

    static adjustLeverage(pair, newLeverage) {  // newLeverage can be between 1-125
        return binance.futuresLeverage(pair, newLeverage) // return a promise
    }
}

// const action = new OrderAction();
// action.adjustMargin('ETHUSDT', 'ISOLATED')
// action.newOrder("buy", "ETHUSDT", 0.003, 0);
// action.closeOrder("ETHUSDT", 0.002)

/*  balance
(async() => {
    console.info( await binance.futuresBalance())
})()

*/
