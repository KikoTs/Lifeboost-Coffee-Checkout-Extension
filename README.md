# Shopify Checkout Extension App using Node & React

This Shopify App template is tailored for creating efficient and scalable [Shopify applications](https://shopify.dev/docs/apps/getting-started) using Node and React. It empowers the developers by providing the essentials for creating a high-quality Shopify app.

## Features

The application's checkout extension is located at /extensions/checkout-ui-banner. You can easily generate new extensions using the command "npm run shopify app generate extension." Once published to Shopify via "npm run deploy”, these extensions are available for use in the Customizer section.

Development server can be initiated with the command "npm run dev" in the initial folder. 

Once the server is started, a URL link ending with "/extensions/dev-console" will be generated for you to test the app. The "@shopify/checkout-ui-extensions-react" library has been used to create the checkout extension.

Through the use of Shopify's extension point "Checkout::Dynamic::Render", the positioning of elements can be customized within the Customizer. A comprehensive guide on how to setup the extension is available in Shopify's Documentation [here](https://shopify.dev/docs/api/checkout-ui-extensions).

The App extension has been assigned the following scopes: "products, products_read". The front-end server utilized for this application is "gadget.app", which can be used for further customization of the app extension.

## Setup

Setting up this template is a simple process. Follow these steps:

1. Install [Node.js](https://nodejs.org/en/download/) (if not already installed).
2. Create a [Shopify partner account](https://partners.shopify.com/signup) (if you don’t have one).
3. Create a development store for testing, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).

## Installation

Use your preferred package manager to install the template:

Using yarn:

```shell
yarn create @shopify/app
```

Using npm:

```shell
npm init @shopify/app@latest
```

Using pnpm:

```shell
pnpm create @shopify/app@latest
```

This will clone the template and install the necessary dependencies.

## Develop & Test

You can develop locally using your preferred package manager. Run the following command from the root of your app:

Using yarn:

```shell
yarn dev
```

Using npm:

```shell
npm run dev
```

Using pnpm:

```shell
pnpm run dev
```

Visit the URL generated in your console, grant the app necessary permissions, and commence development.

## Getting Help

For further queries or assistance, please visit:

- [Creating a Shopify app](https://shopify.dev/docs/apps/getting-started)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-js#readme)
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)