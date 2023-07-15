addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

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

async function handleRequest(request) {
  if (request.method == 'OPTIONS') {
    return handleOptions(request);
  }

  let authKey = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!authKey) {
    return new Response('Unauthorized', { status: 401 });
  } else if (env.apiKeyMapping[authKey]) {
    authKey = env.apiKeyMapping[authKey];
  }

  const url = new URL(request.url);

  if (url.pathname == '/v1/models') {
    return handleModels(request);
  }

  let body;
  if (request.method === 'POST') {
    const clonedRequest = request.clone();
    body = await clonedRequest.json(); // Read the body from the cloned request
  }

  const modelName = body?.model;
  const deployName = env.deployNameMapping[modelName] || undefined;

  if (!deployName) {
    return new Response('Invalid model', { status: 400 });
  }

  const fetchAPI =
    `https://${env.resourceName}.openai.azure.com/openai/deployments/${deployName}` +
    `/${url.pathname.replace('/v1/', '')}?api-version=${env.apiVersion}`;

  const proxyRequest = new Request(fetchAPI, request);
  proxyRequest.headers.set('api-key', authKey);

  // unlike haibbo/cf-openai-azure-proxy, we don't manipulate the response
  return fetch(proxyRequest);
}

async function handleOptions(_) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

const staticPermission = [
  {
    id: 'modelperm-M56FXnG1AsIr3SXq8BYPvXJA',
    object: 'model_permission',
    created: 1679602088,
    allow_create_engine: false,
    allow_sampling: true,
    allow_logprobs: true,
    allow_search_indices: false,
    allow_view: true,
    allow_fine_tuning: false,
    organization: '*',
    group: null,
    is_blocking: false,
  },
];

function handleModels(_) {
  const data = {
    object: 'list',
    data: Object.keys(env.deployNameMapping).map((key) => ({
      id: key,
      object: 'model',
      created: 1677610602,
      owned_by: 'openai',
      permission: staticPermission,
      root: key,
      parent: null,
    })),
  };

  const json = JSON.stringify(data, null, 2);
  return new Response(json, {
    headers: { 'Content-Type': 'application/json' },
  });
}
