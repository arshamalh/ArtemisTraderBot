import Chart from "./lib/Chart";
import Binance from "./lib/Binance";
import ATR from "./Indicators/ATR";
import UTBot from "./Indicators/UTBot";
import s1 from "./strategies/s1";

global.targetCond = null;
global.binanceEntry = new Binance();
global.lastOrder = null;
global.chart = new Chart("BTCUSDT", "1m");

chart.setIndicator(new ATR("close", 7, 'rma')); // is working well for sma and rma
chart.setIndicator(new UTBot('close', {atrlen: 7, sensitivity: 1}));

let strategy = new s1("BTCUSDT");

binanceEntry.makeHistory(chart, (data) => {
  strategy.onTick(data, false);
}).then(() => {
  binanceEntry.isBusy = false;
  console.log("On Ticker.")
  binanceEntry.makeTicker(chart, (data) => {
    strategy.onTick(data);
    SOCKET.emit("UtBotRate", data[data.length - 1].indValues['utbot'])
  });
});