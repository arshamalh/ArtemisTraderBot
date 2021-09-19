import Strategy, {Signal} from "../lib/Strategy";
import Order from "../lib/Order";

export default class s1 extends Strategy {
    constructor(symbol) {
        super(symbol);
        this.order_id = null;
    }

    onTick(data, canStop = true) {
        /*{
            open: 19340.58,
            high: 19342.86,
            low: 19335,
            close: 19335,
            volume: 38.527,
            isFinal: true,
            time: 1607063880000,
            indValues: { atr: 10.33231598054392, utbot: 19345.332315980544 }
        }*/

        this.c_candles = data;
        // console.log("s1, UtBot: ", this.c_utbot(0), new Date(data[data.length-1].time))
        if (this.c_candles.length < 10)
            return null;

        if (lastOrder && canStop){
            this.handleStop();
            // console.log(lastOrder);
        }
        else
            return this.exec();
    }

    exec() {
        if (this.c_close() < this.c_utbot(0) && this.c_close(1) > this.c_utbot(1)) {
            return this.alertNewSignal(Signal.sell, this.c_utbot());
        } else if (this.c_close() > this.c_utbot(0) && this.c_close(1) < this.c_utbot(1)) {
            return this.alertNewSignal(Signal.buy, this.c_utbot());
        }

        return null;
    }

    handleStop() {
      let msgSuccess = {
        code: 200,
        msg: "order closed"
      }
      let msgFailed = {
        code: 400,
        msg: "opperation failed"
      }
        if (lastOrder.side === Signal.Buy) {
            if (this.c_close() <= lastOrder.stop) {
                Order.closeOrder(this.symbol).then((res) => {
                    if (res) {
                      SOCKET.emit("TouchedStopLoss", msgSuccess)
                      return msgSuccess
                    }
                    SOCKET.emit("TouchedStopLoss", msgFailed)
                    return msgFailed
                  });
            } else return null;
        } else {
            if (this.c_close() >= lastOrder.stop) {
                Order.closeOrder(this.symbol).then((res) => {
                  if (res) {
                    SOCKET.emit("TouchedStopLoss", msgSuccess)
                    return msgSuccess
                  }
                  SOCKET.emit("TouchedStopLoss", msgFailed)
                  return msgFailed
                  });
            } else return null;
        }
    }

    alertNewSignal(signal, stop_price) {

    }
}
