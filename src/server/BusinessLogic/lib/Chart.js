export default class Chart {
    candles = [];
    indicators = [];

    constructor(symbole, timeframe) {
        this.symbole = symbole;
        this.timeframe = timeframe;
    }

    setIndicator(indicator) {
        this.indicators.push(indicator);
    }


    onTick(newCandle) {

        // newCandle comes from binance
        // Enter the first Candle
        if (this.candles.length === 0) {
            this.candles.push(newCandle);
        } else {
            // if the last candle is closed, we will make a new candle from that but we will change it next.
            if (newCandle.isFinal === true) {
                this.candles.push(newCandle);
            } else {
                // Update Candle (first or last (also last open))
                // this process make indicators list empty, not important, it will be filled in regenerator again
                if (this.candles[this.get_index(0)].isFinal === true) {
                    this.candles.push(newCandle);
                } else {
                    this.candles[this.get_index(0)] = newCandle;

                    // let last= this.candles[this.get_index(0)];
                    // this.candles[this.get_index(0)] = {
                    //     ...newCandle,
                    //     indValues[] // indicator name has to come here.
                    // };
                    // lines above are wrong because the list has to be empty, then in regenerate all indicators will be refill.

                }
            }

        }

        // regenerate method, get this.candles and update the indicators
        this.regenerateIndicators();

        // return the last candle
        return this.candles[this.get_index(0)];
    }

    regenerateIndicators() {
        this.indicators.forEach((indicator) => {
            // we set the last candle indValues again
            // indicator has a onTick method returns a number
            let indicatorResult = indicator.exec(this.candles); // indicatorResult is just a number that show the indicator number it can be anything else
            // console.log(indicator.get_name());
            if (indicatorResult) {
                this.candles[this.get_index(0)].indValues[
                    indicator.get_name()
                    ] = indicatorResult;
            } else {
                this.candles[this.get_index(0)].indValues[
                    indicator.get_name()
                    ] = NaN;
            }

            // console.log(this.candles[this.candles.length - 1].open, this.candles[this.candles.length - 2].open, "\n")
            /**** It's just for logging => ****
            let date = new Date(this.candles[this.get_index(0)].time);
            let ohlc = {...this.candles[this.get_index(0)]};
            // if (indicator.get_name() === 'atr') return 0; // don't show result in the console for atr
            console.log(
              "\nCandleNumber: ",
              this.get_index(0),
              "\n**TIME**",
              date,
              // "\n**OHLC**",
              // "\nO: ",
              // ohlc.open,
              // "\nH: ",
              // ohlc.high,
              // "\nL: ",
              // ohlc.low,
              // "\nC: ",
              // ohlc.close,
              "\nUTBOt: ",
              ohlc.indValues[indicator.get_name()]
            );

            /**** <= It's just for logging ****/

        });
    }

    get_symbole() {
        return this.symbole;
    }

    get_timeframe() {
        return this.timeframe;
    }

    get_index(idx) {
        return this.candles.length - idx - 1;
    }
}
