require("dotenv").config();
import Binance from "node-binance-api";
let binance = new Binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.API_SECRET,
  useServerTime: true,
});

export default binance;
