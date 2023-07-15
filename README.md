# Azure OpenAI Proxy

A Cloudflare worker script to proxy OpenAI‘s request to Azure OpenAI Service. It supports multiple models and multiple custom keys.

## Quick Start

1. Copy and paste `index.js` into a new Cloudflare Worker editor.
2. Fill in the values in `env` section in the code.
3. Save and deploy the Cloudflare Worker.
4. [Optional] Add a custom domain to this worker.

## Configuration

```js
const env = {
  // The name of your Azure OpenAI Resource
  resourceName: '<Insert Here>',
  // The name of your Azure OpenAI Deployment
  // Can be undefined
  deployNameMapping: {
    'gpt-3.5-turbo': '<Insert Here>',
    'gpt-3.5-turbo-16k': '<Insert Here>',
    'gpt-4': '<Insert Here>',
    'gpt-4-32k': '<Insert Here>',
    'text-davinci-003': '<Insert Here>',
    'code-davinci-002': '<Insert Here>',
  },
  apiVersion: '2023-05-15',
  // Custom API key mapping
  // If not matched, the API key will not be replaced
  apiKeyMapping: {
    'john-smith-key': '<Insert Here>',
  },
};
```
