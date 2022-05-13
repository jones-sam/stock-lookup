import { Action, ActionPanel, Detail, showToast, Toast } from "@raycast/api";
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
     ? "Error retrieving data, please try again. \n Remember that with the free tier of the AlphaVantage API you are limited to 5 calls per minute or 500 per day."
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
- *Previous close*: ${stringToFormattedNumber({ string: stockInfo.previousClose })}
- *Change*: ${stringToFormattedNumber({ string: stockInfo.change })}
- *Change Percent*: ${stockInfo.changePercent}
      `
         : ""
     }
 
 `
 }
 
    `;

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
        </ActionPanel>
      }
      isLoading={loading}
      markdown={md}
      // metadata={stockInfo && !loading ? <Detail.Metadata></Detail.Metadata> : null}
    />
  );
};
