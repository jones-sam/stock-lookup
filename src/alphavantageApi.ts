import { LocalStorage } from "@raycast/api";
import axios from "axios";

const BASE_URL = "https://www.alphavantage.co/query?";

export interface SearchResult {
  symbol: string;
  name: string;
  region: string;
  currency: string;
}

export async function searchStocks({ keywords }: { keywords: string }) {
  const apiKey = await LocalStorage.getItem("apiKey");

  const res = await axios.get(`${BASE_URL}function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${apiKey}`);

  const searchResults: SearchResult[] = [];
  res.data.bestMatches.forEach((x: Record<string, string>) => {
    searchResults.push({
      symbol: x["1. symbol"],
      name: x["2. name"],
      region: x["4. region"],
      currency: x["8. currency"],
    });
  });

  return searchResults;
}
