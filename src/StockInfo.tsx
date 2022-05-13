import { Action, ActionPanel, Detail, Icon, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { getStockInfoBySymbol, SearchResult, StockInfoInterface } from "./alphavantageApi";

interface StockInfoProps {
  stockSearchResult: SearchResult;
}

export const StockInfo = ({ stockSearchResult }: StockInfoProps) => {
  const [loading, setLoading] = useState(true);
  const [stockInfo, setStockInfo] = useState<StockInfoInterface | null>(null);
  const [error, setError] = useState(false);

  const getStockInfo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStockInfoBySymbol(stockSearchResult.symbol);
      setStockInfo(data);
      setError(false);
    } catch (error) {
      console.log(error);
      setError(true);
      showToast({ title: "Unable to fetch stock data", style: Toast.Style.Failure });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    getStockInfo();
  }, []);

  const stringToFormattedNumber = ({ string, isCurrency = true }: { string: string; isCurrency?: boolean }) => {
    return new Intl.NumberFormat("en-US", {
      style: isCurrency ? "currency" : undefined,
      currency: isCurrency ? stockSearchResult.currency : undefined,
    }).format(parseFloat(string));
  };

  const md = `
 # ${stockSearchResult.symbol} - ${stockSearchResult.name}
 ---
 ${
   error
     ? "Error retrieving data, please try again. Remember that with the free tier of the AlphaVantage API you are limited to 5 calls per minute and 500 per day."
     : loading
     ? "Loading..."
     : `
     ${
       stockInfo
         ? `
As of the latest trading day on ${stockInfo?.lastTradingDay}:
# Price: ${stringToFormattedNumber({ string: stockInfo.price })}
- *Open*: ${stringToFormattedNumber({ string: stockInfo.open })}
- *High*: ${stringToFormattedNumber({ string: stockInfo.high })}
- *Low*: ${stringToFormattedNumber({ string: stockInfo.low })}
- *Volume*: ${stringToFormattedNumber({ string: stockInfo.volume, isCurrency: false })}
- *Previous close*: ${stringToFormattedNumber({ string: stockInfo.previousClose })}
- *Change*: ${stringToFormattedNumber({ string: stockInfo.change })}
- *Change Percent*: ${stockInfo.changePercent}
      `
         : ""
     }
 `
 }
`;

  const googleFinanceUrl = `https://www.google.com/search?q=%24${stockSearchResult.symbol}`;
  const yahooFinanceUrl = `https://finance.yahoo.com/quote/${stockSearchResult.symbol}`;
  const tradingViewUrl = `https://www.tradingview.com/symbols/${stockSearchResult.symbol}`;
  const twitterUrl = `https://twitter.com/search?q=%24${stockSearchResult.symbol}`;

  return (
    <Detail
      actions={
        <ActionPanel>
          {error && (
            <Action
              title="Refresh"
              onAction={() => {
                getStockInfo();
              }}
            />
          )}
          <Action.OpenInBrowser title="View on Google Finance" url={googleFinanceUrl} />
          <Action.OpenInBrowser title="View on Yahoo Finance" url={yahooFinanceUrl} />
          <Action.OpenInBrowser title="View on Trading View" url={tradingViewUrl} />
          <Action.OpenInBrowser title="View on Twitter" url={twitterUrl} />
        </ActionPanel>
      }
      isLoading={loading}
      markdown={md}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Links" icon={Icon.Link} />

          <Detail.Metadata.Link target={googleFinanceUrl} text="Google Finance" title="Google" />
          <Detail.Metadata.Link target={yahooFinanceUrl} text="Yahoo Finance" title="Yahoo" />
          <Detail.Metadata.Link target={tradingViewUrl} text="Trading View" title="Trading View" />
          <Detail.Metadata.Link target={twitterUrl} title="Discussions on Twitter" text="Twitter" />
        </Detail.Metadata>
      }
    />
  );
};
