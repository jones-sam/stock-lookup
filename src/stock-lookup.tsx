import { Action, ActionPanel, confirmAlert, Form, Icon, List, LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { SearchResult, searchStocks } from "./alphavantageApi";
import { StockResultListItem } from "./StockResultListItem";

export default function StockLookup() {
  const [isValidApiKey, setIsValidApiKey] = useState(true);
  const [stockSearchResults, setStockSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [recentStocks, setRecentStocks] = useState<SearchResult[]>([]);

  const testApiKey = async () => {
    try {
      // search to test if the api key is valid or not
      await searchStocks({ keywords: "a" });
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

  const getRecentlyViewedStocks = useCallback(async () => {
    const recentStocks = await LocalStorage.getItem<string>("recentStocks");
    const recentStocksArr = recentStocks ? JSON.parse(recentStocks) : [];
    setRecentStocks(recentStocksArr);
  }, []);

  useEffect(() => {
    getApiKey();
    getRecentlyViewedStocks();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isSearching === false) {
      getRecentlyViewedStocks();
    }
  }, [isSearching]);

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
        <Form.TextField id="apiKey" placeholder="API Key" title="API Key" autoFocus={true} storeValue={true} />
        <Form.Description
          text={`This extension uses the Alphavantage Stock API for market information. Go to https://www.alphavantage.co/support/#api-key for a free API Key and paste it in the text field above.\n\nPress ⌘ + ⇧ + ↵ to go to the link.`}
        />
      </Form>
    );
  }
  return (
    <List
      actions={
        <ActionPanel>
          <Action
            title="Change API Key"
            onAction={async () => {
              await confirmAlert({
                title: "Are you sure you want to change your API key?",
                primaryAction: {
                  title: "Yes",
                  onAction: async () => {
                    await LocalStorage.removeItem("apiKey");
                    setIsValidApiKey(false);
                  },
                },
              });
            }}
          />
        </ActionPanel>
      }
      isLoading={isLoading}
      searchBarPlaceholder="Search for a stock"
      onSearchTextChange={async (text) => {
        if (text.length > 0) {
          setIsLoading(true);
          setIsSearching(true);

          const results = await searchStocks({ keywords: text });
          setStockSearchResults(results);
          setIsLoading(false);
        } else {
          setIsSearching(false);
          setStockSearchResults([]);
        }
      }}
      throttle={true}
    >
      <List.EmptyView title="No Stocks Found" icon={Icon.LevelMeter} />
      {isSearching ? (
        <List.Section key="results" title="Results">
          {stockSearchResults.map((result) => (
            <StockResultListItem stockResult={result} />
          ))}
        </List.Section>
      ) : (
        <List.Section key="recent" title="Recently Viewed Stocks">
          {recentStocks.map((stockResult) => (
            <StockResultListItem stockResult={stockResult} />
          ))}
        </List.Section>
      )}
    </List>
  );
}
