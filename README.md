# Fetch Cache Manager

## Contents
* [Install](#install)
* [Basic Usage](#basic-usage)
* [Configuration](#configuration)
  * [addAgent](#addagent)
  * [runner](#runner)
  * [asPromise](#aspromise)
  * [asCallback](#ascallback)
* [Development](#development)

## Install
To install simply run `yarn add @datawave-au/wdu-superagent-cache-manager`.

## Basic Usage

### Creating an agent
```javascript
import { addAgent } from '@datawave/fetch-cache-manager';

export const AGENT_NAME = 'my-agent';

function fetchJson({ url, options, callback }) {
    const controller = new AbortController();
    const { signal } = controller;
    fetch(url, { ...options, signal })
        .then(async (res) => callback(null, {
            data: await res.json(),
            status: res.status,
        }))
        .catch((err) => {
            callback(err);
        });

    return () => controller.abort();
}

addAgent({
    name: AGENT_NAME,
    runner: fetchJson,
    basePath: 'http://localhost:8080',
});
```

### Using as promise
```javascript
import { AGENT_NAME  } from 'agent.js';
import { asPromise } from '@datawave/fetch-cache-manager';

async function fetchData() {
    try {
        const options = {
            method: 'GET',
            cacheOptions: {
                cacheTtlMs: 10000,
            },
        };
        const path = 'v1/data-endpoint';    
        const data = await asPromise({agent: AGENT_NAME, path, options});
        
        // Do something with the data
    } catch(err) {
        // Error handling
    }    
}
```

### Using as callback
```javascript
import { AGENT_NAME  } from 'agent.js';
import { asCallback } from '@datawave/fetch-cache-manager';

function handleData(error, data) {
    if(error) {
        // Error handling
        return;
    }
    
    // Do something with the data
}
const options = {
    method: 'GET',
    cacheOptions: {
        cacheTtlMs: 10000,
    },
};
const path = 'v1/data-endpoint';

asCallback({agent: AGENT_NAME, path, options, callback: handleData});
```

## Configuration
### addAgent
`name <string>`: The name of the agent. This will be used to further reference the agent when making calls (eg: `my-agent`);

`basePath <string>`: Base path for the agent (eg: `http://localhost:8080`);

`headers <array<{key: <string>, value: <string}>`: Array containing a list of headers to be added to all api calls (eg: `[{key: 'authorization', value: 'Bearer My-Token'}]`);

`headers <array<{key: <string>, value: <string}>`: Array containing a list of query parameters to be added to all api calls (eg: `[{key: 'debugMode', value: '1'}]`);

`runner <function>`: A function that runs the api calls for the agent. FCM is meant to be a library agnostic tool, so it's up to the implementer to decide how to actually run the API calls, using this function.
This function should use the received callback to send either an error or the API response. The function should return an abort controller.

### runner
`url <string>`: Fully build URL (including query parameters);

`options <object>`

`options.method <string>`: API call method (eg: `GET`)

`options.body <string>`: API request body (when required)

`options.headers <array<{key: <string>, value: <string}>`: Array of headers to be sent to the server

`callback <function>`: Callback to execute when the API call completes. Expected to be called with 2 params: `error` and `data`;

### asPromise
`agentName <string>`: Name of agent to use

`path <string>`: Path to be added to the agent base path

`options <object>`

`options.method <string>`: API call method (default: `GET`)

`options.body <string>`: API request body (when required)  (default: null)

`options.query <array<{key: <string>, value: <string}>`: Array of query parameters  to be sent to the server

`options.headers <array<{key: <string>, value: <string}>`: Array of headers to be sent to the server

`options.cacheOptions <object>`

`options.cacheOptions.cacheTtlMs <number>`: Cache TTL (in ms) (default: 0)

`options.cacheOptions.keyOptions <objcet>`

`options.cacheOptions.keyOptions.excludeHeaders <array<string>>`: Array of header names to exclude from the cache key generation (default: [])

`options.cacheOptions.keyOptions.excludeQueryParams <array<string>>`: Array of query parameter names to exclude from the cache key generation  (default: [])

`options.cacheOptions.keyOptions.sortHeaders <bool>`: Sort headers before generating the cache key (default: true)

`options.cacheOptions.keyOptions.sortKeys <bool>`: Sort query parameters before generating the cache key (default: true)

### asCallback

All options available for [asPromise](#aspromise) are available for asCallback as well.

`callback <function>`: Function to be executed when the request completes. Will be called with 2 parameters: error and response

`frequencyMs <number>`: When provided with a value other than 0, FCM will poll the api endpoint, calling the callback at the requested frequency. When polling from multiple places at different frequencies on an item with the same cache key, the lowest frequency will be used. (default: 0)

## Development
### Clone the repo
`git clone ssh://git@github.com:DatawaveAu/fetch-cache-manager.git`

### Quick Start
* Node version `^10.15.0` with yarn version `^1.15.0`
* Dependencies: `yarn --frozen-lockfile` to download all the dependencies.
* Development: `yarn watch` will clean and start watching all files and lint.

### Tests
To run the tests `yarn test`.

### CI-CD
To build the project and run test in a ci-cd environment run `yarn ci-cd`.
