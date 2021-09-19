import BinanceAction from "../actions/Exchanges/Binance";
import OrderAction from "../actions/OrderAction";
import Chart from "./Chart";
import s1 from "../strategies/s1";
import Target from "../strategies/UTBotTarget";
import ATR from "../Indicators/ATR";
import UTBot from "../Indicators/UTBot";

export default class SocketConnection {
  init(socket) { // init will be called after each connection.
    this.socket = socket;
    SOCKET.sendBasicData();
    BinanceAction.assetRate("BTCUSDT", socket, "AssetPrice");
    BinanceAction.accountBalance(socket, "AccountBalance");
    BinanceAction.getOrders(socket, "getOrders", "BTCUSDT", 20)
    BinanceAction.openedOrders(socket, "openedOrders");

    // TODO: Need a little change, pair and limit will arrive with a socket request not hard-code
    socket.on("open_order", (data) => {
      /*let data = {
          side: "buy|sell",
          amount: 0.1,
          "symbol": "BTCUSDT",
          leverage: 10,
          margin_type: "cross|isolated",
          timeframe: 1
      }*/
      OrderAction.makeOrder(data.side, data.symbol, data.amount, data.leverage).then((res) => {
        socket.emit("order_opened", res);
      })

    });

    socket.on("close_order", (data) => {
      /*let data = {
          "symbol": "BTCUSDT"
      }*/
      OrderAction.closeOrder(data).then(res => {
        console.log("Response is: ", res)
        socket.emit("order_closed", res);
      })
    });

    socket.on("newIndSet", (data) => {
      binanceEntry.terminateTicker();
      global.chart = new Chart("BTCUSDT", data.timeframe);
      chart.setIndicator(new ATR("close", data.atrlen, "rma")); /// TODO: use data.smoothing instead of Hard-Code.
      chart.setIndicator(new UTBot('close', { atrlen: data.atrlen, sensitivity: data.sensitivity }));
      let strategy = new s1("BTCUSDT");

      binanceEntry.makeHistory(chart, (data) => {
        strategy.onTick(data, false);
      }).then(() => {
        SOCKET.sendBasicData();
        let firstOne = true;
        binanceEntry.makeTicker(chart, (data) => {
          strategy.onTick(data);
          SOCKET.emit("UtBotRate", data[data.length - 1].indValues['utbot']);
          if (firstOne) {
            firstOne = false;
            SOCKET.emit("newIndSetDone", true);
          }
        });
      });
    });

    socket.on("getSgg", (side) => {
      let target = new Target("BTCUSDT")
      let targets = target.getSuggestions(chart.candles, side)
      socket.emit("TSuggestions", targets)
    })

    socket.on('ApplyTarget', target => {
      global.targetCond = target;
      socket.emit("TargetApplied", target);
    })
    
    socket.on("Update", (res) => {
      BinanceAction.getOrders(socket, "getOrders", "BTCUSDT", 20)
      BinanceAction.openedOrders(socket, "openedOrders");
    })

    socket.on("stopTarget", stopTarget => {
      global.lastOrder['stopTarget'] = stopTarget;
    })
    
    socket.on("stopTargets", stopTargets => {
      global.lastOrder['stopTargets'] = stopTargets;
    })

    /*
    stop target = 2222;
    stop targets = [
      {
        price: 333;
        amount: 0.2;
      },
      {
        price: 444;
        amount: 0.3;
      }
    ]
    */
  }

  sendBasicData() {
    let data = {};
    global.chart.indicators.map(ind => {
      data[ind.get_name()] = ind.getParams();
    })
    data['timeframe'] = global.chart.get_timeframe();
    if (global.targetCond) data['selectedTarget'] = global.targetCond.price;
    data['lastOrder'] = global.lastOrder;
    this.emit("init", data);
  }

  emit(tagName, value) {
    if (this.socket)
      this.socket.emit(tagName, value);

  }
}
