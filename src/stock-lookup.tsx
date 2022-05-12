import React, { useCallback, useEffect, useState } from "react";
import { ActionPanel, List, Action, Icon, LocalStorage, Form } from "@raycast/api";

export default function StockLookup() {
  const [isValidApiKey, setIsValidApiKey] = useState<boolean>(false);

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
    <List searchBarPlaceholder="Search for a stock">
      <List.Item title="test" />
      <List.Item title="test2" />
    </List>
  );
}
