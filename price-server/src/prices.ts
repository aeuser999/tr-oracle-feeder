import { getBaseCurrency, getQuoteCurrency } from 'lib/currency'
import { PriceBySymbol } from 'provider/base'
import { lunaProvider, fiatProvider, cryptoProvider } from 'provider'

export function getLunaPrices(): PriceBySymbol {
  const helpers: PriceBySymbol = {
    'USDT/USD': cryptoProvider.getPriceBy('USDT/USD'), // tvwap(Kraken, Bitfinex)
  }
  const prices = lunaProvider.getPrices()

  // make 'LUNC/USD' rate
  if (prices['LUNC/USDT'] && helpers['USDT/USD']) {
    // LUNC/USD = LUNC/USDT * USDT/USD
    prices['LUNC/USD'] = prices['LUNC/USDT'].multipliedBy(helpers['USDT/USD'])
  }

  // make 'LUNC/FIAT' rates
  if (prices['LUNC/USD']) {
    Object.keys(fiatProvider.getPrices()).map((symbol) => {
      const targetSymbol = `LUNC/${getQuoteCurrency(symbol)}`
      const usdFiat = fiatProvider.getPriceBy(symbol)

      // LUNC/FIAT = LUNC/USD * USD/FIAT
      prices[targetSymbol] = prices['LUNC/USD'].multipliedBy(usdFiat)
    })
  }

  // make 'LUNC/CRYPTO' rates
  if (prices['LUNC/USDT']) {
    Object.keys(cryptoProvider.getPrices())
      .filter((symbol) => getQuoteCurrency(symbol) === 'USDT')
      .map((symbol) => {
        const targetSymbol = `LUNC/${getBaseCurrency(symbol)}`

        prices[targetSymbol] = prices['LUNC/USDT'].dividedBy(cryptoProvider.getPriceBy(symbol))
      })
  }

  return prices
}

// deprecated (2021.07.08)
// export function getBtcPremium(): BigNumber | undefined {
//   try {
//     const prices: { [symbol: string]: BigNumber } = {
//       'BTC/KRW': cryptoProvider.getPriceBy('BTC/KRW'), // tvwap(upbit, bithumb)
//       'BTC/USDT': cryptoProvider.getPriceBy('BTC/USDT'), // tvwap(binance, huobi)

//       'USDT/USD': cryptoProvider.getPriceBy('USDT/USD'), // tvwap(Kraken, Bitfinex)
//       'USD/KRW': num(1).dividedBy(fiatProvider.getPriceBy('KRW/USD')), // average(currencylayer, alphavantage)
//     }
//     for (const symbol of Object.keys(prices)) {
//       if (!prices[symbol] || prices[symbol].isNaN()) {
//         throw new Error(`BTC Premium: wrong price source - ${symbol}(${prices[symbol]})`)
//       }
//     }

//     // BTC PREMIUM = BTC/KRW / (BTC/USDT 최근체결가 * USDT/USD * USD/KRW)
//     const btcPremium = prices['BTC/KRW'].dividedBy(
//       prices['BTC/USDT'].multipliedBy(prices['USDT/USD']).multipliedBy(prices['USD/KRW'])
//     )
//     if (!btcPremium || btcPremium.isNaN() === true) {
//       throw new Error(`wrong btc premium(${btcPremium})`)
//     }

//     return btcPremium
//   } catch (error) {
//     logger.error(error)
//     return undefined
//   }
// }

// export function getUsdtToKrwRate(): BigNumber | undefined {
//   try {
//     const prices: { [symbol: string]: BigNumber } = {
//       'USDT/USD': cryptoProvider.getPriceBy('USDT/USD'), // tvwap(Kraken, Bitfinex)
//       'USD/KRW': num(1).dividedBy(fiatProvider.getPriceBy('KRW/USD')), // average(currencylayer, alphavantage)
//     }
//     for (const symbol of Object.keys(prices)) {
//       if (!prices[symbol] || prices[symbol].isNaN()) {
//         throw new Error(`USDT/KRW: wrong price source - ${symbol}(${prices[symbol]})`)
//       }
//     }

//     // krwRate = USDT/USD * USD/KRW * btcPremium
//     const btcPremium = getBtcPremium()
//     const krwRate = btcPremium?.multipliedBy(prices['USDT/USD']).multipliedBy(prices['USD/KRW'])
//     if (!krwRate || krwRate.isNaN() === true) {
//       throw new Error(`wrong krwRate(${krwRate})`)
//     }

//     return krwRate
//   } catch (error) {
//     logger.error(error)
//     return undefined
//   }
// }
