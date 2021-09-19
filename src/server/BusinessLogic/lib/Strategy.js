export const Source = {
    "close": "close",
    "open": "open",
    "high": "high",
    "low": "low",
    "volume": "volume"
};
export const Signal = {
    "Sell": "sell",
    "Short": "short",
    "Buy": "buy",
    "Long": "long"
}

export default class Strategy {
    constructor(symbol, candles = null) {
        this.c_candles = [];
        if (candles)
            this.c_candles = candles;
        this.symbol = symbol;
    }

    c_close(idx = 0) {
        idx = this.c_candles.length - 1 - idx;
        return this.c_candles[idx][Source.close];
    }

    c_volume(idx = 0) {
        idx = this.c_candles.length - 1 - idx;
        return this.c_candles[idx][Source.volume];
    }

    c_open(idx = 0) {
        idx = this.c_candles.length - 1 - idx;
        return this.c_candles[idx][Source.open];
    }

    c_high(idx = 0) {
        idx = this.c_candles.length - 1 - idx;
        return this.c_candles[idx][Source.high];
    }

    c_low(idx = 0) {
        idx = this.c_candles.length - 1 - idx;
        return this.c_candles[idx][Source.low];
    }

    c_utbot(idx = 0) {
        try {
            idx = this.c_candles.length - 1 - idx;
            return this.c_candles[idx].indValues.utbot;
        } catch (e) {
            return null;
        }
    }

    c_atr(idx = 0) {
        idx = this.c_candles.length - 1 - idx;
        return this.c_candles[idx].indValues.atr;
    }
}
