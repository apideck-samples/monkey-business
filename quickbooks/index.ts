const QuickBooks = require("node-quickbooks");
require("dotenv").config();
const hijack = require("../utils/hijack");
hijack();

const consumerId = "test-consumer";

const request = QuickBooks.prototype.request;

const quickbooksClient = new QuickBooks(
  "consumerKey", // not used
  "consumerSecret", // not used
  "oauthToken", // not used
  false,
  "{realm_id}", // QuickBooks company id connected to the consumer ID - will be dynamically injected by the proxy
  true, // use the sandbox? Toggles between https://quickbooks.api.intuit.com || https://sandbox-quickbooks.api.intuit.com
  false, // enable debugging?
  null,
  "2.0",
  "refreshToken"
);

QuickBooks.prototype.request = (context, verb, options, entity, callback) => {
  const url = context.endpoint + context.realmId + options.url;
  return request(
    context,
    verb,
    {
      ...(options ?? {}),
      forceUrl: true,
      url: process.env.UNIFY_PROXY_ENDPOINT,
      headers: {
        ...(options?.headers ?? {}),
        "Content-Type": options?.headers?.["Content-Type"] ?? "application/json",
        Authorization: `Bearer ${process.env.UNIFY_API_KEY}`,
        "x-apideck-app-id": process.env.UNIFY_APP_ID,
        "x-apideck-consumer-id": consumerId,
        "x-apideck-service-id": "quickbooks",
        "x-apideck-downstream-url": url,
      },
    },
    entity,
    callback
  );
};

async function main() {
  await new Promise((resolve, reject) => {
    quickbooksClient.findAccounts(
      {
        limit: 5,
        offset: 0,
      },
      function (err, accounts) {
        if (err) {
          reject(err);
          return;
        }
        console.log(accounts);
        resolve(accounts);
      }
    );
  });
}

main();
