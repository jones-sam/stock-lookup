import { Action, ActionPanel, Form, Icon, List, LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { SearchResult, searchStocks } from "./alphavantageApi";
import { StockInfo } from "./StockInfo";

export default function StockLookup() {
  const [isValidApiKey, setIsValidApiKey] = useState(true);
  const [stockSearchResults, setStockSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const testApiKey = async () => {
    try {
      // search to test if the api key is valid or not
      await searchStocks({ keywords: "tesla" });
      setIsValidApiKey(true);
    } catch (error) {
      await LocalStorage.removeItem("apiKey");
      setIsValidApiKey(false);
      showToast({ title: "Invalid API key or too many requests", style: Toast.Style.Failure });
    }
  };

  const getApiKey = useCallback(async () => {
    const apiKey = await LocalStorage.getItem("apiKey");

    if (!apiKey) {
      setIsValidApiKey(false);
    }
  }, []);

  useEffect(() => {
    getApiKey();
    setIsLoading(false);
  }, []);

  if (!isValidApiKey) {
    return (
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Submit"
              shortcut={{ key: "enter", modifiers: [] }}
              onSubmit={async (values) => {
                await LocalStorage.setItem("apiKey", values.apiKey);
                testApiKey();
              }}
            />
            <Action.OpenInBrowser
              url="https://www.alphavantage.co/support/#api-key"
              title="Get a free API Key from alphavantage.co"
            />
          </ActionPanel>
        }
      >
        <Form.TextField id="apiKey" placeholder="API Key" title="API Key" autoFocus={true} />
        <Form.Description
          text={`This extension uses the Alphavantage Stock API for market information. Go to https://www.alphavantage.co/support/#api-key for a free API Key and paste it in the text field above.\n\nPress ⌘ + ⇧ + ↵ to go to the link.`}
        />
      </Form>
    );
  }
  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search for a stock"
      onSearchTextChange={async (text) => {
        if (text.length > 0) {
          setIsLoading(true);
          const results = await searchStocks({ keywords: text });
          setStockSearchResults(results);
          setIsLoading(false);
        } else {
          setStockSearchResults([]);
        }
      }}
      throttle={true}
    >
      {stockSearchResults &&
        stockSearchResults.map((result) => {
          return (
            <List.Item
              key={result.symbol}
              title={result.symbol}
              subtitle={result.name}
              accessories={[
                { text: result.currency, icon: "💲", tooltip: "Currency the stock is traded in" },
                { text: result.region, icon: Icon.Globe, tooltip: "Region where the stock is traded" },
              ]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title={`View ${result.symbol}`}
                    target={<StockInfo stockSearchResult={result} />}
                    icon={Icon.Document}
                  />
                </ActionPanel>
              }
            />
          );
        })}
    </List>
  );
}
