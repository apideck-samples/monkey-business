import Shopify from '@shopify/shopify-api';
require('dotenv').config()
const hijack = require("../utils/hijack")
hijack()

const apideckUrl = 'https://unify.apideck.com'
// const apideckUrl = 'http://localhost:3050'
const proxyUrl = `${apideckUrl}/vault/proxy`

const shop = 'apideck-sandbox'
const consumerId = 'test-consumer'

// // @ts-ignore monkeypatching a private member
// client.client.validateShop = (url:string) => {
//   return true
// }

// we don't care about the second arg since we're monkey patching it
const client = new Shopify.Clients.Graphql(
  `${shop}.myshopify.com`,
  // `{shop}.myshopify.com`,
  // // 'placeholder',
  'XXXX'
)
// @ts-ignore monkeypatching a private member
const doRequest = client.client.doRequest
// @ts-ignore monkeypatching a private member
client.client.doRequest = (url: string, opts: RequestInit): RequestReturn => {
  console.log(opts)
  return doRequest(proxyUrl, {
    ...opts,
    headers: {
      // ...(opts.headers || {}),
      'Content-Type': opts.headers['Content-Type'],
      Authorization: `Bearer ${process.env.UNIFY_API_KEY}`,
      'x-apideck-app-id': process.env.UNIFY_APP_ID,
      'x-apideck-consumer-id': consumerId,
      'x-apideck-service-id': 'shopify',
      'x-apideck-downstream-url': url
    }
  })
}

// client.client.doRequest = (url: string, opts: RequestInit): RequestReturn => {
//   console.log(opts)
//   return doRequest(url, opts)
// }

const main = async () => {
  try {
  const products = await client.query({
    data: `{
        products (first: 10) {
          edges {
            node {
              id
              title
              bodyHtml
            }
          }
        }
      }`,
  });
  } catch (e) {
    console.log(e)
  }
}

main()