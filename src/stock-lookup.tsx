import { Action, ActionPanel, Form, Icon, List, LocalStorage } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { SearchResult, searchStocks } from "./alphavantageApi";

export default function StockLookup() {
  const [isValidApiKey, setIsValidApiKey] = useState(false);
  const [stockSearchResults, setStockSearchResults] = useState<SearchResult[]>([]);

  const getApiKey = useCallback(async () => {
    const apiKey = await LocalStorage.getItem("apiKey");
    console.log(apiKey);

    if (apiKey) {
      setIsValidApiKey(true);
    }
  }, []);

  useEffect(() => {
    getApiKey();
  }, []);

  if (!isValidApiKey) {
    return (
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Submit"
              onSubmit={async (values) => {
                await LocalStorage.setItem("apiKey", values.apiKey);
                setIsValidApiKey(true);
              }}
            ></Action.SubmitForm>
          </ActionPanel>
        }
      >
        <Form.TextField id="apiKey" placeholder="API Key" />
      </Form>
    );
  }
  return (
    <List
      searchBarPlaceholder="Search for a stock"
      onSearchTextChange={async (text) => {
        if (text.length > 0) {
          const results = await searchStocks({ keywords: text });
          setStockSearchResults(results);
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
            />
          );
        })}
    </List>
  );
}
