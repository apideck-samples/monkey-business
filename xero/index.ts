import { XeroClient, setCustomRequest } from "xero-node";
require("dotenv").config();
const hijack = require("../utils/hijack");
hijack();

const apideckUrl = "https://unify.apideck.com";
const proxyUrl = `${apideckUrl}/vault/proxy`;
const consumerId = "test-consumer";
const tenantId = "<tenantId>"; // your Xero tenant id
const xeroClient = new XeroClient();

setCustomRequest((req) => (options, callback) => {
  return req(
    {
      ...(options ?? {}),
      uri: proxyUrl,
      headers: {
        ...(options?.headers ?? {}),
        "Content-Type": options?.headers?.["Content-Type"] ?? "application/json",
        Authorization: `Bearer ${process.env.UNIFY_API_KEY}`,
        "x-apideck-app-id": process.env.UNIFY_APP_ID,
        "x-apideck-consumer-id": consumerId,
        "x-apideck-service-id": "xero",
        "x-apideck-downstream-url": options.uri,
      },
    },
    callback
  );
});

const main = async () => {
  await xeroClient.accountingApi.getAccounts(tenantId);
};

main();
