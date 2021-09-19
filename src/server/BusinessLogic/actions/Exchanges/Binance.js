import binance from "../../../Configurations/binance";

export default class BinanceAction {
    constructor() {
    }

    static assetRate(asset, socket, tagName) {
        binance.futuresMiniTickerStream(asset, (miniTicker) => {
            socket.emit(tagName, miniTicker["close"]);
          });
    }

    static accountBalance(socket, tagName) { // change this to use websocket.
      binance
      .futuresBalance()
      .then((accountBalance) => {
        socket.emit(tagName, accountBalance[0]["availableBalance"]);
      })
      .catch((e) => {
        console.log(e);
      });
      
      binance.websockets.userFutureData(null, (res) => {
        socket.emit(tagName, res.updateData.balances[0]['crossWalletBalance']);
        // console.log("Positions: ", res.updateData.positions);
      });
    }

    static async getOrders(socket, tagName, pair="", limit=0) { // sort=[asen, dsen], limit=number
      let orderHistory = await binance.futuresUserTrades(pair);
      let result;
      if (limit) result = orderHistory.slice(orderHistory.length - limit, orderHistory.length).reverse();
      else result = orderHistory;
      socket.emit(tagName, result);
      // JSON { orderId, symbole, side, profit, amount, state, openPrice, closePrice }
    }

    static async openedOrders(socket, tagName) { // change this to use and fill last order.
      let trades = await binance.futuresPositionRisk();
      let result = trades.filter((trade) => (Number(trade.positionAmt) !== 0))
      socket.emit(tagName, result);
    }


    
}