================
CODE SNIPPETS
================
TITLE: Invoking a Local Function
DESCRIPTION: Demonstrates how to use `step.invoke()` to call another function within the same Inngest application. This allows for reusable function logic and synchronous interaction between functions.

SOURCE: https://www.inngest.com/docs/guides/invoking-functions-directly

LANGUAGE: APIDOC
CODE:
```
## POST /api/inngest/functions

### Description
Invokes a specific Inngest function directly, allowing for RPC-like communication between functions within an event-driven system.

### Method
POST

### Endpoint
`/api/inngest/functions`

### Parameters
#### Request Body
- **function** (object) - Required - The function object to invoke.
- **data** (any) - Optional - The input data to pass to the invoked function.
- **options** (object) - Optional - Configuration options for the invocation, such as concurrency limits.

### Request Example
```json
{
  "function": "computeSquare",
  "data": {"number": 4}
}
```

### Response
#### Success Response (200)
- **result** (any) - The return value of the invoked function.

#### Response Example
```json
{
  "result": 16
}
```
```

--------------------------------

TITLE: Basic Function Handler Structure (Python)
DESCRIPTION: Illustrates the fundamental structure of an Inngest function handler. It shows how to define a function using the `@inngest_client.create_function` decorator and the basic signature for the asynchronous handler function, which receives context.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: python
CODE:
```
@inngest_client.create_function(
    # Function options
)
async def fn(ctx: inngest.Context):
    # Function code
```

--------------------------------

TITLE: Convert to Multi-Step Function (TypeScript)
DESCRIPTION: Shows how to convert a single-step Inngest function into a multi-step function by wrapping the core logic in `step.run()`. This allows for independent retries of individual steps.

SOURCE: https://www.inngest.com/docs/guides/multi-step-functions

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "activation-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.run("send-welcome-email", async () => {
      return await sendEmail({ email: event.user.email, template: "welcome" });
    });
  }
);

```

--------------------------------

TITLE: Invoke Local Inngest Function (TypeScript)
DESCRIPTION: Demonstrates how to invoke a local Inngest function using `step.invoke()`. The `mainFunction` calls `computeSquare` and retrieves its result. This showcases direct, synchronous interaction between functions.

SOURCE: https://www.inngest.com/docs/guides/invoking-functions-directly

LANGUAGE: typescript
CODE:
```
const computeSquare = inngest.createFunction(
  { id: "compute-square" },
  { event: "calculate/square" },
  async ({ event }) => {
    return { result: event.data.number * event.data.number }; // Result typed as { result: number }
  }
);

const mainFunction = inngest.createFunction(
  { id: "main-function" },
  { event: "main/event" },
  async ({ step }) => {
    const square = await step.invoke("compute-square-value", {
      function: computeSquare,
      data: { number: 4 }, // input data is typed, requiring input if it's needed
    });

    return `Square of 4 is ${square.result}.`; // square.result is typed as number
  }
);
```

--------------------------------

TITLE: Invoke Function Directly with step.invoke()
DESCRIPTION: Demonstrates how to call an Inngest function directly from within your event-driven system using `step.invoke()`. This is useful for breaking down complex workflows, leveraging existing functionality, and improving code maintainability.

SOURCE: https://www.inngest.com/docs/functions

LANGUAGE: javascript
CODE:
```
import { inngest } from "./inngest";

export const hello = inngest.createFunction(
  "Hello World",
  "*",
  async ({ step }) => {
    const result = await step.invoke(
      "My Other Function",
      { data: { name: "Inngest" } },
      { metadata: { user: "test" } }
    );
    return `Hello ${result.data.message} world!`;
  }
);

export const myOtherFunction = inngest.createFunction(
  "My Other Function",
  "*",
  async ({ event }) => {
    return { message: `Hello ${event.data.name}` };
  }
);

```

--------------------------------

TITLE: Define Inngest Function with create_function Decorator (Python)
DESCRIPTION: Demonstrates how to define an Inngest function using the `@inngest_client.create_function` decorator. This specifies the function ID and the trigger event it listens for. The function itself is an asynchronous Python function that accepts context and can contain custom logic.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: python
CODE:
```
import inngest

@inngest_client.create_function(
    fn_id="import-product-images",
    trigger=inngest.TriggerEvent(event="shop/product.imported"),
)
async def fn(ctx: inngest.Context):
    # Your function code
```

--------------------------------

TITLE: Create a Basic Inngest Function (TypeScript)
DESCRIPTION: Demonstrates the creation of a simple Inngest function that sends a welcome email when a user is created. This function is inherently reliable and retriable.

SOURCE: https://www.inngest.com/docs/guides/multi-step-functions

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "my-app" });

export default inngest.createFunction(
  { id: "activation-email" },
  { event: "app/user.created" },
  async ({ event }) => {
    await sendEmail({ email: event.user.email, template: "welcome" });
  }
);

```

--------------------------------

TITLE: Invoke a function directly using a function object
DESCRIPTION: This snippet shows how to invoke an Inngest function by passing the function object itself. The Inngest SDK will automatically extract the function's ID.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: javascript
CODE:
```
import { myOtherFunction } from "./myOtherFunction";

await step.invoke(
  myOtherFunction,
  { user: "user-123" } // Optional: arguments to pass to the function
);
```

--------------------------------

TITLE: Referencing and Invoking a Function from Another App
DESCRIPTION: Explains how to create a reference to a function in a different Inngest application, enabling cross-app function calls and maintaining type safety with optional schemas.

SOURCE: https://www.inngest.com/docs/guides/invoking-functions-directly

LANGUAGE: APIDOC
CODE:
```
## POST /api/inngest/functions

### Description
Invokes a specific Inngest function from another application by referencing it. This facilitates building distributed systems where functions can be hosted independently.

### Method
POST

### Endpoint
`/api/inngest/functions`

### Parameters
#### Request Body
- **function** (object) - Required - A reference to the function in another application. This reference should include `appId` and `functionId`, and optionally `schemas` for data and return types.
- **data** (any) - Optional - The input data to pass to the invoked function.

### Request Example
```json
{
  "function": {
    "appId": "my-python-app",
    "functionId": "compute-square",
    "schemas": {
      "data": {"number": "number"},
      "return": {"result": "number"}
    }
  },
  "data": {"number": 4}
}
```

### Response
#### Success Response (200)
- **result** (any) - The return value of the invoked function.

#### Response Example
```json
{
  "result": 16
}
```
```

--------------------------------

TITLE: Inngest Step Functions
DESCRIPTION: Illustrates the various methods available within the Inngest `step` object for managing function execution, including running code, sleeping, invoking other functions, and waiting for events.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: javascript
CODE:
```
step.run() // Run synchronous or asynchronous code as a retriable step
step.sleep() // Sleep for a given amount of time
step.sleepUntil() // Sleep until a given time
step.invoke() // Invoke another Inngest function
step.waitForEvent() // Pause execution until another event is received
step.sendEvent() // Send event(s) reliably within your function
```

--------------------------------

TITLE: Reference Local and Cross-App Functions with Schemas | TypeScript
DESCRIPTION: Demonstrates creating local and cross-application function references using `referenceFunction`. It shows how to define input (`data`) and output (`return`) schemas using Zod for type safety when calling functions in different applications.

SOURCE: https://www.inngest.com/docs/functions/references

LANGUAGE: TypeScript
CODE:
```
// @/inngest/compute.ts
import { referenceFunction } from "inngest";
import { z } from "zod";
import { type computePi } from "@/inngest/computePi";

// Create a local reference to a function without importing dependencies
export const computePi = referenceFunction<typeof computePi>({
  functionId: "compute-pi",
});

// Create a reference to a function in another application
export const computeSquare = referenceFunction({
  appId: "my-python-app",
  functionId: "compute-square",
  // Schemas are optional, but provide types for your call if specified
  schemas: {
    data: z.object({
      number: z.number(),
    }),
    return: z.object({
      result: z.number(),
    }),
  },
});
```

--------------------------------

TITLE: Using Function References
DESCRIPTION: Explanation and examples of using function references with referenceFunction() to call Inngest functions, especially those in other apps or to avoid dependency imports.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: APIDOC
CODE:
```
## Using Function References

### Description
Instead of directly importing a local function to invoke, `referenceFunction()` can be used to call an Inngest function located in another app, or to avoid importing the dependencies of a function within the same app.

### Examples

#### Create a local reference
```typescript
import { referenceFunction } from "inngest";
import { type computePi } from "@/inngest/computePi";

// Create a local reference to a function without importing dependencies
const computePi = referenceFunction<typeof computePi>({
  functionId: "compute-pi",
});
```

#### Create a reference to a function in another application
```typescript
// Create a reference to a function in another application
const computeSquare = referenceFunction({
  appId: "my-python-app",
  functionId: "compute-square",
});

// square.result is typed as a number
const square = await step.invoke("compute-square-value", {
  function: computePi, // Using the locally referenced function
  data: { number: 4 }, // input data is typed, requiring input if it's needed
});
```

See Referencing functions for more information.
```

--------------------------------

TITLE: Invoke a function using a function reference
DESCRIPTION: Example of invoking a function using a reference created with referenceFunction().

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: APIDOC
CODE:
```
## `step.invoke()` - Function Reference Call

### Description
This example shows how to invoke a function using a reference generated with the `referenceFunction()` utility.

### Endpoint
N/A (Internal SDK method)

### Request Example
```typescript
const resultFromReference = await step.invoke("invoke-by-reference", {
  function: referenceFunction(...),
  data: { ... },
});
```

### Response Example
```typescript
// The result from the invoked function
```
```

--------------------------------

TITLE: Assert function output using context
DESCRIPTION: Asserts function output based on the context (inputs) provided to the function, such as `event` or `runId`. This demonstrates how to verify that middleware or initial data affects the function's behavior.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
const { ctx, result } = await t.execute();
expect(result).toEqual(`Run ID was: "${ctx.runId}"`);
```

--------------------------------

TITLE: Invoke a function directly using its ID
DESCRIPTION: This snippet demonstrates how to invoke an Inngest function directly by providing its unique ID. The SDK automatically retrieves the function's ID if a function object is passed.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: javascript
CODE:
```
await step.invoke(
  "my/other-function-id",
  { user: "user-123" } // Optional: arguments to pass to the function
);
```

--------------------------------

TITLE: Invoke a function directly - TypeScript
DESCRIPTION: Shows how to invoke a function by providing its definition directly within the `step.invoke` options.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: typescript
CODE:
```
const resultFromDirectCall = await step.invoke("invoke-by-definition", {
  function: anotherFunction,
  data: { ... },
});
```

--------------------------------

TITLE: Inngest Function Context (`ctx`)
DESCRIPTION: The `ctx` object provides essential information and utilities during function execution.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: APIDOC
CODE:
```
## `ctx` Object

### Description
The `ctx` object provides essential information and utilities during function execution.

### Properties

- **`attempt`** (int) - The current zero-indexed attempt number for this function execution. Incremented on retries.
- **`event`** (Event) - The event payload object that triggered the function run. Matches the payload sent with `inngest.send()`.
  - **`data`** (dict[str, object]) - The event payload data.
  - **`id`** (str) - The unique identifier for the event.
  - **`name`** (str) - The name of the event.
  - **`ts`** (int) - Time (Unix millis) the event was received by the Inngest server.
- **`events`** (list[Event]) - A list of event objects, accessible when `batch_events` is configured. If not batched, contains a single event.
- **`logger`** (logging.Logger) - A proxy object around the provided or default logger.
- **`run_id`** (str) - The unique ID for the function run, useful for logging and dashboard lookups.
```

--------------------------------

TITLE: Cross-App Function Reference | TypeScript
DESCRIPTION: Demonstrates how to reference and invoke an Inngest function residing in a different application by specifying both `functionId` and `appId`.

SOURCE: https://www.inngest.com/docs/functions/references

LANGUAGE: TypeScript
CODE:
```
import { referenceFunction } from "inngest";

await step.invoke("start-process", {
  function: referenceFunction({
    functionId: "some-fn",
    appId: "some-app",
  }),
});
```

--------------------------------

TITLE: Deploy Inngest to DigitalOcean Functions
DESCRIPTION: This example shows how to serve Inngest functions within DigitalOcean serverless functions. It requires explicitly providing the function's public URL and path to the `serve` function.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/digitalocean";
import { inngest } from "./src/inngest/client";
import fnA from "./src/inngest/fnA"; // Your own function

const main = serve({
  client: inngest,
  functions: [fnA],
  // Your digitalocean hostname.  This is required otherwise your functions won't work.
  serveHost: "https://faas-sfo3-your-url.doserverless.co",
  // And your DO path, also required.
  servePath: "/api/v1/web/fn-your-uuid/inngest",
});

// IMPORTANT: Makes the function available as a module in the project.
// This is required for any functions that require external dependencies.
module.exports.main = main;
```

--------------------------------

TITLE: Basic Local Function Reference | TypeScript
DESCRIPTION: Illustrates the simplest usage of `referenceFunction` to invoke a local Inngest function by its `functionId`. The input and output types are inferred as `unknown` in this basic case.

SOURCE: https://www.inngest.com/docs/functions/references

LANGUAGE: TypeScript
CODE:
```
import { referenceFunction } from "inngest";

await step.invoke("start-process", {
  function: referenceFunction({
    functionId: "some-fn",
  }),
});
```

--------------------------------

TITLE: Referencing Functions with Inngest SDK
DESCRIPTION: Examples demonstrating how to use `referenceFunction` to call Inngest functions, including local and cross-app references with optional schema definitions.

SOURCE: https://www.inngest.com/docs/functions/references

LANGUAGE: APIDOC
CODE:
```
## Local Function Reference

### Description
Reference a function within the same Inngest app without importing its dependencies directly. This is useful for managing dependencies, especially in frameworks like Next.js.

### Method
`step.invoke(name, options)`

### Endpoint
N/A (Internal SDK Call)

### Parameters
#### Request Body (for `step.invoke`)
- **function** (object) - Required - An object created by `referenceFunction` specifying the function to invoke.
  - **functionId** (string) - Required - The ID of the function to reference.
- **data** (any) - Required - The input data for the referenced function.

### Request Example
```typescript
import { referenceFunction } from "inngest";
import { type computePi } from "@/inngest/computePi";

const computePi = referenceFunction<typeof computePi>({
  functionId: "compute-pi",
});

await step.invoke("compute-pi-value", {
  function: computePi,
  data: { /* input data */ },
});
```

## Cross-App Function Reference

### Description
Reference and invoke a function that resides in a different Inngest application.

### Method
`step.invoke(name, options)`

### Endpoint
N/A (Internal SDK Call)

### Parameters
#### Request Body (for `step.invoke`)
- **function** (object) - Required - An object created by `referenceFunction` specifying the function to invoke.
  - **appId** (string) - Required - The ID of the application where the function resides.
  - **functionId** (string) - Required - The ID of the function to reference.
  - **schemas** (object) - Optional - Zod schemas for validating input `data` and output `return`.
    - **data** (zod schema) - Optional - Schema for the input data.
    - **return** (zod schema) - Optional - Schema for the function's return value.

### Request Example
```typescript
import { referenceFunction } from "inngest";
import { z } from "zod";

const computeSquare = referenceFunction({
  appId: "my-python-app",
  functionId: "compute-square",
  schemas: {
    data: z.object({ number: z.number() }),
    return: z.object({ result: z.number() }),
  },
});

await step.invoke("compute-square-value", {
  function: computeSquare,
  data: { number: 4 },
});
```

## Schema Configuration for Referencing

### Description
Provides type safety and optional validation for the `data` and `return` payloads when invoking referenced functions using Zod schemas.

### Method
`referenceFunction({ ..., schemas: { data, return } })`

### Endpoint
N/A (Internal SDK Call)

### Parameters
#### Schemas Object
- **data** (zod schema) - Optional - The Zod schema for the input `data` payload.
- **return** (zod schema) - Optional - The Zod schema for the function's return value.

### Request Example
```typescript
import { referenceFunction } from "inngest";
import { z } from "zod";

await step.invoke("start-process", {
  function: referenceFunction({
    functionId: "some-fn",
    appId: "some-app",
    schemas: {
      data: z.object({ foo: z.string() }),
      return: z.object({ success: z.boolean() }),
    },
  }),
});
```

## Configuration Details for `referenceFunction`

### Description
Details on the properties accepted by the `referenceFunction` configuration object.

### Method
`referenceFunction(config)`

### Endpoint
N/A (Internal SDK Call)

### Parameters
#### `config` Object
- **functionId** (string) - Required - The ID of the function to reference. Can be local or from another app.
- **appId** (string) - Optional - The ID of the app if referencing a function in a different app. Defaults to the current app's ID if not provided.
- **schemas** (object) - Optional - An object containing Zod schemas for `data` and `return`.
  - **data** (zod schema) - Optional - Schema for input data validation and typing.
  - **return** (zod schema) - Optional - Schema for return value validation and typing.

### Request Example (Type-only Reference)
```typescript
import { referenceFunction } from "inngest";
import { type someInngestFn } from "@/inngest/someFn";

await step.invoke("start-process", {
  function: referenceFunction<typeof someInngestFn>({
    functionId: "some-fn",
  }),
});
```
```

--------------------------------

TITLE: Inngest `step` Object Methods
DESCRIPTION: The 'step' object provides methods to interact with the Inngest platform, allowing execution of functions, sending events, and managing delays. It supports both synchronous and asynchronous function calls.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: python
CODE:
```
from typing import Callable

class SyncStep:
    run: Callable
    send_event: Callable
    sleep: Callable
    sleep_until: Callable
    _experimental_parallel: Callable

class Step(SyncStep):
    pass # Async methods would be here
```

--------------------------------

TITLE: Function Reference with Zod Schemas | TypeScript
DESCRIPTION: Shows how to provide Zod schemas for both the input `data` and the `return` value when referencing a function. This enhances type safety and prepares for future input/output validation.

SOURCE: https://www.inngest.com/docs/functions/references

LANGUAGE: TypeScript
CODE:
```
import { referenceFunction } from "inngest";
import { z } from "zod";

await step.invoke("start-process", {
  function: referenceFunction({
    functionId: "some-fn",
    appId: "some-app",
    schemas: {
      data: z.object({
        foo: z.string(),
      }),
      return: z.object({
        success: z.boolean(),
      }),
    },
  }),
});
```

--------------------------------

TITLE: Define Fan-out Functions with Inngest (TypeScript)
DESCRIPTION: This snippet defines two Inngest functions, 'sendWelcomeEmail' and 'startStripeTrial', both triggered by the 'app/user.signup' event. Each function performs a distinct task, showcasing the fan-out pattern where multiple independent functions are executed from a single event.

SOURCE: https://www.inngest.com/docs/guides/fan-out-jobs

LANGUAGE: TypeScript
CODE:
```
const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email' },
  { event: 'app/user.signup' },
  async ({ event, step }) => {
    await step.run('send-email', async () => {
      await sendEmail({ email: event.data.user.email, template: 'welcome');
    });
  }
)

const startStripeTrial = inngest.createFunction(
  { id: 'start-stripe-trial' },
  { event: 'app/user.signup' },
  async ({ event }) => {
    const customer = await step.run('create-customer', async () => {
      return await stripe.customers.create({ email: event.data.user.email });
    });
    await step.run('create-subscription', async () => {
      return await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: 'price_1MowQULkdIwHu7ixraBm864M' }],
        trial_period_days: 14,
      });
    });
  }
)
```

--------------------------------

TITLE: Reference and Invoke Remote Inngest Function (TypeScript)
DESCRIPTION: Shows how to create a reference to an Inngest function in another application using `referenceFunction`. This allows invoking remote functions as if they were local, with optional schema validation for data and return types.

SOURCE: https://www.inngest.com/docs/guides/invoking-functions-directly

LANGUAGE: typescript
CODE:
```
// @/inngest/computeSquare.ts
import { referenceFunction } from "inngest";
import { z } from "zod";

// Create a reference to a function in another application.
export const computeSquare = referenceFunction({
  appId: "my-python-app",
  functionId: "compute-square",
  // Schemas are optional, but provide types for your call if specified
  schemas: {
    data: z.object({
      number: z.number(),
    }),
    return: z.object({
      result: z.number(),
    }),
  },
});


```

LANGUAGE: typescript
CODE:
```
import { computeSquare } from "@/inngest/computeSquare";

// square.result is typed as a number
const square = await step.invoke("compute-square-value", {
  function: computeSquare,
  data: { number: 4 }, // input data is typed, requiring input if it's needed
});


```

--------------------------------

TITLE: Handler Function Signature
DESCRIPTION: Illustrates the basic signature for an Inngest function handler.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: APIDOC
CODE:
```
## Handler

```python
@inngest_client.create_function(
    # Function options
)
async def fn(ctx: inngest.Context):
    # Function code
```

**Note**: Scheduled functions using a `cron` trigger will not receive an `event` argument.
```

--------------------------------

TITLE: Invoke a function directly
DESCRIPTION: Example of invoking a function by passing its definition directly to step.invoke().

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: APIDOC
CODE:
```
## `step.invoke()` - Direct Function Call

### Description
This example demonstrates how to invoke a function by passing its definition directly to the `step.invoke()` method.

### Endpoint
N/A (Internal SDK method)

### Request Example
```typescript
const resultFromDirectCall = await step.invoke("invoke-by-definition", {
  function: anotherFunction,
  data: { ... },
});
```

### Response Example
```typescript
// The result from the invoked function
```
```

--------------------------------

TITLE: Execute function and assert result
DESCRIPTION: Executes the Inngest function and asserts its successful completion by checking the returned result. This method runs the entire function, including all steps.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
test("returns a greeting", async () => {
  const { result } = await t.execute();
  expect(result).toEqual("Hello World!");
});
```

--------------------------------

TITLE: Invoke Referenced Function with Data | TypeScript
DESCRIPTION: Shows how to invoke a previously referenced function (`computeSquare`) using `step.invoke`. It demonstrates passing typed input data and accessing the typed result.

SOURCE: https://www.inngest.com/docs/functions/references

LANGUAGE: TypeScript
CODE:
```
// @/inngest/someFn.ts
import { computeSquare } from "@/inngest/compute"; // import the referenece

// square.result is typed as a number
const square = await step.invoke("compute-square-value", {
  function: computeSquare,
  data: { number: 4 }, // input data is typed, requiring input if it's needed
});
```

--------------------------------

TITLE: Inngest Function Logging Example (TypeScript)
DESCRIPTION: Demonstrates logging within an Inngest function, highlighting the difference between logs outside and inside a `step.run` function. Logs outside `step.run` might execute multiple times, while logs inside execute once.

SOURCE: https://www.inngest.com/docs/guides/logging

LANGUAGE: typescript
CODE:
```
async ({ event, step }) => {
  logger.info("something") // this can be run three times

  await step.run("fn", () => {
    logger.info("something else") // this will always be run once
  })

  await step.run(...)
}
```

--------------------------------

TITLE: Deferring Small Steps with step.defer
DESCRIPTION: Introduces the `step.defer` functionality for executing small, asynchronous tasks after results are sent to users. This helps improve responsiveness by offloading background work.

SOURCE: https://www.inngest.com/docs/learn/rest-endpoints

LANGUAGE: javascript
CODE:
```
step.defer
```

--------------------------------

TITLE: Function Handler
DESCRIPTION: The core logic of your Inngest function, executed when triggered. Receives event data, step utilities, and execution context.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## Function Handler

### Description
The handler contains the code that executes when a function's trigger conditions are met. It receives several arguments for interacting with the Inngest environment and event data.

### Handler Signature

```javascript
function handler({ event, events, step, runId, logger, attempt }) {
  // Function logic here
}
```

### Handler Arguments

*   **`event`** (object)
    *   Description: The event payload object that triggered the function run. For cron triggers, this will be null.
    *   Example:
        ```json
        {
          "name": "app/account.created",
          "data": {
            "userId": "1234567890"
          },
          "v": "2023-05-12.1",
          "ts": 1683898268584
        }
        ```

*   **`events`** (array, v2.2.0+)
    *   Description: An array of event payload objects. Only available if `batchEvents` is configured for the function. Otherwise, it contains a single event.

*   **`step`** (object)
    *   Description: An object with methods to define retriable steps, sleep, invoke other functions, wait for events, and send events reliably.
    *   Methods:
        *   `run()`: Execute synchronous or asynchronous code as a step.
        *   `sleep(duration)`: Pause execution for a specified duration.
        *   `sleepUntil(timestamp)`: Pause execution until a specific time.
        *   `invoke(functionName, args)`: Call another Inngest function.
        *   `waitForEvent(eventMatcher)`: Pause until a specific event is received.
        *   `sendEvent(events)`: Reliably send events from within the function.

*   **`runId`** (string)
    *   Description: The unique identifier for the current function execution.

*   **`logger`** (object, v2.0.0+)
    *   Description: An object with logging methods (`info`, `warn`, `error`, `debug`) for recording information during function execution.
    *   Example:
        ```javascript
        logger.info('Processing event:', event);
        ```

*   **`attempt`** (number, v2.5.0+)
    *   Description: The zero-indexed number of the current execution attempt for this function run. Incremented on retries.
```

--------------------------------

TITLE: Create Function with createFunction
DESCRIPTION: This snippet demonstrates how to define an Inngest function using the `createFunction` method, specifying its configuration, trigger event, and handler logic.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## POST /createFunction

### Description
Defines and creates an Inngest function with specified configuration, trigger, and handler.

### Method
POST

### Endpoint
/createFunction

### Parameters
#### Request Body
- **configuration** (object) - Required - Configuration for the function, including an `id`.
- **trigger** (object) - Required - Defines the event that triggers the function.
- **handler** (function) - Required - The asynchronous function to execute when the trigger event occurs.

### Request Example
```json
{
  "configuration": {
    "id": "import-product-images"
  },
  "trigger": {
    "event": "shop/product.imported"
  },
  "handler": "async ({ event, step, runId }) => {\n    // Your function code\n  }"
}
```

### Response
#### Success Response (200)
- **InngestFunction** (object) - Returns the created Inngest function object.

#### Response Example
```json
{
  "message": "Function created successfully"
}
```
```

--------------------------------

TITLE: Inngest Function with Logger Usage (TypeScript)
DESCRIPTION: Shows how to use the `logger` object provided by Inngest within a function. It logs information, a warning during a step, and returns a success status.

SOURCE: https://www.inngest.com/docs/guides/logging

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "my-awesome-function" },
  { event: "func/awesome" },
  async ({ event, step, logger }) => {
    logger.info("starting function", { metadataKey: "metadataValue" });

    const val = await step.run("do-something", () => {
      if (somethingBadHappens) logger.warn("something bad happened");
    });

    return { success: true, event };
  }
);
```

--------------------------------

TITLE: Shorthand Function Creation Removed (v3 vs v2)
DESCRIPTION: Highlights the removal of shorthand function creation in v3. An object is now required for function configuration, replacing the previous string-based arguments.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "send-welcome-email", name: "Send welcome email" },
  { event: "app/user.created" },
  async () => {
    // ...
  }
);
```

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  "Send welcome email",
  "app/user.created",
  async () => {
    // ...
  }
);
```

--------------------------------

TITLE: Create a Basic Inngest Function in TypeScript
DESCRIPTION: Defines an Inngest function with an ID and an event trigger. The handler includes two sequential steps: copying images to S3 and resizing them. Each step is wrapped for automatic retries on failure.

SOURCE: https://www.inngest.com/docs/learn/inngest-functions

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export default inngest.createFunction(
  // config
  { id: "import-product-images" },
  // trigger (event or cron)
  { event: "shop/product.imported" },
  // handler function
  async ({ event, step }) => {
    // Here goes the business logic
    // By wrapping code in steps, it will be retried automatically on failure
    const s3Urls = await step.run("copy-images-to-s3", async () => {
      return copyAllImagesToS3(event.data.imageURLs);
    });
    // You can include numerous steps in your function
    await step.run('resize-images', async () => {
      await resizer.bulk({ urls: s3Urls, quality: 0.9, maxWidth: 1024 });
    })
  }
);


```

--------------------------------

TITLE: Inngest Function Configuration
DESCRIPTION: Configuration options for an Inngest function.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: APIDOC
CODE:
```
## Inngest Function Configuration API

### Description
This section details the configuration options for an Inngest function, allowing customization of event consumption, cancellation, debouncing, and rate limiting.

### Method
N/A (Configuration object within function definition)

### Endpoint
N/A

### Parameters
#### Request Body (Conceptual)
- **fn_id** (str) - Required - A unique identifier for your function. This should not change between deploys.
- **name** (str) - Optional - A name for your function. If defined, this will be shown in the UI as a friendly display name instead of the ID.
- **batch_events** (Batch) - Optional - Configure how the function should consume batches of events.
  - **max_size** (int) - Required - The maximum number of events a batch can have. Current limit is `100`.
  - **timeout** (int) - Required - How long to wait before invoking the function with the batch even if it's not full. Current permitted values are between 1 second and 1 minute. If you pass an `int` then it'll be interpreted in milliseconds.
- **cancel** (Cancel) - Optional - Define an event that can be used to cancel a running or sleeping function.
  - **event** (str) - Required - The event name which will be used to cancel.
  - **if_exp** (str) - Optional - A match expression using arbitrary event data. For example, `event.data.user_id == async.data.user_id` will only match events whose `data.user_id` matches the original trigger event's `data.user_id`.
  - **timeout** (int | datetime.timedelta) - Optional - The amount of time to wait to receive the cancelling event. If you pass an `int` then it'll be interpreted in milliseconds.
- **debounce** (Debounce) - Optional - Options to configure function debounce.
  - **key** (str) - Optional - A unique key expression to apply the debounce to. The expression is evaluated for each triggering event.
  - **period** (int | datetime.timedelta) - Required - The time period of which to set the limit. The period begins when the first matching event is received.
- **on_failure** (function) - Optional - A function that will be called only when this Inngest function fails after all retries have been attempted.
- **priority** (Priority) - Optional - Configure function run prioritization.
  - **run** (string) - Optional - An expression which must return an integer between -600 and 600 (by default), with higher return values resulting in a higher priority.
- **rate_limit** (RateLimit) - Optional - Options to configure how to rate limit function execution.
  - **key** (str) - Optional - A unique key expression to apply the limit to. The expression is evaluated for each triggering event.
  - **limit** (int) - Required - The maximum number of functions to run in the given time period.
  - **period** (int | datetime.timedelta) - Required - The time period of which to set the limit. The period begins when the first matching event is received.

### Request Example
```json
{
  "fn_id": "my-unique-function-id",
  "name": "My Awesome Function",
  "batch_events": {
    "max_size": 50,
    "timeout": 60000
  },
  "cancel": {
    "event": "cancel-my-function",
    "if_exp": "event.data.user_id == async.data.user_id"
  },
  "debounce": {
    "key": "'event.data.customer_id'",
    "period": 300000
  },
  "rate_limit": {
    "key": "'event.data.account_id'",
    "limit": 10,
    "period": 3600000
  }
}
```

### Response
N/A (This describes configuration, not a direct API response)

#### Success Response (Conceptual)
N/A

#### Response Example (Conceptual)
N/A
```

--------------------------------

TITLE: Execute Inngest Steps within a Go REST Endpoint
DESCRIPTION: Configure and run Inngest steps directly within a Go HTTP handler. This example shows how to configure the function ID and execute an authentication step.

SOURCE: https://www.inngest.com/docs/learn/rest-endpoints

LANGUAGE: go
CODE:
```
import (
	"context"
	"net/http"

	"github.com/inngest/inngestgo/step"
	"github.com/inngest/inngestgo/stephttp"
)

func handleUsers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	stephttp.Configure(ctx, stephttp.FnOpts{
		// Configure the function ID, removing IDs from the URL:
		ID: "/users/{id}"
	})

	// Step 1: Authenticate (with full observability)
	auth, err := step.Run(ctx, "authenticate", func(ctx context.Context) (*AuthResult, error) {
		// You can chain steps as usual...
		return nil, nil
	})
	if err != nil {
		http.Error(w, "Authentication failed", http.StatusUnauthorized)
		return
	}
	// ...
}

```

--------------------------------

TITLE: Invoke Local Function via Reference (TypeScript)
DESCRIPTION: Illustrates invoking a local Inngest function without direct import by using `referenceFunction` with only the `functionId`. This is useful in environments like Next.js where dependency management between serverless functions is crucial.

SOURCE: https://www.inngest.com/docs/guides/invoking-functions-directly

LANGUAGE: typescript
CODE:
```
import { inngest, referenceFunction } from "inngest";
import { type computeSquare } from "@/inngest/computeSquare"; // Import only the type

const mainFunction = inngest.createFunction(
  { id: "main-function" },
  { event: "main/event" },
  async ({ step }) => {
    const square = await step.invoke("compute-square-value", {
      function: referenceFunction<typeof computeSquare>({
        functionId: "compute-square",
      }),
      data: { number: 4 }, // input data is still typed
    });

    return `Square of 4 is ${square.result}.`; // square.result is typed as number
  }
);


```

--------------------------------

TITLE: Create Inngest Function with Retriable Steps (TypeScript)
DESCRIPTION: Demonstrates how to create an Inngest Function using the TypeScript SDK. It shows how to wrap asynchronous operations within `step.run` to enable automatic retries and idempotency. The `step.run` function takes a unique identifier for the step and an async function to execute, saving its result for subsequent calls.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "sync-systems" },
  { event: "auto/sync.request" },
  async ({ step }) => {
    // By wrapping code in step.run, the code will be retried if it throws an error and when successfuly.
    // It's result is saved to prevent unnecessary re-execution
    const data = await step.run("get-data", async () => {
      return getDataFromExternalSource();
    });

    // Can also be retried up to 4 times
    await step.run("save-data", async () => {
      return db.syncs.insertOne(data);
    });
  },
);

```

--------------------------------

TITLE: Function Configuration Options
DESCRIPTION: Details on the available options for configuring Inngest functions, such as retries, throttling, and idempotency.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: APIDOC
CODE:
```
## Function Configuration

### `retries`

- **Type**: `int`
- **Required**: `optional`
- **Description**: Configure the number of times the function will be retried from `0` to `20`. Default: `4`

### `throttle`

- **Type**: `Throttle` (object)
- **Required**: `optional`
- **Description**: Options to configure how to throttle function execution.
  - **`count`** (int) - Required: `required` - The maximum number of functions to run in the given time period.
  - **`key`** (str) - Required: `optional` - A unique key expression to apply the limit to. The expression is evaluated for each triggering event.
  - **`period`** (int | datetime.timedelta) - Required: `required` - The time period of which to set the limit. The period begins when the first matching event is received.

### `idempotency`

- **Type**: `string`
- **Required**: `optional`
- **Description**: A key expression used to prevent duplicate events from triggering a function more than once in 24 hours.

### `trigger`

- **Type**: `TriggerEvent` | `TriggerCron` | `list[TriggerEvent | TriggerCron]`
- **Required**: `required`
- **Description**: What should trigger the function to run. Either an event or a cron schedule. Use a list to specify multiple triggers.
```

--------------------------------

TITLE: Initialize InngestTestEngine and test function
DESCRIPTION: Initializes the InngestTestEngine with the function to be tested. This setup is compatible with Jest and allows for mocking function state, step tooling, and inputs.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
import { InngestTestEngine } from "@inngest/test";
import { helloWorld } from "./helloWorld";

describe("helloWorld function", () => {
  const t = new InngestTestEngine({
    function: helloWorld,
  });
});
```

--------------------------------

TITLE: Function Triggers
DESCRIPTION: Defines how a function is invoked. Supports event-based triggers with optional filtering and cron-based triggers with timezone support.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## Function Triggers

### Description
Specify how a function should be triggered. You can use `event` triggers, `cron` triggers, or a combination of up to 10 triggers.

### Triggers

*   **`event`** (string, optional)
    *   Description: The name of the event that will trigger this function to run.
    *   Options:
        *   **`if`** (string, optional): A CEL expression to filter events. Example: `'event.data.action == "published"'`.

*   **`cron`** (string, optional)
    *   Description: A cron schedule string. Can include an optional timezone prefix, e.g., `TZ=Europe/Paris 0 12 * * 5`.

### Example Usage

```json
{
  "triggers": [
    {
      "event": "user.signed_up",
      "if": "event.data.plan == 'free'"
    },
    {
      "cron": "0 8 * * 1-5"
    }
  ]
}
```
```

--------------------------------

TITLE: Referencing Local Functions Without Direct Import
DESCRIPTION: Illustrates how to use `referenceFunction` to invoke local functions, particularly useful in environments like Next.js where edge and serverless handlers might have different dependencies.

SOURCE: https://www.inngest.com/docs/guides/invoking-functions-directly

LANGUAGE: APIDOC
CODE:
```
## POST /api/inngest/functions

### Description
Invokes a local Inngest function using a reference, without requiring a direct import of the function's implementation. This is beneficial for managing dependencies in hybrid environments.

### Method
POST

### Endpoint
`/api/inngest/functions`

### Parameters
#### Request Body
- **function** (object) - Required - A reference to the local function, specifying `functionId`. The type of the function can be provided for type safety.
- **data** (any) - Optional - The input data to pass to the invoked function.

### Request Example
```json
{
  "function": {
    "functionId": "compute-square"
  },
  "data": {"number": 4}
}
```

### Response
#### Success Response (200)
- **result** (any) - The return value of the invoked function.

#### Response Example
```json
{
  "result": 16
}
```
```

--------------------------------

TITLE: Invoke Inngest Function (Python)
DESCRIPTION: Demonstrates how to call another Inngest function using `ctx.step.invoke`. This method waits for the invoked function's completion and returns its output. It can be used to orchestrate workflows across different functions or services.

SOURCE: https://www.inngest.com/docs/reference/python/steps/invoke

LANGUAGE: python
CODE:
```
@inngest_client.create_function(
    fn_id="fn-1",
    trigger=inngest.TriggerEvent(event="app/fn-1"),
)
async def fn_1(ctx: inngest.Context) -> None:
    return "Hello!"

@inngest_client.create_function(
    fn_id="fn-2",
    trigger=inngest.TriggerEvent(event="app/fn-2"),
)
async def fn_2(ctx: inngest.Context) -> None:
    output = await ctx.step.invoke(
        "invoke",
        function=fn_1,
    )

    # Prints "Hello!"
    print(output)

```

--------------------------------

TITLE: Multiple Triggers Example (Python)
DESCRIPTION: Demonstrates how to define a function with multiple Inngest trigger events. This allows a single function to respond to different event types, such as 'shop/product.imported' and 'shop/product.updated'.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: python
CODE:
```
import inngest

@inngest_client.create_function(
    fn_id="import-product-images",
    trigger=[
      inngest.TriggerEvent(event="shop/product.imported"),
      inngest.TriggerEvent(event="shop/product.updated"),
    ],
)
async def fn(ctx: inngest.Context):
    # Your function code
```

--------------------------------

TITLE: Inngest Function with Steps
DESCRIPTION: Defines an Inngest function named 'import-contacts' that processes uploaded CSV files. It uses `step.run()` to execute distinct operations like parsing CSV, normalizing data, and importing contacts, ensuring each step can be retried independently.

SOURCE: https://www.inngest.com/docs/learn/how-functions-are-executed

LANGUAGE: javascript
CODE:
```
const fn = inngest.createFunction(
  { id: "import-contacts" },
  { event: "contacts/csv.uploaded" },
  // The function handler:
  async ({ event, step }) => {
    const rows = await step.run("parse-csv", async () => {
      return await parseCsv(event.data.fileURI);
    });

    const normalizedRows = await step.run("normalize-raw-csv", async () => {
      const normalizedColumnMapping = getNormalizedColumnNames();
      return normalizeRows(rows, normalizedColumnMapping);
    });

    const results = await step.run("input-contacts", async () => {
      return await importContacts(normalizedRows);
    });

    return { results };
  }
);

```

--------------------------------

TITLE: Inngest Function with Steps (TypeScript)
DESCRIPTION: Example of creating an Inngest Function using the TypeScript SDK, demonstrating the use of `step.run` for executing code blocks that can be retried and have their results memoized.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows

LANGUAGE: APIDOC
CODE:
```
## POST /functions/create

### Description
Creates an Inngest Function with defined steps for workflow execution.

### Method
POST

### Endpoint
/functions/create

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the Inngest Function.
- **event** (object) - Required - Defines the event that triggers the function. Example: `{ event: "auto/sync.request" }`.
- **handler** (function) - Required - The asynchronous function handler that contains the workflow logic using Inngest Steps.

### Request Example
```json
{
  "id": "sync-systems",
  "event": {"event": "auto/sync.request"},
  "handler": "async ({ step }) => { ... }"
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message that the function was created.

#### Response Example
```json
{
  "message": "Function 'sync-systems' created successfully."
}
```

## Using Inngest Steps

### Description
Demonstrates how to use `step.run` within an Inngest Function to execute code that benefits from Inngest's durable execution capabilities, including automatic retries and memoization.

### Method
N/A (part of function execution)

### Endpoint
N/A (part of function execution)

### Parameters
#### Request Body (within function handler)
- **step.run(stepId, asyncFunction)**
  - **stepId** (string) - Required - A unique identifier for this specific step within the function.
  - **asyncFunction** (function) - Required - An async function containing the code to be executed. This function will be retried if it throws an error, and its result will be cached.

### Request Example
```typescript
import { inngest } from './inngest';

// Assume getDataFromExternalSource and db are defined elsewhere
// const getDataFromExternalSource = async () => { ... };
// const db = { syncs: { insertOne: async (data) => { ... } } };

inngest.createFunction(
  { id: "sync-systems" },
  { event: "auto/sync.request" },
  async ({ step }) => {
    // By wrapping code in step.run, the code will be retried if it throws an error and when successful.
    // Its result is saved to prevent unnecessary re-execution
    const data = await step.run("get-data", async () => {
      // Replace with your actual data fetching logic
      console.log('Fetching data...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
      return { id: 1, value: "sample data" };
    });

    // Can also be retried up to 4 times (default is 3)
    await step.run("save-data", async () => {
      // Replace with your actual database operation
      console.log('Saving data...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
      return { success: true };
    }, { retries: 4 });

    return { message: "Sync complete" };
  }
);
```

### Response (from function execution)
#### Success Response (200)
- **message** (string) - Indicates the status of the function execution.

#### Response Example
```json
{
  "message": "Sync complete"
}
```
```

--------------------------------

TITLE: Create Inngest Function in TypeScript
DESCRIPTION: Demonstrates how to create an Inngest Function in TypeScript. It includes setting up an ID, applying throttling with flow control, defining an event trigger, and using steps to execute asynchronous operations like fetching data and saving it to a database. The steps are designed to be retried if they throw errors.

SOURCE: https://www.inngest.com/docs/features/inngest-functions

LANGUAGE: typescript
CODE:
```
inngest.createFunction({
    id: "sync-systems",
    // Easily add Throttling with Flow Control
    throttle: { limit: 3, period: "1min"},
  },
  // A Function is triggered by events
  { event: "auto/sync.request" },
  async ({ step }) => {
    // step is retried if it throws an error
    const data = await step.run("get-data", async () => {
      return getDataFromExternalSource();
    });

    // Steps can reuse data from previous ones
    await step.run("save-data", async () => {
      return db.syncs.insertOne(data);
    });
  }
);
```

--------------------------------

TITLE: Create Inngest Function with TypeScript
DESCRIPTION: Defines an Inngest function using the `createFunction` method. It takes a configuration object, a trigger event, and an asynchronous handler function. The handler receives event details, step execution, and run ID.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export default inngest.createFunction(
  { id: "import-product-images" },
  { event: "shop/product.imported" },
  async ({ event, step, runId }) => {
    // Your function code
  }
);

```

--------------------------------

TITLE: Migrate Inngest Client and Function to v3 (TypeScript)
DESCRIPTION: This snippet shows the v3 syntax for creating an Inngest client and function, including the use of `slugify` for generating IDs. It highlights the requirement for explicit IDs for both the client and functions, and demonstrates how to define event triggers and steps within a function.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
import { Inngest, slugify } from "inngest";
import { serve } from "inngest/next";

const inngest = new Inngest({
  id: "My App",
});

const fn = inngest.createFunction(
  // NOTE: You can manually slug IDs or import slugify to convert names to IDs automatically.
  // { id: "onboarding-example", name: "Onboarding example" },
  { id: slugify("Onboarding example"), name: "Onboarding example" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.run("send-welcome-email", () =>
      sendEmail(event.user.email, "Welcome!")
    );

    const profileCompleted = await step.waitForEvent(
      "wait-for-profile-completion",
      {
        event: "app/user.profile.completed",
        timeout: "1d",
        match: "data.userId",
      }
    );

    await step.sleep("wait-a-moment", "5m");

    if (!profileCompleted) {
      await step.run("send-profile-reminder", () =>
        sendEmail(event.user.email, "Complete your profile!")
      );
    }
  }
);

export default serve({
  client: inngest,
  functions: [fn],
});

```

--------------------------------

TITLE: Execute function and assert error
DESCRIPTION: Executes the Inngest function and asserts that it throws an error. This is useful for testing error handling within the function, returning a serialized error instead of a result.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
test("throws an error", async () => {
  const { error } = await t.execute();
  expect(error).toContain("Some specific error");
});
```

--------------------------------

TITLE: Create a basic Inngest function in TypeScript
DESCRIPTION: This example demonstrates how to create a simple Inngest function with a configuration, an event trigger, and a handler that includes two sequential steps. The steps are designed to be independently retried on failure.

SOURCE: https://www.inngest.com/docs/functions

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export default inngest.createFunction(
  // config
  { id: "import-product-images" },
  // trigger (event or cron)
  { event: "shop/product.imported" },
  // handler function
  async ({ event, step }) => {
    // Here goes the business logic
    // By wrapping code in steps, it will be retried automatically on failure
    const s3Urls = await step.run("copy-images-to-s3", async () => {
      return copyAllImagesToS3(event.data.imageURLs);
    });
    // You can include numerous steps in your function
    await step.run('resize-images', async () => {
      await resizer.bulk({ urls: s3Urls, quality: 0.9, maxWidth: 1024 });
    })
  }
);

```

--------------------------------

TITLE: Basic Inngest Function Execution
DESCRIPTION: Demonstrates a simple Inngest function with multiple steps. It highlights how Inngest re-enters the function for each step, showing the execution flow and the importance of `step.run` for non-deterministic operations.

SOURCE: https://www.inngest.com/docs/guides/working-with-loops

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "simple-function" },
  { event: "test/simple.function" },
  async ({ step }) => {
    console.log("hello");

    await step.run("a", async () => { console.log("a") });
    await step.run("b", async () => { console.log("b") });
    await step.run("c", async () => { console.log("c") });
  }
);

```

LANGUAGE: typescript
CODE:
```
# This is how Inngest executes the code above:

<run start>
"hello"

"hello"
"a"

"hello"
"b"

"hello"
"c"
<run complete>

```

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "simple-function" },
  { event: "test/simple.function" },
  async ({ step }) => {
    await step.run("hello", () => { console.log("hello") });

    await step.run("a", async () => { console.log("a") });
    await step.run("b", async () => { console.log("b") });
    await step.run("c", async () => { console.log("c") });
  }
);

// hello
// a
// b
// c

```

--------------------------------

TITLE: Google Cloud Run Functions Integration
DESCRIPTION: Deploys Inngest functions to Google Cloud Run using the Functions Framework. It leverages the Express-compatible API and requires the `serve` handler from `inngest/express`.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import * as ff from "@google-cloud/functions-framework";
import { serve } from "inngest/express";
import { inngest } from "./src/inngest/client";
import fnA from "./src/inngest/fnA"; // Your own function

ff.http(
  "inngest",
  serve({
    client: inngest,
    functions: [fnA],
    servePath: "/",
  })
);

```

--------------------------------

TITLE: Serve API Handler
DESCRIPTION: The `serve()` API handler is used to serve your application's functions via HTTP. This handler enables Inngest to remotely and securely read your functions' configuration and invoke your function code. This enables you to host your function code on any platform.

SOURCE: https://www.inngest.com/docs/reference/serve

LANGUAGE: APIDOC
CODE:
```
## POST /api/inngest

### Description
Invokes functions with the request body as incoming function state.

### Method
POST

### Endpoint
/api/inngest

### Parameters
#### Request Body
- **client** (Inngest client) - Required - An Inngest client reference.
- **functions** (InngestFunctions[]) - Required - An array of Inngest functions defined using `inngest.createFunction()`.
- **signingKey** (string) - Required - The Inngest Signing Key for your selected environment. Recommended to set as `INNGEST_SIGNING_KEY` environment variable.
- **serveHost** (string) - Optional - The domain host of your application, including protocol (e.g., `https://myapp.com`). Inferred via HTTP headers at runtime, but may be required for platforms like AWS Lambda or reverse proxies. See also `INNGEST_SERVE_HOST`.
- **servePath** (string) - Optional - The path where your `serve` handler is hosted. Inferred via HTTP headers at runtime. Recommended: `/api/inngest`. See also `INNGEST_SERVE_PATH`.
- **streaming** ("allow" | "force" | false) - Optional - Enables streaming responses back to Inngest for maximum serverless function timeouts.
- **logLevel** ("fatal" | "error" | "warn" | "info" | "debug" | "silent") - Optional - The minimum level to log from the Inngest serve endpoint. Defaults to `"info"`. See also `INNGEST_LOG_LEVEL`.
- **baseUrl** (string) - Optional - The URL used to communicate with Inngest. Defaults to: `"https://api.inngest.com/"`.
- **fetch** (Fetch API compatible interface) - Optional - Override the default `fetch` implementation.
- **id** (string) - Optional - The ID to use to represent this application instead of the client's ID.

### Request Example
```json
{
  "client": "YOUR_INNGEST_CLIENT",
  "functions": [
    "YOUR_FUNCTION_1",
    "YOUR_FUNCTION_2"
  ],
  "signingKey": "YOUR_SIGNING_KEY"
}
```

### Response
#### Success Response (200)
- **message** (string) - A success message indicating the functions were invoked.

#### Response Example
```json
{
  "message": "Functions invoked successfully."
}
```
```

--------------------------------

TITLE: Create Inngest Functions with `inngest.createFunction()` (v1)
DESCRIPTION: Shows the recommended way to create Inngest functions in v1 using the `inngest.createFunction()` method. This includes examples for single-step, scheduled, and step functions, emphasizing the use of an Inngest client instance.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
// ✅ Valid in v1
import { Inngest } from "inngest";

// We recommend exporting this from ./src/inngest/client.ts, giving you a
// singleton across your entire app.
export const inngest = new Inngest({ name: "My App" });

const singleStepFn = inngest.createFunction(
  { name: "Single step" },
  { event: "example/single.step" },
  async ({ event, step }) => "..."
);

const scheduledFn = inngest.createFunction(
  { name: "Scheduled" },
  { cron: "0 9 * * MON" },
  async ({ event, step }) => "..."
);

const stepFn = inngest.createFunction(
  { name: "Step function" },
  { event: "example/step.function" },
  async ({ event, step }) => "..."
);

```

--------------------------------

TITLE: Invoke Function
DESCRIPTION: Calls another Inngest function, waits for its completion, and returns its output.

SOURCE: https://www.inngest.com/docs/reference/python/steps/invoke

LANGUAGE: APIDOC
CODE:
```
## POST /functions/{functionId}/invoke

### Description
Calls another Inngest function, waits for its completion, and returns its output.

### Method
POST

### Endpoint
/functions/{functionId}/invoke

### Parameters
#### Path Parameters
- **functionId** (str) - Required - The ID of the function to invoke.

#### Request Body
- **step_id** (str) - Required - Step ID. Should be unique within the function.
- **function** (Function) - Required - The Inngest function to invoke.
- **data** (object) - Optional - JSON-serializable data that will be passed to the invoked function as `event.data`.
- **user** (object) - Optional - JSON-serializable data that will be passed to the invoked function as `event.user`.

### Request Example
```json
{
  "step_id": "invoke_step_1",
  "function": "your_target_function_id",
  "data": {
    "message": "Hello from invoking function"
  },
  "user": {
    "name": "Test User"
  }
}
```

### Response
#### Success Response (200)
- **output** (any) - The output returned by the invoked function.

#### Response Example
```json
{
  "output": "Hello!"
}
```
```

--------------------------------

TITLE: Reference Function to Avoid Dependencies | TypeScript
DESCRIPTION: Illustrates using `referenceFunction` to call a function within the same app without importing its direct dependencies. This is useful for managing dependencies, especially in environments like Next.js.

SOURCE: https://www.inngest.com/docs/functions/references

LANGUAGE: TypeScript
CODE:
```
import { referenceFunction } from "inngest";
import { type someInngestFn } from "@/inngest/someFn"; // import only the type

await step.invoke("start-process", {
  function: referenceFunction<typeof someInngestFn>({
    functionId: "some-fn",
  }),
});
```

--------------------------------

TITLE: Example Inngest Function Failure Event Payload
DESCRIPTION: This JSON object represents the structure of an event triggered when an Inngest function fails. It includes details about the error, the original event that caused the function to run, the function's ID, and the run ID.

SOURCE: https://www.inngest.com/docs/examples/track-failures-in-datadog

LANGUAGE: json
CODE:
```
{
  "name": "inngest/function.failed",
  "data": {
    "error": {
      "__serialized": true,
      "error": "invalid status code: 500",
      "message": "taylor@ok.com is already a list member. Use PUT to insert or update list members.",
      "name": "Error",
      "stack": "Error: taylor@ok.com is already a list member. Use PUT to insert or update list members.\n    at /var/task/.next/server/pages/api/inngest.js:2430:23\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async InngestFunction.runFn (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/components/InngestFunction.js:378:32)\n    at async InngestCommHandler.runStep (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/components/InngestCommHandler.js:459:25)\n    at async InngestCommHandler.handleAction (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/components/InngestCommHandler.js:359:33)\n    at async ServerTiming.wrap (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/helpers/ServerTiming.js:69:21)\n    at async ServerTiming.wrap (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/helpers/ServerTiming.js:69:21)"
    },
    "event": {
      "data": { "billingPlan": "pro" },
      "id": "01H0TPSHZTVFF6SFVTR6E25MTC",
      "name": "user.signup",
      "ts": 1684523501562,
      "user": { "external_id": "6463da8211cdbbcb191dd7da" }
    },
    "function_id": "my-gcp-cloud-functions-app-hello-inngest",
    "run_id": "01H0TPSJ576QY54R6JJ8MEX6JH"
  },
  "id": "01H0TPW7KB4KCR739TG2J3FTHT",
  "ts": 1684523589227
}

```

--------------------------------

TITLE: Inngest Function with fns option (TypeScript v2)
DESCRIPTION: Illustrates the v2 approach to creating an Inngest function using the `fns` option, which wrapped provided functions in `step.run()`. This feature has been removed in favor of middleware in v3.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
import * as actions from "./actions";

const inngest = new Inngest({ name: "My App" });

inngest.createFunction(
  {
    name: "Send welcome email",
    fns: actions,
  },
  { event: "app/user.created" },
  async ({ event, fns }) => {
    const user = await fns.getUserFromDb(event.data.userId);
    await fns.sendWelcomeEmail(user.email);
  }
);
```

--------------------------------

TITLE: Generate Function ID using slugify (TypeScript)
DESCRIPTION: This code snippet demonstrates the use of the `slugify` utility function from the Inngest SDK to generate a URL-friendly ID for an Inngest function. It's recommended to use `slugify` to ensure consistent IDs, especially when migrating from older versions to maintain the continuity of in-progress function runs.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
import { slugify } from "inngest";

const fn = inngest.createFunction(
  { id: slugify("Onboarding Example"), name: "Onboarding Example" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    // ...
  }
);

```

--------------------------------

TITLE: Send Inngest Function Failures to Datadog
DESCRIPTION: This TypeScript function listens for the 'inngest/function.failed' event. Upon failure, it constructs a Datadog event using details from the failed function, such as the error message and function ID, and sends it to the Datadog Events API. It requires the '@datadog/datadog-api-client' package.

SOURCE: https://www.inngest.com/docs/examples/track-failures-in-datadog

LANGUAGE: typescript
CODE:
```
import { client, v1 } from "@datadog/datadog-api-client";
import { inngest } from "./client";

const configuration = client.createConfiguration();
const apiInstance = new v1.EventsApi(configuration);

export default inngest.createFunction(
  {
    name: "Send failures to Datadog",
    id: "send-failed-function-events-to-datadog"
  },
  { event: "inngest/function.failed" },
  async ({ event, step }) => {
    // This is a normal Inngest function, so we can use steps as we normally do:
    await step.run("send-event-to-datadog", async () => {
      const error = event.data.error;

      // Create the Datadog event body using information about the failed function:
      const params: v1.EventsApiCreateEventRequest = {
        body: {
          title: "Inngest Function Failed",
          alert_type: "error",
          text: `The ${event.data.function_id} function failed with the error: ${error.message}`,
          tags: [
            // Add a tag with the Inngest function id:
            `inngest_function_id:${event.data.function_id}`,
          ],
        },
      };

      // Send to Datadog:
      const data = await apiInstance.createEvent(params);

      // Return the data to Inngest for viewing in function logs:
      return { message: "Event sent successfully", data };
    });
  }
);

```

--------------------------------

TITLE: Invoke Function by ID within the Same App (Python)
DESCRIPTION: Demonstrates invoking an Inngest function ('fn-1') by its ID from another function ('fn-2') within the same application. It shows how to pass data and retrieve the output.

SOURCE: https://www.inngest.com/docs/reference/python/steps/invoke_by_id

LANGUAGE: python
CODE:
```
@inngest_client.create_function(
    fn_id="fn-1",
    trigger=inngest.TriggerEvent(event="app/fn-1"),
)
async def fn_1(ctx: inngest.Context) -> str:
    return "Hello!"

@inngest_client.create_function(
    fn_id="fn-2",
    trigger=inngest.TriggerEvent(event="app/fn-2"),
)
async def fn_2(ctx: inngest.Context) -> None:
    output = ctx.step.invoke_by_id(
        "invoke",
        function_id="fn-1",
    )

    # Prints "Hello!"
    print(output)

```

--------------------------------

TITLE: Create function reference for local or remote calls - TypeScript
DESCRIPTION: Shows how to use `referenceFunction()` to create references to Inngest functions, either within the same app or in a different application, without importing their dependencies.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: typescript
CODE:
```
import { referenceFunction } from "inngest";
import { type computePi } from "@/inngest/computePi";

// Create a local reference to a function without importing dependencies
const computePi = referenceFunction<typeof computePi>({
  functionId: "compute-pi",
});

// Create a reference to a function in another application
const computeSquare = referenceFunction({
  appId: "my-python-app",
  functionId: "compute-square",
});

// square.result is typed as a number
const square = await step.invoke("compute-square-value", {
  function: computePi,
  data: { number: 4 }, // input data is typed, requiring input if it's needed
});
```

--------------------------------

TITLE: Inngest Step Execution (`step`)
DESCRIPTION: The `step` object allows you to execute various Inngest platform operations within your function.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: APIDOC
CODE:
```
## `step` Object

### Description
The `step` object provides methods for executing various Inngest platform operations.
If your function is `async`, the type is `Step` and methods should be `await`ed. Otherwise, use `SyncStep`.

### Methods

- **`run`** (Callable) - Executes a function run.
- **`send_event`** (Callable) - Sends an event.
- **`sleep`** (Callable) - Pauses execution for a specified duration.
- **`sleep_until`** (Callable) - Pauses execution until a specific time.
- **`_experimental_parallel`** (CallableVersion) - `0.2.0+` - Executes operations in parallel (experimental).
```

--------------------------------

TITLE: step.sendEvent API
DESCRIPTION: This section details the usage of the step.sendEvent function for sending single or multiple events within an Inngest function.

SOURCE: https://www.inngest.com/docs/reference/functions/step-send-event

LANGUAGE: APIDOC
CODE:
```
## `step.sendEvent(id, eventPayload | eventPayload[]): Promise<{ ids: string[] }>`

### Description
Use `step.sendEvent` to send event(s) reliably within your function. This is especially useful when creating functions that fan-out.

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **id** (string) - Required - The ID of the step. This will be what appears in your function's logs and is used to memoize step state across function versions.
- **eventPayload** (object | object[]) - Required - An event payload object or an array of event payload objects. See the documentation for `inngest.send()` for the event payload format.

### Request Example
```typescript
// Send a single event
await step.sendEvent("send-activation-event", {
  name: "app/user.activated",
  data: { userId: "01H08SEAXBJFJNGTTZ5TAWB0BD" },
});

// Send an array of events
await step.sendEvent("send-invoice-events", [
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e024befa68763f5b500" },
  },
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e08f29fb563c972b1f7" },
  },
]);
```

### Response
#### Success Response (200)
- **ids** (string[]) - An array of Event IDs that were sent. These events can be used to look up the event in the Inngest dashboard or via the REST API.

#### Response Example
```json
{
  "ids": [
    "01HQ8PTAESBZPBDS8JTRZZYY3S",
    "01HQ8PTFYYKDH1CP3C6PSTBZN5"
  ]
}
```
```

--------------------------------

TITLE: Configure Function Run Priority
DESCRIPTION: Example of creating an Inngest function with priority settings based on event data. This allows enterprise accounts to have their runs prioritized.

SOURCE: https://www.inngest.com/docs/reference/functions/run-priority

LANGUAGE: APIDOC
CODE:
```
## POST /functions

### Description
Creates or updates an Inngest function with configurable run priority.

### Method
POST

### Endpoint
/functions

### Parameters
#### Request Body
- **id** (string) - Required - The unique identifier for the function.
- **priority** (object) - Optional - Options to configure how to prioritize functions.
  - **run** (string) - Optional - A CEL expression that returns an integer between -600 and 600 to determine run priority. Higher values mean higher priority.

### Request Example
```json
{
  "id": "ai-generate-summary",
  "priority": {
    "run": "event.data.account_type == 'enterprise' ? 120 : 0"
  }
}
```

### Response
#### Success Response (200)
- **id** (string) - The ID of the created or updated function.
- **priority** (object) - The priority configuration for the function.
  - **run** (string) - The CEL expression used for priority.

#### Response Example
```json
{
  "id": "ai-generate-summary",
  "priority": {
    "run": "event.data.account_type == 'enterprise' ? 120 : 0"
  }
}
```
```

--------------------------------

TITLE: Serve Inngest Functions (TypeScript)
DESCRIPTION: A generic example of serving Inngest functions using the `serve()` handler. This handler adds an API endpoint to your router, exposing your Inngest functions to the Inngest platform. The endpoint should ideally be defined at `/api/inngest` for easier automated deploys.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/astro";
import { functions, inngest } from "../../inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});

```

--------------------------------

TITLE: Invoke a function with a timeout
DESCRIPTION: Example of setting a timeout for a function invocation using step.invoke().

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: APIDOC
CODE:
```
## `step.invoke()` - With Timeout

### Description
This example demonstrates setting a timeout for a function invocation using the `timeout` option in `step.invoke()`.

### Endpoint
N/A (Internal SDK method)

### Request Example
```typescript
const resultFromDirectCall = await step.invoke("invoke-with-timeout", {
  function: anotherFunction,
  data: { ... },
  timeout: "1h",
});
```

### Response Example
```typescript
// The result from the invoked function, or an error if timeout is reached
```
```

--------------------------------

TITLE: Add Prisma Client to Inngest Function Context
DESCRIPTION: This example demonstrates how to add a Prisma client to the context of all Inngest functions using middleware. This allows functions direct access to the Prisma client for database operations, keeping function logic clean. It utilizes the `onFunctionRun` hook and `transformInput` to inject the Prisma instance.

SOURCE: https://www.inngest.com/docs/reference/middleware/examples

LANGUAGE: typescript
CODE:
```
import { PrismaClient } from "@prisma/client";

const prismaMiddleware = new InngestMiddleware({
  name: "Prisma Middleware",
  init() {
    const prisma = new PrismaClient();

    return {
      onFunctionRun(ctx) {
        return {
          transformInput(ctx) {
            return {
              // Anything passed via `ctx` will be merged with the function's arguments
              ctx: {
                prisma,
              },
            };
          },
        };
      },
    };
  },
});
```

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { name: "Example" },
  { event: "app/user.loggedin" },
  async ({ prisma }) => {
    await prisma.auditTrail.create(/* ... */);
  }
);
```

--------------------------------

TITLE: GetStepTools: Typing Inngest Function Step Tools
DESCRIPTION: GetStepTools infers the `step` object available within an Inngest function. It's a utility for accessing step-related functionalities and can be optionally scoped to a specific event trigger.

SOURCE: https://www.inngest.com/docs/typescript

LANGUAGE: typescript
CODE:
```
import { type GetStepTools } from "inngest";
import { inngest } from "@/inngest";

type StepTools = GetStepTools<typeof inngest>;
type StepToolsWithTrigger = GetStepTools<typeof inngest, "app/user.created">;

```

--------------------------------

TITLE: Serve Inngest Functions with Cloudflare Workers (JavaScript)
DESCRIPTION: Configures Inngest functions to run as a Cloudflare Worker. The `inngest/cloudflare`'s `serve()` function is exported as the worker's `fetch` handler. It's recommended to explicitly define the `servePath` for Inngest functions, and the Cloudflare Workers bindings middleware can be used for environment variable passing.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: javascript
CODE:
```
import { serve } from "inngest/cloudflare";
import { inngest } from "./client";
import fnA from "./fnA";

export default {
  fetch: serve({
    client: inngest,
    functions: [fnA],
    // We suggest explicitly defining the path to serve Inngest functions
    servePath: "/api/inngest",
  }),
};

```

--------------------------------

TITLE: Invoke a function with a timeout - TypeScript
DESCRIPTION: Illustrates setting a specific timeout for an invoked function using a string like '1h'. If the timeout is reached, an error is thrown, but the invoked function continues to run.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: typescript
CODE:
```
const resultFromDirectCall = await step.invoke("invoke-with-timeout", {
  function: anotherFunction,
  data: { ... },
  timeout: "1h",
});
```

--------------------------------

TITLE: Function Configuration Options
DESCRIPTION: Defines the various parameters for configuring Inngest functions, such as unique identifiers, naming conventions, concurrency limits, throttling, idempotency, and rate limiting.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## Function Configuration

This section outlines the configuration options for Inngest functions.

### Configuration Options:

- **`id`** (string) - Required - A unique identifier for your function. This should not change between deploys.
- **`name`** (string) - Optional - A name for your function. If defined, this will be shown in the UI as a friendly display name instead of the ID.
- **`concurrency`** (number | object | [object, object]) - Optional - Limit the number of concurrently running functions.
  - **`limit`** (number) - Required - The maximum number of concurrently running steps.
  - **`scope`** ('account' | 'env' | 'fn') - Optional - The scope for the concurrency limit.
    - `fn` (default): only the runs of this function affects the concurrency limit.
    - `env`: all runs within the same environment that share the same evaluated key value will affect the concurrency limit. This requires setting a `key` which evaluates to a virtual queue name.
    - `account`: every run that shares the same evaluated key value will affect the concurrency limit, across every environment. This requires setting a `key` which evaluates to a virtual queue name.
  - **`key`** (string) - Optional - A unique key expression for which to restrict concurrently running steps to.
- **`throttle`** (object) - Optional - Limits the number of new function runs started over a given period of time.
  - **`limit`** (number) - Required - The total number of runs allowed to start within the given `period`.
  - **`period`** (string) - Required - The period within which the `limit` will be applied.
  - **`burst`** (number) - Optional - The number of runs allowed to start in the given window in a single burst.
  - **`key`** (string) - Optional - A unique expression for which to apply the throttle limit to.
- **`idempotency`** (string) - Optional - A key expression which is used to prevent duplicate events from triggering a function more than once in 24 hours.
- **`rateLimit`** (object) - Optional - Options to configure how to rate limit function execution.
  - **`limit`** (number) - Required - The maximum number of functions to run in the given time period.
  - **`period`** (string) - Required - The time period of which to set the limit.
  - **`key`** (string) - Optional - A unique key expression to apply the limit to.
- **`debounce`** (object) - Optional - Options to configure function debounce.
  - **`period`** (string) - Required - The time period of which to set the limit.
  - **`key`** (string) - Optional - A unique key expression to apply the debounce to.
```

--------------------------------

TITLE: Invoke Function by ID Across Apps (Python)
DESCRIPTION: Illustrates how to invoke an Inngest function ('fn-1' in 'app-1') by its ID from a function ('fn-2' in 'app-2') in a different application. This requires specifying both `app_id` and `function_id`.

SOURCE: https://www.inngest.com/docs/reference/python/steps/invoke_by_id

LANGUAGE: python
CODE:
```
inngest_client_1 = inngest.Inngest(app_id="app-1")
inngest_client_2 = inngest.Inngest(app_id="app-2")

@inngest_client_1.create_function(
    fn_id="fn-1",
    trigger=inngest.TriggerEvent(event="app/fn-1"),
)
async def fn_1(ctx: inngest.Context) -> str:
    return "Hello!"

@inngest_client_2.create_function(
    fn_id="fn-2",
    trigger=inngest.TriggerEvent(event="app/fn-2"),
)
async def fn_2(ctx: inngest.Context) -> None:
    output = ctx.step.invoke_by_id(
        "invoke",
        app_id="app-1",
        function_id="fn-1",
    )

    # Prints "Hello!"
    print(output)

```

--------------------------------

TITLE: GetFunctionInput: Typing Inngest Function Arguments
DESCRIPTION: GetFunctionInput infers the input arguments passed to an Inngest function. It can optionally be narrowed to a specific event trigger using a string literal as the second generic argument.

SOURCE: https://www.inngest.com/docs/typescript

LANGUAGE: typescript
CODE:
```
import { type GetFunctionInput } from "inngest";
import { inngest } from "@/inngest";

type InputArg = GetFunctionInput<typeof inngest>;
type InputArgWithTrigger = GetFunctionInput<typeof inngest, "app/user.created">;

```

--------------------------------

TITLE: Listen for and process user activity events in TypeScript
DESCRIPTION: This TypeScript function listens for the `app/weekly-email-activity.send` event. Upon receiving an event, it loads user data and then emails the user, demonstrating a common fan-out processing pattern.

SOURCE: https://www.inngest.com/docs/guides/sending-events-from-functions

LANGUAGE: typescript
CODE:
```
export const sendReminder = inngest.createFunction(
  { id: "weekly-activity-send-email" },
  { event: "app/weekly-email-activity.send" },
  async ({ event, step }) => {
    const data = await step.run("load-user-data", async () => {
      return loadUserData(event.data.user.id);
    });

    await step.run("email-user", async () => {
      return sendEmail(event.data.user, data);
    });
  }
);

```

--------------------------------

TITLE: Publish Data from Inngest Function (TypeScript)
DESCRIPTION: An example of publishing data from an Inngest function. It demonstrates how to use the `publish()` function with a channel, topic, and data payload. The `publish()` function is automatically available when the `realtimeMiddleware` is used.

SOURCE: https://www.inngest.com/docs/features/realtime

LANGUAGE: typescript
CODE:
```
import {
  inngest,
} from "./client";

inngest.createFunction(
  {
    id: "create-recommendation",
  },
  {
    event: "ai/recommendation.requested",
  },
  async ({
    event,
    step,
    publish,
  }) => {

    const response = await step.run('generate-response', () => {
      return llm.generateResponse(event.data.prompt);
    });

    // Publish data to a user-specific channel, on the "ai" topic.
    await publish({
      channel: `user:${event.data.userId}`,
      topic: "ai",
      data: {
        response: response,
        success: true,
      },
    });
    // ℹ️ Want type-safety with channels and topics? See the typed channels tab above.
  }
);

```

--------------------------------

TITLE: Default Function Retries
DESCRIPTION: Functions will retry up to 4 times by default if an error occurs during execution. This example shows a function that writes to a database, which will be retried on failure.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/retries

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "click-recorder" },
  { event: "app/button.clicked" },
  async ({ event, attempt }) => {
    await db.clicks.insertOne(event.data); // this code now retries!
  },
);

```

--------------------------------

TITLE: Local Firebase Cloud Function Serve Path Configuration
DESCRIPTION: Configures the `INNGEST_SERVE_PATH` for Firebase Cloud Functions to match the custom function path for local development.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: bash
CODE:
```
npx inngest-cli@latest dev -u http://127.0.0.1:5001/inngest-firebase-functions/us-central1/inngest

```

--------------------------------

TITLE: Schedule Reminder Function with Cancellation (TypeScript)
DESCRIPTION: Defines an Inngest function that schedules a reminder and can be canceled. It uses `step.sleepUntil` for delaying execution and `cancelOn` to specify events that will terminate the function, ensuring cancellation only occurs for the correct reminder via a conditional match on `reminderId`.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-events

LANGUAGE: typescript
CODE:
```
const scheduleReminder = inngest.createFunction(
  {
    id: "schedule-reminder",
    cancelOn: [{
      event: "tasks/reminder.deleted", // The event name that cancels this function
      // Ensure the cancellation event (async) and the triggering event (event)'s reminderId are the same:
      if: "async.data.reminderId == event.data.reminderId",
    }],
  }
  { event: "tasks/reminder.created" },
  async ({ event, step }) => {
    await step.sleepUntil('sleep-until-remind-at-time', event.data.remindAt);
    await step.run('send-reminder-push', async ({}) => {
      await pushNotificationService.push(event.data.userId, event.data.reminderBody)
    })
  }
  // ...
);

```

--------------------------------

TITLE: Multiple Triggers Example
DESCRIPTION: Demonstrates how to configure a function to trigger based on multiple events.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: APIDOC
CODE:
```
## Multiple Triggers

```python
import inngest

@inngest_client.create_function(
    fn_id="import-product-images",
    trigger=[
      inngest.TriggerEvent(event="shop/product.imported"),
      inngest.TriggerEvent(event="shop/product.updated"),
    ],
)
async def fn(ctx: inngest.Context):
    # Your function code
```
```

--------------------------------

TITLE: Original Inngest Client and Function in v2 (TypeScript)
DESCRIPTION: This snippet illustrates the v2 syntax for initializing an Inngest client and creating a function. It shows the previous approach where clients only required a `name` and functions primarily used `name` with `id` being optional. It also demonstrates the older syntax for `waitForEvent` and `serve`.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";
import { serve } from "inngest/next";

// Clients only previously required a `name`, but we want to be
// explicit that this is used to identify your application and manage
// concepts such as deployments.
const inngest = new Inngest({ name: "My App" });

const fn = inngest.createFunction(
  // Similarly, functions now require an `id` and `name` is optional.
  { name: "Onboarding Example" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    // `step.run()` stays the same.
    await step.run("send-welcome-email", () =>
      sendEmail(event.user.email, "Welcome!")
    );

    // The shape of `waitForEvent` has changed; all steps now require
    // an ID.
    const profileCompleted = await step.waitForEvent(
      "app/user.profile.completed",
      {
        timeout: "1d",
        match: "data.userId",
      }
    );

    // All steps, even sleeps, require IDs.
    await step.sleep("5m");

    if (!profileCompleted) {
      await step.run("send-profile-reminder", () =>
        sendEmail(event.user.email, "Complete your profile!")
      );
    }
  }
);

// Serving now uses a single object parameter for better readability.
export default serve(inngest, [fn]);

```

--------------------------------

TITLE: Create an Inngest Function for User Signup
DESCRIPTION: Defines an Inngest function that triggers on a 'user/new.signup' event. The event data is fully typed, ensuring type safety within the function's logic.

SOURCE: https://www.inngest.com/docs/typescript

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export default inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "user/new.signup" },
  async ({ event }) => {
    // "event" is fully typed to provide typesafety within this function
    return await email.send("welcome", event.data.email);
  }
);

```

--------------------------------

TITLE: Trigger a scheduled function with a timestamp
DESCRIPTION: Sends a "notifications/reminder.scheduled" event to Inngest to trigger a specific function at a future time. The `ts` field in the event payload specifies the Unix timestamp for execution. This method is for initiating function runs, not for mid-function delays.

SOURCE: https://www.inngest.com/docs/examples/scheduling-one-off-function

LANGUAGE: javascript
CODE:
```
await inngest.send({
  name: "notifications/reminder.scheduled",
  data: {
    user: { email: "johnny.utah@fbi.gov" }
    message: "Don't forget to catch the wave at 3pm",
  },
  // Include the timestamp for 5 minutes in the future:
  ts: Date.now() + 5 * 60 * 1000,
});
```

--------------------------------

TITLE: Serve Inngest Functions with AWS Lambda (TypeScript)
DESCRIPTION: Integrates Inngest functions with AWS Lambda. It recommends using Lambda function URLs for triggering functions due to their simplicity and cost-effectiveness. Alternatively, API Gateway can be used. The `serveHost` and `servePath` options may need to be configured for specific API Gateway setups.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/lambda";
import { inngest } from "./client";
import fnA from "./fnA"; // Your own function

export const handler = serve({
  client: inngest,
  functions: [fnA],
});

```

--------------------------------

TITLE: Handle function cancellation with Inngest
DESCRIPTION: This Inngest function is designed to be triggered when another specific function is cancelled. It uses the 'inngest/function.cancelled' system event and filters it based on the 'function_id' to execute cleanup logic. The original triggering event's data is accessible within the cancellation handler.

SOURCE: https://www.inngest.com/docs/examples/cleanup-after-function-cancellation

LANGUAGE: typescript
CODE:
```
const inngest = new Inngest({ id: "newsletter-app" });

// This is our "import" function that will get cancelled
export const importAllContacts = inngest.createFunction(
  {
    id: "import-all-contacts",
    cancelOn: [{ event: "contacts/import.cancelled", if: "async.data.importId == event.data.importId" }]
  },
  { event: "contacts/import.requested" },
  async ({ event, step  }) => {
    // This is a long running function
  }
)

// This function will be run only when the matching function_id has a run that is cancelled
export const cleanupCancelledImport = inngest.createFunction(
  {
    name: "Cleanup cancelled import",
    id: "cleanup-cancelled-import"
  },
  {
    event: "inngest/function.cancelled",
    // The function ID is a hyphenated slug of the App ID w/ the functions" id
    if: "event.data.function_id == 'newsletter-app-import-all-contacts'"
  },
  async ({ event, step, logger }) => {
    // This code will execute after your function is cancelled

    // The event that triggered our original function run is passed nested in our event payload
    const originalTriggeringEvent = event.data.event;
    logger.info(`Import was cancelled: ${originalTriggeringEvent.data.importId}`)
  }
);
```

--------------------------------

TITLE: Define Inngest Function with Cancellation - TypeScript
DESCRIPTION: This snippet demonstrates how to define an Inngest Function in TypeScript that includes a cancellation trigger. The `cancelOn` property is configured to cancel the function run if a 'tasks/deleted' event occurs and its data ID matches the asynchronous data ID. The function itself schedules a reminder using `step.sleepUntil` and then sends a push notification.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/cancellation

LANGUAGE: typescript
CODE:
```
const scheduleReminder = inngest.createFunction(
  {
    id: "schedule-reminder",
    cancelOn: [{ event: "tasks/deleted", if: "event.data.id == async.data.id" }],
  }
  { event: "tasks/reminder.created" },
  async ({ event, step }) => {
    // Step 1
    await step.sleepUntil('sleep-until-remind-at-time', event.data.remindAt);
    // Step 2
    await step.run('send-reminder-push', async ({}) => {
      await pushNotificationService.push(event.data.userId, event.data.reminderBody)
    })
  }
  // ...
);

```

--------------------------------

TITLE: Trigger and Await Inngest Function Output
DESCRIPTION: This example demonstrates the complete workflow: triggering an Inngest function with `inngest.send()`, obtaining the Event ID, and then using `getRunOutput` to await the function's completion and retrieve its output. The final output of the function is then logged to the console.

SOURCE: https://www.inngest.com/docs/examples/fetch-run-status-and-output

LANGUAGE: typescript
CODE:
```
const { ids } = await inngest.send({
  name: "imports/csv.uploaded",
  data: {
    file: "http://s3.amazonaws.com/acme-uploads/user_0xp3wqz7vumcvajt/JVLO6YWS42IXEIGO.csv",
    userId: "user_0xp3wqz7vumcvajt",
  },
});

const run = await getRunOutput(ids[0]);
console.log(run.output);
/*
{
  status: "success",
  processedItems: 98,
  failedItems: 2,
}
*/

```

--------------------------------

TITLE: Debounce Function Configuration
DESCRIPTION: This snippet demonstrates how to configure a function to use debouncing. The `key` specifies the unique identifier for debouncing, and `period` sets the delay time.

SOURCE: https://www.inngest.com/docs/reference/functions/debounce

LANGUAGE: APIDOC
CODE:
```
## POST /inngest/functions

### Description
Configures a function with debouncing. Debounce delays function execution for a specified `period` and reschedules it if new events are received within that period. The function runs after the period passes with no new events, using the last event received.

### Method
POST

### Endpoint
/inngest/functions

### Parameters
#### Request Body
- **id** (string) - Required - The unique identifier for the function.
- **debounce** (object) - Optional - Options to configure how to debounce function execution.
  - **key** (string) - Optional - An expression evaluated for each triggering event to define a unique debounce key. Uses Common Expression Language (CEL).
  - **period** (string) - Required - The time delay for execution. Permitted values: `1s` to `7d`.
  - **timeout** (string) - Optional - The maximum time a debounce can be extended before running.
- **event** (string) - Required - The event trigger for the function.

### Request Example
```json
{
  "id": "handle-webhook",
  "debounce": {
    "key": "event.data.account_id",
    "period": "5m"
  },
  "event": "intercom/company.updated"
}
```

### Response
#### Success Response (200)
- **message** (string) - A confirmation message indicating the function was created or updated.

#### Response Example
```json
{
  "message": "Function 'handle-webhook' configured successfully."
}
```

### Error Handling
- **400 Bad Request**: Invalid debounce configuration or parameters.
- **409 Conflict**: A function with the same ID already exists and cannot be updated with different parameters.
```

--------------------------------

TITLE: Run Generation Function with Idempotency
DESCRIPTION: An Inngest function example demonstrating the use of CEL expressions for idempotency to ensure a function runs only once per unique user and prompt hash within a 24-hour period.

SOURCE: https://www.inngest.com/docs/guides/handling-idempotency

LANGUAGE: typescript
CODE:
```
const runGeneration = inngest.createFunction(
  {
    id: 'run-generation',
    // Given the event payload sends a hash of the prompt,
    // this will only run once per unique prompt per user
    // every 24 hours:
    idempotency: `event.data.promptHash + "-" + event.data.userId`
  },
  { event: 'ai/generation.requested' },
  async ({ event, step }) => {
    // Track the request
  }
)
```

--------------------------------

TITLE: Create Debounced Function in TypeScript
DESCRIPTION: Demonstrates how to create a debounced Inngest function using the TypeScript SDK. The function is configured to delay execution by 5 minutes after events with the same `account_id` stop being received. It uses the last event in the series as input.

SOURCE: https://www.inngest.com/docs/reference/functions/debounce

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  {
    id: "handle-webhook",
    debounce: {
      key: "event.data.account_id",
      period: "5m",
    },
  },
  { event: "intercom/company.updated" },
  async ({ event, step }) => {
    // This function will only be scheduled 5m after events have stopped being received with the same
    // `event.data.account_id` field.
    //
    // `event` will be the last event in the series received.
  }
);
```

--------------------------------

TITLE: Assert step tooling usage
DESCRIPTION: Asserts that step tooling functions (e.g., `ctx.step.run`) within the function have been called correctly with expected arguments. This verifies the internal logic and interaction of steps.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
const { ctx } = await t.execute();
expect(ctx.step.run).toHaveBeenCalledWith("my-step", expect.any(Function));
```

--------------------------------

TITLE: Execute function to a specific step
DESCRIPTION: Executes the Inngest function only until a specified step is completed. This is useful for testing individual steps or verifying step configurations, like non-runnable steps.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
test("runs the price calculations", async () => {
  const { result } = await t.executeStep("calculate-price");
  expect(result).toEqual(123);
});
```

--------------------------------

TITLE: Invoke Function by ID
DESCRIPTION: Calls another Inngest function using its ID, waits for completion, and returns the output. This is useful for triggering functions in different codebases or avoiding circular dependencies.

SOURCE: https://www.inngest.com/docs/reference/python/steps/invoke_by_id

LANGUAGE: APIDOC
CODE:
```
## POST /functions/{functionId}/invoke

### Description
Invokes another Inngest function by its ID. This operation is asynchronous and waits for the invoked function to complete before returning its output.

### Method
POST

### Endpoint
`/functions/{functionId}/invoke`

### Parameters
#### Path Parameters
- **functionId** (string) - Required - The unique identifier of the function to invoke.

#### Query Parameters
- **appId** (string) - Optional - The ID of the application where the target function resides. Useful for cross-app invocations.

#### Request Body
- **step_id** (string) - Required - A unique identifier for this step within the current function execution.
- **data** (object) - Optional - JSON-serializable data to be passed as the `event.data` to the invoked function.
- **user** (object) - Optional - JSON-serializable data to be passed as the `event.user` to the invoked function.

### Request Example
```json
{
  "step_id": "invoke-external-function",
  "app_id": "app-1",
  "function_id": "external-fn-id",
  "data": {
    "message": "Hello from caller"
  },
  "user": {
    "userId": "user-123"
  }
}
```

### Response
#### Success Response (200)
- **result** (any) - The output returned by the invoked function.

#### Response Example
```json
{
  "result": "Output from invoked function"
}
```
```

--------------------------------

TITLE: Trigger Inngest Function and Get Event IDs
DESCRIPTION: This code snippet shows how to send an event to trigger an Inngest function using `inngest.send()`. It specifies the function name ('imports/csv.uploaded') and includes payload data such as a file URL and userId. The function returns an array of Event IDs which are used to track the run status.

SOURCE: https://www.inngest.com/docs/examples/fetch-run-status-and-output

LANGUAGE: typescript
CODE:
```
const { ids } = await inngest.send({
  name: "imports/csv.uploaded",
  data: {
    file: "http://s3.amazonaws.com/acme-uploads/user_0xp3wqz7vumcvajt/JVLO6YWS42IXEIGO.csv",
    userId: "user_0xp3wqz7vumcvajt",
  },
});
// ids = ["01HWAVEB858VPPX47Z65GR6P6R"]

```

--------------------------------

TITLE: Serve Inngest Functions in Next.js (TypeScript)
DESCRIPTION: Integrates Inngest functions into a Next.js application by using the `serve` utility. This example shows how to import the Inngest client and a previously defined function (`helloWorld`) and add it to the `serve` handler.

SOURCE: https://www.inngest.com/docs/getting-started/nextjs-quick-start

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // <-- This is where you'll always add all your functions
  ],
});

```

--------------------------------

TITLE: Create Inngest Function with Rate Limiting (TypeScript)
DESCRIPTION: Demonstrates how to create an Inngest function with a rate limit configuration. The function is set to run a maximum of 1 time per 4 hours for events sharing the same `event.data.company_id`. This prevents excessive function executions for specific events.

SOURCE: https://www.inngest.com/docs/reference/functions/rate-limit

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  {
    id: "synchronize-data",
    rateLimit: {
      key: "event.data.company_id",
      limit: 1,
      period: "4h",
    },
  },
  { event: "intercom/company.updated" },
  async ({ event, step }) => {
    // This function will be rate limited
    // It will only run 1 once per 4 hours for a given event payload with matching company_id
  }
);
```

--------------------------------

TITLE: Configure Rate Limiting for an Inngest Function
DESCRIPTION: This example demonstrates how to configure rate limiting for an Inngest function using the `rateLimit` option in the function's configuration. The function `synchronize-data` will only run once every 4 hours for a given `event.data.company_id`.

SOURCE: https://www.inngest.com/docs/guides/rate-limiting

LANGUAGE: APIDOC
CODE:
```
## POST /functions/configure

### Description
Configures rate limiting for an Inngest function. This allows you to set a hard limit on how many times a function can run within a specified time period.

### Method
POST

### Endpoint
/functions/configure

### Parameters
#### Request Body
- **id** (string) - Required - The unique identifier for the function.
- **rateLimit** (object) - Optional - Configuration for rate limiting.
  - **limit** (number) - Required - The maximum number of function runs allowed within the specified period.
  - **period** (string) - Required - The time period for the rate limit (e.g., "1h", "4h", "24h").
  - **key** (string) - Optional - An expression using event data to apply limits per unique value (e.g., "event.data.company_id").
- **trigger** (object) - Required - The event trigger configuration for the function.
  - **event** (string) - Required - The name of the event that triggers the function (e.g., "intercom/company.updated").

### Request Example
```json
{
  "id": "synchronize-data",
  "rateLimit": {
    "limit": 1,
    "period": "4h",
    "key": "event.data.company_id"
  },
  "trigger": {
    "event": "intercom/company.updated"
  }
}
```

### Response
#### Success Response (200)
- **status** (string) - Indicates the success of the operation (e.g., "configured").

#### Response Example
```json
{
  "status": "configured"
}
```
```

--------------------------------

TITLE: Serve Inngest Functions with Cloudflare Pages (JavaScript)
DESCRIPTION: Demonstrates how to serve Inngest functions within a Cloudflare Pages environment. The Inngest API server is imported and configured to handle requests. The `onRequest` export is used to integrate with Cloudflare Pages Functions.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: javascript
CODE:
```
import { serve } from "inngest/cloudflare";
import { inngest } from "../../inngest/client";
import fnA from "../../inngest/fnA"; // Your own function

export const onRequest = serve({
  client: inngest,
  functions: [fnA],
});

```

--------------------------------

TITLE: Serve Inngest Functions in Next.js
DESCRIPTION: This Next.js code snippet demonstrates how to serve Inngest functions by creating an API endpoint at `/api/inngest`. It utilizes the `serve` handler from the 'inngest/next' library, passing the Inngest client and an array of functions to be registered.

SOURCE: https://www.inngest.com/docs/deploy/vercel

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/next";
import { client } from "../../inngest/client";
import { firstFunction, anotherFunction } from "../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: client,
  functions: [
    firstFunction,
    anotherFunction
  ]
});

```

--------------------------------

TITLE: Singleton Function Example: Skip Mode vs. Cancel Mode (TypeScript)
DESCRIPTION: This TypeScript code illustrates the use of Singleton Functions, specifically comparing 'skip' and 'cancel' modes. The 'skip' mode prevents a new run if one is active for the same user ID, while 'cancel' mode would terminate the existing run and start a new one.

SOURCE: https://www.inngest.com/docs/guides/singleton

LANGUAGE: typescript
CODE:
```
const dataSync = inngest.createFunction({
    id: "data-sync",
    singleton: {
      key: "event.data.user_id",
      mode: "skip",
    }
  },
  { event: "data-sync.start" },
  async ({ event }) => {
    const userId = event.data.user_id;

    // This long-running sync process will not be interrupted
    // If another sync is triggered for this user, it will be skipped
    const data = await syncUserDataFromExternalAPI(userId);
    const processed = await processLargeDataset(data);
    await updateDatabase(processed);
  },
);
```

--------------------------------

TITLE: Send weekly activity email events in TypeScript
DESCRIPTION: This TypeScript function schedules a weekly task to fetch users and send a `app/weekly-email-activity.send` event for each user. It utilizes `step.sendEvent` to batch events, up to 512KB, for fan-out processing.

SOURCE: https://www.inngest.com/docs/guides/sending-events-from-functions

LANGUAGE: typescript
CODE:
```
import {
  GetEvents,
  Inngest
} from "inngest";

const inngest = new Inngest({ id: "signup-flow" });
type Events = GetEvents<typeof inngest>;

export const loadCron = inngest.createFunction(
  { id: "weekly-activity-load-users" },
  { cron: "0 12 * * 5" },
  async ({ event, step }) => {
    // Fetch all users
    const users = await step.run("fetch-users", async () => {
      return fetchUsers();
    });

    // For each user, send us an event.  Inngest supports batches of events
    // as long as the entire payload is less than 512KB.
    const events = users.map<Events["app/weekly-email-activity.send"]>(
      (user) => {
        return {
          name: "app/weekly-email-activity.send",
          data: {
            ...user,
          },
          user,
        };
      }
    );

    // Send all events to Inngest, which triggers any functions listening to
    // the given event names.
    await step.sendEvent("fan-out-weekly-emails", events);

    // Return the number of users triggered.
    return { count: users.length };
  }
);

```

--------------------------------

TITLE: Create Inngest Function with step.sendEvent (TypeScript)
DESCRIPTION: Defines an Inngest function that sends a new event (`app/user.activated`) after receiving an `app/user.signup` event. This ensures reliable event delivery within the function's execution context, particularly useful for fanning out events.

SOURCE: https://www.inngest.com/docs/reference/functions/step-send-event

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "user-onboarding" },
  { event: "app/user.signup" },
  async ({ event, step }) => {
    // Do something
    await step.sendEvent("send-activation-event", {
      name: "app/user.activated",
      data: { userId: event.data.userId },
    });
    // Do something else
  }
);

```

--------------------------------

TITLE: Customizing Function Retries
DESCRIPTION: You can explicitly set the number of retries for a function by providing the 'retries' option in the function configuration. Setting retries to 0 disables retries.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/retries

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "click-recorder",
    retries: 10, // choose how many retries you'd like
  },
  { event: "app/button.clicked" },
  async ({ event, step, attempt }) => { /* ... */ },
);

```

--------------------------------

TITLE: Inngest Function Handler Signature
DESCRIPTION: Defines the signature of an Inngest function handler, including destructured arguments like event, events, step, runId, logger, and attempt.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: javascript
CODE:
```
function handler({ event, events, step, runId, logger, attempt }) {/* ... */}
```

--------------------------------

TITLE: Firebase Cloud Functions Integration
DESCRIPTION: Integrates Inngest with Firebase Cloud Functions using the `onRequest` API. It requires the `serve` handler from `inngest/express` and specific configuration for the Inngest serve path.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { onRequest } from "firebase-functions/v2/https";

import { serve } from "inngest/express";
import { inngest as inngestClient } from "./inngest/client";

export const inngest = onRequest(
  serve({
    client: inngestClient,
    functions: [/* ...functions... */],
  })
);

```

--------------------------------

TITLE: Define Inngest 'hello-world' Function (TypeScript)
DESCRIPTION: Defines a durable Inngest function named 'hello-world' that is triggered by the 'test/hello.world' event. The function includes a durable step to sleep for one second and returns a personalized greeting message. It's added to an exported array for Inngest to discover.

SOURCE: https://www.inngest.com/docs/getting-started/nodejs-quick-start

LANGUAGE: typescript
CODE:
```
import {
  Inngest
} from "inngest";

export const inngest = new Inngest({ id: "my-app" });

// Your new function:
const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

// Add the function to the exported array:
export const functions = [
  helloWorld
];

```

--------------------------------

TITLE: Configure Function Start Timeout
DESCRIPTION: Set a timeout for the Inngest function's startup phase. If the time between scheduling and starting execution exceeds this duration, the function will be cancelled.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "timeouts": {
    "start": "15m"
  }
}
```

--------------------------------

TITLE: Cancel Function with Conditional Event Matching
DESCRIPTION: Implement conditional cancellation of an Inngest function using a CEL expression. The function is cancelled if the `userId` matches between the trigger and cancel events, and the cancel event's `billing_plan` is 'pro'.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "cancelOn": [
    {
      "event": "async.event",
      "if": "event.data.userId == async.data.userId && async.data.billing_plan == 'pro'"
    }
  ]
}
```

--------------------------------

TITLE: Create a reminder function with Inngest
DESCRIPTION: Defines an Inngest function that sends a reminder email to a user. It's triggered by a scheduled event and uses an external email API to send the message. Dependencies include the Inngest SDK and an email API client.

SOURCE: https://www.inngest.com/docs/examples/scheduling-one-off-function

LANGUAGE: javascript
CODE:
```
const sendReminder = inngest.createFunction(
  { id: "send-reminder" },
  { event: "notifications/reminder.scheduled" },
  async ({ event, step }) => {
    const { user, message } = event.data;

    const { id } = await emailApi.send({
      to: user.email,
      subject: "Reminder for your upcoming event",
      body: message,
    });

    return { id }
  }
);
```

--------------------------------

TITLE: Configure Singleton Function with Skip Mode (TypeScript)
DESCRIPTION: This TypeScript example demonstrates how to configure a function to run as a singleton, skipping new runs if another instance with the same key is already executing. It uses `event.data.user_id` as the key to scope the singleton behavior per user.

SOURCE: https://www.inngest.com/docs/guides/singleton

LANGUAGE: typescript
CODE:
```
const dataSync = inngest.createFunction({
    id: "data-sync",
    singleton: {
      key: "event.data.user_id",
      mode: "skip",
    }
  },
  { event: "data-sync.start" },
  async ({ event }) => {
    // ...
  },
);
```

--------------------------------

TITLE: Inngest Rule: No Nested Steps
DESCRIPTION: Disallows the use of `step.*` functions within another `step.run()` function. Nesting steps is not supported and can lead to runtime errors; sequential execution through helper functions is recommended.

SOURCE: https://www.inngest.com/docs/sdk/eslint

LANGUAGE: javascript
CODE:
```
"@inngest/no-nested-steps": "error" // recommended
```

LANGUAGE: javascript
CODE:
```
// ❌ Bad
await step.run("a", async () => {
  const someValue = "...";
  await step.run("b", () => {
    return use(someValue);
  });
});
```

LANGUAGE: javascript
CODE:
```
// ✅ Good
const aThenB = async () => {
  const someValue = await step.run("a", async () => {
    return "...";
  });

  return step.run("b", async () => {
    return use(someValue);
  });
};

await aThenB();
```

--------------------------------

TITLE: Create Inngest Function (v3 vs v2)
DESCRIPTION: Illustrates the change in creating Inngest functions, requiring an 'id' instead of just 'name'. The 'name' is still accepted but is now a secondary property.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "send-welcome-email", name: "Send welcome email" },
  { event: "app/user.created" },
  async ({ event }) => {
    // ...
  }
);
```

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { name: "Send welcome email" },
  { event: "app/user.created" },
  async ({ event }) => {
    // ...
  }
);
```

--------------------------------

TITLE: Remove Old Inngest Function Creation Helpers
DESCRIPTION: Demonstrates the removal of older Inngest function creation helpers like `createFunction`, `createScheduledFunction`, and `createStepFunction`. These are replaced by a unified approach using `inngest.createFunction()`.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
// ❌ Removed in v1
import {
  createFunction,
  createScheduledFunction,
  createStepFunction,
} from "inngest";

// ❌ Removed in v1
inngest.createScheduledFunction(...);
inngest.createStepFunction(...);

```

--------------------------------

TITLE: Cloudflare Workers AI Middleware for Inngest Functions (TypeScript)
DESCRIPTION: This middleware allows Inngest functions to access the Cloudflare Workers AI environment, enabling the execution of machine learning models. It adds an `ai` property to the function context, which can then be used to interact with AI models like Llama 2.

SOURCE: https://www.inngest.com/docs/reference/middleware/examples

LANGUAGE: TypeScript
CODE:
```
import { InngestMiddleware } from "inngest";

interface Env {
  // If you set another name in wrangler.toml as the value for 'binding',
  // replace "AI" with the variable name you defined.
  AI: Ai;
}

export const cloudflareMiddleware = new InngestMiddleware({
  name: "Inngest: Workers AI",
  init: () => {
    return {
      onFunctionRun: ({ reqArgs }) => {
        const [ctx] = reqArgs as [Request, Env];
        const ai = ctx.env.AI

        return {
          transformInput: () => {
            return { ctx: { ai } };
          },
        };
      },
    };
  },
});
```

LANGUAGE: TypeScript
CODE:
```
import { inngest } from "./client";

export default inngest.createFunction(
  { id: "hello-world" },
  { event: "demo/event.sent" },
  async ({ ai }) => {
    // `ai` is typed and can be used directly or within a step
    const response = await ai.run("@cf/meta/llama-2-7b-chat-int8", {
      prompt: "What is the origin of the phrase Hello, World",
    });
  }
);
```

--------------------------------

TITLE: Define a CSV Processing Inngest Function
DESCRIPTION: This snippet defines an Inngest function using `inngest.createFunction` that is triggered by the 'imports/csv.uploaded' event. It processes a CSV file and returns the count of processed and failed items. The actual CSV processing logic is omitted.

SOURCE: https://www.inngest.com/docs/examples/fetch-run-status-and-output

LANGUAGE: typescript
CODE:
```
const processCSV = inngest.createFunction(
  { id: "process-csv-upload" },
  { event: "imports/csv.uploaded" },
  async ({ event, step }) => {
    // CSV processing logic omitted for the sake of the example
    return {
      status: "success",
      processedItems: results.length,
      failedItems: failures.length,
    }
  }
);

```

--------------------------------

TITLE: step.invoke() Method
DESCRIPTION: Details on how to use the step.invoke() method, including its parameters and their types.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: APIDOC
CODE:
```
## `step.invoke(id, options): Promise`

### Description
Use `step.invoke()` to asynchronously call another function and handle the result. Invoking other functions allows you to easily re-use functionality and compose them to create more complex workflows or map-reduce type jobs. `step.invoke()` returns a `Promise` that resolves with the return value of the invoked function.

### Parameters

#### `id`
- **Type**: string
- **Required**: required
- **Description**: The ID of the invocation. This is used in logs and to keep track of the invocation's state across different versions.

#### `options`
- **Type**: object
- **Required**: required
- **Description**: Options for the invocation:
  - **`function`** (InngestFunction | InngestFunctionReference) - Required - A local instance of a function or a reference to a function to invoke.
  - **`data`** (object) - Optional - Optional data to pass to the invoked function. Will be required and typed if it's needed.
  - **`user`** (object) - Optional - Optional user context for the invocation.
  - **`timeout`** (string | number | Date) - Optional (v3.14.0+) - The amount of time to wait for the invoked function to complete. If the timeout is reached, the step will throw an error. The invoked function will continue to run even if this step times out. Throwing errors within the invoked function will be reflected in the invoking function.
```

--------------------------------

TITLE: TypeScript: Schedule function execution with `step.sleepUntil`
DESCRIPTION: Schedules a function to resume execution at a specific datetime. Supports Date objects, date strings, Temporal.Instant, and Temporal.ZonedDateTime. Requires `await` for proper execution.

SOURCE: https://www.inngest.com/docs/reference/functions/step-sleep-until

LANGUAGE: typescript
CODE:
```
// Sleep until the new year
await step.sleepUntil("happy-new-year", "2024-01-01");

// Sleep until September ends
await step.sleepUntil("wake-me-up", "2023-09-30T11:59:59");

// Sleep until the end of the this week
const date = dayjs().endOf("week").toDate();
await step.sleepUntil("wait-for-end-of-the-week", date);

// Sleep until tea time in London
const teaTime = Temporal.ZonedDateTime.from("2025-05-01T16:00:00+01:00[Europe/London]");
await step.sleepUntil("british-tea-time", teaTime);

// Sleep until the end of the day
const now = Temporal.Now.instant();
const endOfDay = now.round({ smallestUnit: "day", roundingMode: "ceil" });
await step.sleepUntil("done-for-today", endOfDay);
```

--------------------------------

TITLE: Default Webhook Transform Function
DESCRIPTION: The default JavaScript transform function provided by Inngest for webhook intents. This function handles the transformation of incoming webhook payloads into the Inngest event format, with basic support for common payload structures.

SOURCE: https://www.inngest.com/docs/platform/webhooks/build-an-integration

LANGUAGE: javascript
CODE:
```
function transform(evt, headers = {}, queryParams = {}, raw = "") {
  return {
    // This was created by the <Provider name> integration.
    // Edit this to customize the event name and payload.
    name: `<provider-name-slug>/${evt.type || evt.name || evt.event_type || "webhook.received"}`,
    data: evt.data || evt,
  };
};
```

--------------------------------

TITLE: Create an Inngest Function (Node.js)
DESCRIPTION: Shows how to create a new Inngest function using an already configured Inngest client instance.

SOURCE: https://www.inngest.com/docs/reference/client/create

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export default inngest.createFunction(...);
```

--------------------------------

TITLE: Custom Context Transformation Mocks
DESCRIPTION: Illustrates how to provide custom mocks for Inngest function inputs by defining a `transformCtx` function when creating an `InngestTestEngine`. This allows injecting custom event data or modifying the context.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
const t = new InngestTestEngine({
  function: helloWorld,
  transformCtx: (ctx) => {
    return {
      ...ctx,
      event: someCustomThing,
    };
  },
});
```

LANGUAGE: typescript
CODE:
```
import { InngestTestEngine, mockCtx } from "@inngest/test";

const t = new InngestTestEngine({
  function: helloWorld,
  transformCtx: (ctx) => {
    return {
      ...mockCtx(ctx),
      event: someCustomThing,
    };
  },
});
```

--------------------------------

TITLE: Serve Inngest Functions in Next.js
DESCRIPTION: This snippet demonstrates how to use the `serve` API handler from the Inngest TypeScript SDK within a Next.js application. It imports the `serve` function and the Inngest client, then registers application functions to be served via HTTP.

SOURCE: https://www.inngest.com/docs/reference/serve

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/next"; // or your preferred framework
import { inngest } from "./client";
import {
  importProductImages,
  sendSignupEmail,
  summarizeText,
} from "./functions";

serve({
  client: inngest,
  functions: [sendSignupEmail, summarizeText, importProductImages],
});

```

--------------------------------

TITLE: Delay Jobs for a Specific Time - TypeScript
DESCRIPTION: Enqueues a job to run after a specified delay using the `step.sleep()` method. This is useful for time-based actions like sending follow-up emails. The function pauses execution for the specified duration and resumes later. It works across server restarts and bypasses serverless function timeouts.

SOURCE: https://www.inngest.com/docs/guides/delayed-functions

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "signup-flow" });

export const fn = inngest.createFunction(
  { id: "send-signup-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1 hour");
    await step.run("do-some-work-in-the-future", async () => {
      // This runs after 1 hour
    });
  }
);

```

--------------------------------

TITLE: Defining Lifecycles and Hooks - TypeScript
DESCRIPTION: Demonstrates how to define lifecycles and hooks within an Inngest middleware. The `init` function returns an object where keys are lifecycle names (e.g., `onFunctionRun`) and values are functions that can define hooks like `beforeExecution`.

SOURCE: https://www.inngest.com/docs/features/middleware/create

LANGUAGE: typescript
CODE:
```
import { InngestMiddleware } from "inngest";

new InngestMiddleware({
  name: "Example Middleware",
  async init() {
    // 1. Use init to set up dependencies
    // 2. Use return values to group hooks by lifecycle: - "onFunctionRun" "onSendEvent"
    return {
      onFunctionRun({ ctx, fn, steps }) {
        // 3. Use the lifecycle function to pass dependencies into hooks
        // 4. Return any hooks that you want to define for this action
        return {
          // 5. Define the hook that runs at a specific stage for this lifecycle.
          beforeExecution() {
            // 6. Define your hook
            console.log("Running before execution");
          },
        };
      },
    };
  },
});

```

--------------------------------

TITLE: Singleton Function Configuration
DESCRIPTION: This section details how to configure a function to ensure exclusive execution based on event properties using the `singleton` option.

SOURCE: https://www.inngest.com/docs/reference/functions/singleton

LANGUAGE: APIDOC
CODE:
```
## POST /websites/inngest

### Description
This endpoint allows you to configure and create Inngest functions with singleton execution to prevent concurrent runs.

### Method
POST

### Endpoint
/websites/inngest

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the function.
- **singleton** (object) - Optional - Configuration for exclusive execution.
  - **key** (string) - Required - A unique key expression evaluated for each event to determine exclusivity. Uses Common Expression Language (CEL).
  - **mode** (string) - Required - The mode for singleton execution. Options: `"skip"` (skip new run) or `"cancel"` (cancel existing and start new).
- **event** (object) - Required - Defines the event that triggers the function.

### Request Example
```json
{
  "id": "data-sync",
  "singleton": {
    "key": "event.data.user_id",
    "mode": "skip"
  },
  "event": "data-sync.start"
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message of function creation.

#### Response Example
```json
{
  "message": "Function data-sync created successfully."
}
```
```

--------------------------------

TITLE: Return Pydantic Models from Function - Python
DESCRIPTION: Illustrates setting a Pydantic model as the direct return type for an Inngest function. This requires configuring the Inngest client with PydanticSerializer and specifying the output_type in the function decorator.

SOURCE: https://www.inngest.com/docs/reference/python/guides/pydantic

LANGUAGE: python
CODE:
```
client = inngest.Inngest(
    app_id="my-app",

    # Must set the client serializer when using Pydantic output
    serializer=inngest.PydanticSerializer(),
)

class User(pydantic.BaseModel):
    name: str

@client.create_function(
    fn_id="my-fn",
    output_type=User,
    trigger=inngest.TriggerEvent(event="my-event"),
)
async def my_fn(ctx: inngest.Context) -> None:
    return User(name="Alice")


```

--------------------------------

TITLE: Transition `createStepFunction` to `inngest.createFunction()`
DESCRIPTION: Shows how to migrate from `createStepFunction` (or `inngest.createStepFunction`) to the current `inngest.createFunction()` signature. The event trigger remains similar, but the function signature and handler context are updated.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
// ❌ Removed in v1
const stepFn = createStepFunction(
  "Step function",
  "example/step.function",
  ({ event, tools }) => "..."
);

```

LANGUAGE: typescript
CODE:
```
// ✅ Valid in v1
const inngest = new Inngest({ name: "My App" });

const stepFn = inngest.createFunction(
  { name: "Step function" },
  { event: "example/step.function" },
  async ({ event, step }) => "..."
);

```

--------------------------------

TITLE: Serve Inngest Functions with Client (v1 & v2)
DESCRIPTION: Demonstrates the correct way to serve Inngest functions using an Inngest client instance. In v2, serving without a client is no longer supported. The client instance is required for type inference and proper function execution.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
// ❌ Invalid in v2
serve("My App", [...fns]);

// ✅ Valid in v1 and v2
import { inngest } from "./client";
serve(inngest, [...fns]);

```

--------------------------------

TITLE: Serve Inngest Functions with Bun.serve() (TypeScript)
DESCRIPTION: Sets up a lightweight Inngest server using `Bun.serve()` and the `inngest/bun` handler. This approach is suitable for applications running with Bun. The Inngest API endpoint is configured within the `routes` object of `Bun.serve()`.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/bun";
import { functions, inngest } from "./inngest";

Bun.serve({
  port: 3000,
  routes: {
    // ...other routes...
    "/api/inngest": (request: Request) => {
      return serve({ client: inngest, functions })(request);
    },
  },
});

```

--------------------------------

TITLE: Inngest Function with Middleware (TypeScript v3)
DESCRIPTION: Demonstrates creating an Inngest function in v3, utilizing middleware for actions like fetching user data and sending emails. This version replaces the older `fns` option with a more explicit middleware pattern.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
import * as actions from "./actions";
import { createActionsMiddleware } from "./middleware";

const inngest = new Inngest({
  id: "my-app",
  name: "My App",
  middleware: [createActionsMiddleware(actions)],
});

inngest.createFunction(
  { name: "Send welcome email" },
  { event: "app/user.created" },
  async ({ event, action }) => {
    const user = await action.getUserFromDb(event.data.userId);
    await action.sendWelcomeEmail(user.email);
  }
);
```

--------------------------------

TITLE: Run Durable Function with Step ID and Handler - Python
DESCRIPTION: Demonstrates how to use `step.run` to execute a function durably. It shows examples with and without arguments, including the use of `functools.partial` for keyword arguments and accessing scoped variables.

SOURCE: https://www.inngest.com/docs/reference/python/steps/run

LANGUAGE: python
CODE:
```
@inngest_client.create_function(
    fn_id="my_function",
    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def fn(ctx: inngest.Context) -> None:
    # Pass a function to step.run
    await ctx.step.run("my_fn", my_fn)

    # Args are passed after the function
    await ctx.step.run("my_fn_with_args", my_fn_with_args, 1, "a")

    # Kwargs require functools.partial
    await ctx.step.run(
        "my_fn_with_args_and_kwargs",
        functools.partial(my_fn_with_args_and_kwargs, 1, b="a"),
    )

    # Defining functions like this gives you easy access to scoped variables
    def use_scoped_variable() -> None:
        print(ctx.event.data["user_id"])

    await ctx.step.run("use_scoped_variable", use_scoped_variable)

async def my_fn() -> None:
    pass

async def my_fn_with_args(a: int, b: str) -> None:
    pass

async def my_fn_with_args_and_kwargs(a: int, *, b: str) -> None:
    pass

```

--------------------------------

TITLE: Wrap Vercel AI SDK with step.ai.wrap() in TypeScript
DESCRIPTION: This snippet shows how to integrate the Vercel AI SDK's `generateText` function into an Inngest Function using `step.ai.wrap()`. This method adds AI observability to existing SDK calls without significant code changes. The function responds to the 'app/ticket.created' event.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration

LANGUAGE: typescript
CODE:
```
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export default inngest.createFunction(
  { id: "summarize-contents" },
  { event: "app/ticket.created" },
  async ({ event, step }) => {

    // This calls `generateText` with the given arguments, adding AI observability,
    // metrics, datasets, and monitoring to your calls.
    const { text } = await step.ai.wrap("using-vercel-ai", generateText, {
      model: openai("gpt-4-turbo"),
      prompt: "What is love?"
    });

  }
);


```

--------------------------------

TITLE: Define Inngest Function with Finalization Step (TypeScript)
DESCRIPTION: This code defines an Inngest function using the TypeScript SDK. It includes a 'step.run' for importing data and illustrates the 'finalization' step where post-processing of results occurs before the function handler concludes.

SOURCE: https://www.inngest.com/docs/faq

LANGUAGE: typescript
CODE:
```
const myFunction = inngest.createFunction(
  { id: "handle-import" },
  { event: "integration.connected" },
  async ({ event, step }) => {
    const res = await step.run("import-data", async () => {
      // ...
    });
    // -- Finalization starts ⬇️ --
    const newRows = res.rows.filter((row) => row.created === true)
    return { message: `Imported ${newRows.length} rows` }
    // -- Finalization ends ⬆️ --
  },
)
```

--------------------------------

TITLE: Inngest Function Throttling Configuration
DESCRIPTION: This snippet demonstrates how to configure throttling for an Inngest Function using the Inngest SDK. It includes parameters like limit, period, burst, and key for granular control over function execution.

SOURCE: https://www.inngest.com/docs/guides/throttling

LANGUAGE: APIDOC
CODE:
```
## POST /api/functions/create (Hypothetical Endpoint for Function Creation)

### Description
Configures an Inngest function with throttling settings to control execution frequency.

### Method
POST

### Endpoint
/api/functions/create

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the function.
- **throttle** (object) - Optional - Configuration for throttling.
  - **limit** (integer) - Required - The total number of runs allowed within the `period`.
  - **period** (string) - Required - The time period for the throttling limit (e.g., "5s", "1m", "1h"). Must be between '1s' and '7d'.
  - **burst** (integer) - Optional - The number of runs allowed to start in a single burst within the window. Defaults to 1.
  - **key** (string) - Optional - An expression to generate a throttling key from event data (e.g., "event.data.user_id").
- **event** (object) - Required - Defines the event(s) the function listens to.
  - **name** (string) - Required - The name of the event.
- **handler** (function) - Required - The function logic to execute.

### Request Example
```json
{
  "id": "unique-function-id",
  "throttle": {
    "limit": 1,
    "period": "5s",
    "burst": 2,
    "key": "event.data.user_id"
  },
  "event": {
    "name": "ai/summary.requested"
  },
  "handler": "async ({ event, step }) => { /* function logic */ }"
}
```

### Response
#### Success Response (200)
- **success** (boolean) - Indicates if the function creation was successful.

#### Response Example
```json
{
  "success": true
}
```
```

--------------------------------

TITLE: Configuring Priority in Inngest Functions
DESCRIPTION: This example demonstrates how to set a dynamic priority for an Inngest function based on event data. The `run` expression evaluates to a number of seconds to adjust the function's position in the priority queue.

SOURCE: https://www.inngest.com/docs/guides/priority

LANGUAGE: APIDOC
CODE:
```
## POST /api/functions

### Description
Configure a function with dynamic priority.

### Method
POST

### Endpoint
/api/functions

### Parameters
#### Request Body
- **id** (string) - Required - The unique identifier for the function.
- **priority** (object) - Optional - Configuration for function priority.
  - **run** (string) - Required - A dynamic factor expression evaluating to seconds. Positive values increase priority, negative values delay execution.

### Request Example
```json
{
  "id": "ai-generate-summary",
  "priority": {
    "run": "event.data.account_type == 'enterprise' ? 120 : 0"
  }
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation of function creation or update.

#### Response Example
```json
{
  "message": "Function configured successfully."
}
```
```

--------------------------------

TITLE: Inngest Function Cancellation with cancelOn
DESCRIPTION: This section details how to use the `cancelOn` configuration within `inngest.createFunction` to stop a running function when a specific event is received. It covers basic event matching and conditional expressions.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/cancel-on

LANGUAGE: APIDOC
CODE:
```
## POST /inngest/functions

### Description
Configure an Inngest function to be cancelled based on incoming events. This is useful for stopping long-running processes when external conditions change, such as a user being deleted.

### Method
POST

### Endpoint
/inngest/functions

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the function.
- **cancelOn** (array of objects) - Optional - An array of event configurations that can cancel the function.
  - **event** (string) - Required - The name of the event that can trigger cancellation.
  - **match** (string) - Optional - A dot-notation property to match between the triggering event and the cancelling event (e.g., `data.userId`). Cannot be used with `if`.
  - **if** (string) - Optional - A Common Expression Language (CEL) expression to conditionally match events. Allows comparing properties between the original trigger (`event`) and the cancelling event (`async`). Cannot be used with `match`.
  - **timeout** (string) - Optional - A duration string (e.g., "1h", "30m") specifying the time window for receiving the cancelling event.

### Request Example
```json
{
  "id": "sync-contacts",
  "cancelOn": [
    {
      "event": "app/user.deleted",
      "if": "event.data.userId == async.data.userId"
    }
  ]
}
```

### Response
#### Success Response (200)
Indicates the function configuration was accepted.

#### Response Example
```json
{
  "success": true,
  "functionId": "sync-contacts"
}
```
```

--------------------------------

TITLE: Handle Standard Errors in Inngest Functions (TypeScript)
DESCRIPTION: Demonstrates throwing standard JavaScript errors within an Inngest function handler or a step. Inngest will automatically retry functions or steps when these errors occur. This is useful for general error conditions.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/errors

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "import-item-data" },
  { event: "store/import.requested" },
  async ({ event, step }) => {

    // throwing a standard error
    if (!event.itemId) {
      throw new Error("Item ID is required");
    }

    // throwing an error within a step
    const item = await step.run('fetch-item', async () => {
      const response = await fetch(`https://api.ecommerce.com/items/${event.itemId}`);
      if (response.status === 500) {
        throw new Error("Failed to fetch item from ecommerce API");
      }
      // ...
    });
  }
);

```

--------------------------------

TITLE: Running Asynchronous Code in Inngest Step (TypeScript)
DESCRIPTION: Illustrates how to correctly execute asynchronous code within an Inngest step using `step.run`. It emphasizes passing an async function to `step.run` to handle operations that might take time, ensuring they are executed as a retriable step.

SOURCE: https://www.inngest.com/docs/guides/multi-step-functions

LANGUAGE: typescript
CODE:
```
await step.run("do-something", async () => {
  // your code
});

```

--------------------------------

TITLE: Updating Variables Correctly from Inngest Steps (TypeScript)
DESCRIPTION: Shows the correct method for updating variables within an Inngest function's scope by returning values from `step.run`. This ensures that the updated variable is available for subsequent steps or logging, avoiding common pitfalls where variables remain undefined due to Inngest's memoization.

SOURCE: https://www.inngest.com/docs/guides/multi-step-functions

LANGUAGE: typescript
CODE:
```
// This is the right way to set variables within step.run :)
const userId = await step.run("get-user", () => getRandomUserId());

console.log(userId); // 123

```

--------------------------------

TITLE: Using sleepUntil vs. sleep in Inngest
DESCRIPTION: Demonstrates the correct usage of `sleepUntil` for static dates and `sleep` for relative time waits. `sleepUntil` should only be used with dates that remain constant across function calls, while `sleep` is for waiting a specific duration from the current time.

SOURCE: https://www.inngest.com/docs/guides/multi-step-functions

LANGUAGE: typescript
CODE:
```
// ❌ Bad
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
await step.sleepUntil("wait-until-tomorrow", tomorrow);

// ✅ Good
await step.sleep("wait-a-day", "1 day");

```

LANGUAGE: typescript
CODE:
```
// ✅ Good
const userBirthday = await step.run("get-user-birthday", async () => {
  const user = await getUser();
  return user.birthday; // Date
});

await sleepUntil("wait-for-user-birthday", userBirthday);

```

--------------------------------

TITLE: Cancel Function with Timeout Window (TypeScript)
DESCRIPTION: This code demonstrates how to use `cancelOn` with a `timeout` property to limit the time window during which a function can be canceled. If a matching event is not received within the specified duration (e.g., '1h'), the function will continue its execution.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/cancel-on

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "sync-contacts",
    cancelOn: [{ event: "app/user.deleted", match: "data.userId", timeout: "1h" }],
  }
  // ...
);
```

--------------------------------

TITLE: Track Requests Function Example
DESCRIPTION: An example of an Inngest function that tracks requests without idempotency, suitable for scenarios where every event needs to be processed.

SOURCE: https://www.inngest.com/docs/guides/handling-idempotency

LANGUAGE: typescript
CODE:
```
const trackRequests = inngest.createFunction(
  { id: 'track-requests' },
  { event: 'ai/generation.requested' },
  async ({ event, step }) => {
    // Track the request
  }
)
```

--------------------------------

TITLE: Inngest Function with onFailure Handler
DESCRIPTION: Demonstrates how to define a failure handler using the `onFailure` option within an Inngest function.

SOURCE: https://www.inngest.com/docs/reference/functions/handling-failures

LANGUAGE: APIDOC
CODE:
```
## POST /inngest/functions

### Description
This code snippet shows how to create an Inngest function with a specific `onFailure` handler.
The `onFailure` handler is executed when the function fails after its maximum retries.

### Method
POST

### Endpoint
/inngest/functions

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **id** (string) - Required - The unique identifier for the function.
- **onFailure** (function) - Optional - A callback function to handle failures.
- **event** (object) - Required - The event trigger for the function.

### Request Example
```json
{
  "id": "import-product-images",
  "onFailure": "async ({ error, event, step }) => { /* failure handling logic */ }",
  "event": {
    "event": "shop/product.imported"
  }
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message.

#### Response Example
```json
{
  "message": "Function created successfully"
}
```
```

--------------------------------

TITLE: Run Jobs at a Specific Time - TypeScript
DESCRIPTION: Schedules a job to execute at a precise date and time using the `step.sleepUntil()` method. This allows for exact scheduling, such as running a report at the beginning of the month. The function waits until the specified timestamp before resuming execution, ensuring accuracy and reliability.

SOURCE: https://www.inngest.com/docs/guides/delayed-functions

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "signup-flow" });

export const fn = inngest.createFunction(
  { id: "send-signup-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.sleepUntil("wait-for-iso-string", "2023-04-01T12:30:00");

    // You can also sleep until a timestamp within the event data.  This lets you
    // pass in a time for you to run the job:
    await step.sleepUntil("wait-for-timestamp", event.data.run_at); // Assuming event.data.run_at is a timestamp.

    await step.run("do-some-work-in-the-future", async () => {
      // This runs at the specified time.
    });
  }
);

```

--------------------------------

TITLE: Configure Rate Limiting for Inngest Functions (v1 & v2)
DESCRIPTION: Illustrates the change in Inngest SDK from using `throttle` to `rateLimit` for configuring function execution limits. `rateLimit` provides clearer semantics for controlling how often a function can be triggered.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    name: "Example",
    throttle: { count: 5 }, // ❌ Invalid in v2
    rateLimit: { limit: 5 }, // ✅ Valid in v2
  },
  { event: "app/user.created" },
  async ({ tools, step }) => {
    // ...
  }
);

```

--------------------------------

TITLE: Webhook Transform Function
DESCRIPTION: Example of the default webhook transform function used by Inngest to convert incoming webhook payloads into the Inngest event format.

SOURCE: https://www.inngest.com/docs/platform/webhooks/build-an-integration

LANGUAGE: APIDOC
CODE:
```
## Webhook Transform Function

### Description
This is the default transform function provided by Inngest for webhook integrations. It processes incoming webhook payloads and transforms them into the Inngest event format. You can customize this function for specific provider needs.

### Code Example
```javascript
function transform(evt, headers = {}, queryParams = {}, raw = "") {
  return {
    // This was created by the <Provider name> integration.
    // Edit this to customize the event name and payload.
    name: `<provider-name-slug>/${evt.type || evt.name || evt.event_type || "webhook.received"}`,
    data: evt.data || evt,
  };
};
```
```

--------------------------------

TITLE: Serve Next.js Functions (v3 vs v2)
DESCRIPTION: Compares the v3 and v2 syntax for serving Inngest functions with Next.js. v3 uses an options object for configuration, while v2 passes arguments directly.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/next";
import { inngest, functions } from "~/inngest";

export default serve({
  client: inngest,
  functions,
  // ...options
});
```

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/next";
import { inngest, functions } from "~/inngest";

export default serve(inngest, functions, {
  // ...options
});
```

--------------------------------

TITLE: Inngest `ctx` Object Properties
DESCRIPTION: The 'ctx' object provides essential information about the current function execution, including attempt count, event payload, logging capabilities, and the unique run ID.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: python
CODE:
```
class Event:
    data: dict[str, object]
    id: str
    name: str
    ts: int

class ctx:
    attempt: int
    event: Event
    events: list[Event]
    logger: logging.Logger
    run_id: str
```

--------------------------------

TITLE: Basic Concurrency Limit in Inngest Functions
DESCRIPTION: Sets a maximum number of concurrently executing steps for a single Inngest function. When the limit is reached, new steps are queued. This is useful for basic rate limiting of a function's operations.

SOURCE: https://www.inngest.com/docs/guides/concurrency

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "generate-ai-summary",
    concurrency: 10,
  },
  { event: "ai/summary.requested" },
  async ({ event, step }) => {
    // Your function handler here
  }
);
```

--------------------------------

TITLE: Send Event from Inngest Function (TypeScript)
DESCRIPTION: Send an event from within an Inngest function using `step.sendEvent`. This ensures reliable delivery and prevents duplicate events by wrapping the request in a step. It's the recommended method for sending events inside functions.

SOURCE: https://www.inngest.com/docs/events

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "user-onboarding" },
  { event: "app/user.signup" },
  async ({ event, step }) => {
    // Do something
    await step.sendEvent("send-activation-event", {
      name: "app/user.activated",
      data: { userId: event.data.userId },
    });
    // Do something else
  }
);
```

--------------------------------

TITLE: Registering Middleware in Inngest Client and Functions (TypeScript)
DESCRIPTION: Demonstrates how to register middleware at both the Inngest client level and individual function levels using the Inngest TypeScript SDK. Middleware registered on the client runs before function-specific middleware.

SOURCE: https://www.inngest.com/docs/features/middleware

LANGUAGE: typescript
CODE:
```
const inngest = new Inngest({
  id: "my-app",
  middleware: [
    logMiddleware, // This is executed first
    errorMiddleware, // This is executed second
  ],
});

inngest.createFunction(
  {
    id: "example",
    middleware: [
      dbSetupMiddleware, // This is executed third
      datadogMiddleware, // This is executed fourth
    ],
  },
  { event: "test" },
  async () => {
    // ...
  }
);
```

--------------------------------

TITLE: Handle All Inngest Function Failures with System Event (TypeScript)
DESCRIPTION: This TypeScript example shows how to create a function that listens to the `inngest/function.failed` system event. This approach allows you to catch and handle failures across all functions within an Inngest environment.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/failure-handlers

LANGUAGE: typescript
CODE:
```
/* Option 2: Listens for the [`inngest/function.failed`](/docs/reference/functions/handling-failures#the-inngest-function-failed-event) system event to catch all failures in the inngest environment*/
inngest.createFunction(
  { id: "handle-any-fn-failure" },
  { event: "inngest/function.failed" },
  async ({ event }) => { /* ... */ },
);

```

--------------------------------

TITLE: Splitting Asynchronous Actions into Multiple Inngest Steps (TypeScript)
DESCRIPTION: Demonstrates the best practice of splitting distinct asynchronous operations into separate `step.run` calls. This prevents issues where a failure in one part of the operation causes the entire step to be retried unnecessarily, ensuring independent retries for each side effect.

SOURCE: https://www.inngest.com/docs/guides/multi-step-functions

LANGUAGE: typescript
CODE:
```
const alertId = await step.run("create-alert", () => createAlert());

await step.run("send-alert-link", () => sendAlertLinkToSlack(alertId));

```

--------------------------------

TITLE: Cancel Function on Matching Event Property
DESCRIPTION: Configure event-based cancellation where the function is cancelled if a specific property in the trigger event matches a property in the cancelling event. This example matches on `data.userId`.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "cancelOn": [
    {
      "event": "cancellation.event",
      "match": "data.userId"
    }
  ]
}
```

--------------------------------

TITLE: Assert individual step state
DESCRIPTION: Asserts the output or outcome of individual steps within a function run. The `state` object provides access to the results or errors of each step, allowing for granular testing.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
const { state } = await t.execute();
expect(state["my-step"]).resolves.toEqual("some successful output");
expect(state["dangerous-step"]).rejects.toThrowError("something failed");
```

--------------------------------

TITLE: Create Scheduled Function with Timezone (TypeScript)
DESCRIPTION: This snippet shows how to create a scheduled function in Inngest using TypeScript. It specifies a cron schedule with a timezone (e.g., 'Europe/Paris') and demonstrates a fan-out pattern by processing users and sending events for each.

SOURCE: https://www.inngest.com/docs/guides/scheduled-functions

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "signup-flow" });

// This weekly digest function will run at 12:00pm on Friday in the Paris timezone
export const prepareWeeklyDigest = inngest.createFunction(
  { id: "prepare-weekly-digest" },
  { cron: "TZ=Europe/Paris 0 12 * * 5" },
  async ({ step }) => {
    // Load all the users from your database:
    const users = await step.run(
      "load-users",
      async () => await db.load("SELECT * FROM users")
    );

    // 💡 Since we want to send a weekly digest to each one of these users
    // it may take a long time to iterate through each user and send an email.

    // Instead, we'll use this scheduled function to send an event to Inngest
    // for each user then handle the actual sending of the email in a separate
    // function triggered by that event.

    // ✨ This is known as a "fan-out" pattern ✨

    // 1️⃣ First, we'll create an event object for every user return in the query:
    const events = users.map((user) => {
      return {
        name: "app/send.weekly.digest",
        data: {
          user_id: user.id,
          email: user.email,
        },
      };
    });

    // 2️⃣ Now, we'll send all events in a single batch:
    await step.sendEvent("send-digest-events", events);

    // This function can now quickly finish and the rest of the logic will
    // be handled in the function below ⬇️
  }
);

// This is a regular Inngest function that will send the actual email for
// every event that is received (see the above function's inngest.send())

// Since we are "fanning out" with events, these functions can all run in parallel
export const sendWeeklyDigest = inngest.createFunction(
  { id: "send-weekly-digest-email" },
  { event: "app/send.weekly.digest" },
  async ({ event }) => {
    // 3️⃣ We can now grab the email and user id from the event payload
    const { email, user_id } = event.data;

    // 4️⃣ Finally, we send the email itself:
    await email.send("weekly_digest", email, user_id);

    // 🎇 That's it! - We've used two functions to reliably perform a scheduled
    // task for a large list of users!
  }
);

```

--------------------------------

TITLE: Setup Inngest Middleware for Go HTTP
DESCRIPTION: Configure Inngest support for standard Go HTTP handlers or frameworks like chi by setting up middleware. This involves initializing the Inngest provider with your API domain.

SOURCE: https://www.inngest.com/docs/learn/rest-endpoints

LANGUAGE: go
CODE:
```
import (
	"context"
	"net/http"

	"github.com/inngest/inngestgo/step"
	"github.com/inngest/inngestgo/stephttp"
	"github.com/go-chi/chi/v5"
)

func setuphttp() {
	// provider adds inngest support to http handlers
	provider := stephttp.Setup(stephttp.SetupOpts{
		Domain: "api.example.com", // add your api domain here.
	})

  // provider allows you to wrap individual http handlers via `provider.servehttp`,
  // and provides stdlib-compatible middleware via `provider.middleware`
  http.HandleFunc("/users", provider.ServeHTTP(handleUsers))

  // or, via middleware with, for example, chi:
  r := chi.NewRouter()
  r.Use(provider.Middleware)
  r.Get("/users", handleUsers)
}

```

--------------------------------

TITLE: Example Event Payload for Inngest Function
DESCRIPTION: A JSON payload example used to trigger an Inngest function. This specific payload is designed for the 'hello-world' function, providing an 'email' field within the 'data' object.

SOURCE: https://www.inngest.com/docs/getting-started/nextjs-quick-start

LANGUAGE: json
CODE:
```
{
  "data": {
    "email": "test@example.com"
  }
}

```

--------------------------------

TITLE: Bulk Cancel Functions via REST API (cURL)
DESCRIPTION: This snippet demonstrates how to cancel Inngest functions in bulk using a cURL command. It targets the `POST /cancellations` endpoint and includes parameters for app ID, function ID, a time range, and an optional conditional expression for precise cancellation.

SOURCE: https://www.inngest.com/docs/guides/cancel-running-functions

LANGUAGE: curl
CODE:
```
curl -X POST https://api.inngest.com/v1/cancellations \
  -H 'Authorization: Bearer signkey-prod-<YOUR-SIGNING-KEY>' \
  -H 'Content-Type: application/json' \
  --data '{
    "app_id": "acme-app",
    "function_id": "schedule-reminder",
    "started_after": "2024-01-21T18:23:12.000Z",
    "started_before": "2024-01-22T14:22:42.130Z",
    "if": "event.data.userId == 'user_o9235hf84hf'"
  }'
```

--------------------------------

TITLE: Cancel Function with `cancelOn` and `match` (TypeScript)
DESCRIPTION: This example shows how to configure `cancelOn` using a `match` property to link the triggering event and the cancellation event based on a specific field, like `data.userId`. This is useful for scenarios like canceling a sync operation when a user is deleted.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/cancel-on

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "sync-contacts",
    cancelOn: [
      {
        event: "app/user.deleted",
        // ensure the async (future) event's userId matches the trigger userId
        if: "async.data.userId == event.data.userId",
      },
    ],
  },
  { event: "app/user.created" },
  // ...
);
```

--------------------------------

TITLE: Trigger Types
DESCRIPTION: Defines the structure for event-based and cron-based triggers.

SOURCE: https://www.inngest.com/docs/reference/python/functions/create

LANGUAGE: APIDOC
CODE:
```
## Triggers

### `TriggerEvent`

- **`event`** (str) - Required: `required` - The name of the event.
- **`expression`** (str) - Required: `optional` - A match expression using arbitrary event data.

### `TriggerCron`

- **`cron`** (str) - Required: `required` - A unix-cron compatible schedule string. Optional timezone prefix, e.g. `TZ=Europe/Paris 0 12 * * 5`.
```

--------------------------------

TITLE: Send Event from Inngest Function (Python)
DESCRIPTION: Demonstrates sending a single event from within an Inngest function using the Python SDK. Requires the `inngest` library. The `step.send_event` function takes a step ID and an Inngest Event object.

SOURCE: https://www.inngest.com/docs/reference/python/steps/send-event

LANGUAGE: python
CODE:
```
import inngest

@inngest_client.create_function(
    fn_id="my_function",
    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def fn(ctx: inngest.Context) -> list[str]:
    return await ctx.step.send_event("send", inngest.Event(name="foo"))
```

--------------------------------

TITLE: Trigger Inngest Function on New User Creation
DESCRIPTION: TypeScript code for an Inngest Function that is triggered by a 'db/user.create' event. It sends a welcome email, waits for 3 days, and then sends a follow-up email with tips. It uses the inngest client and a hypothetical sendEmail function.

SOURCE: https://www.inngest.com/docs/features/events-triggers/prisma-pulse

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";
import { sendEmail } from "@/lib/email"

export const handleNewUser = inngest.createFunction(
  { id: "handle-new-user" },
  { event: "db/user.create" },
  async ({ event, step }) => {
    // This object includes the entire record that changed
    const pulseEvent = event.data;

    await step.run("send-welcome-email", async () => {
  		// Send welcome email
      await sendEmail({
        template: "welcome",
        to: pulseEvent.created.email,
      });
    });

    await step.sleep("wait-before-tips", "3d");

    await step.run("send-new-user-tips-email", async () => {
      // Follow up with some helpful tips
      await sendEmail({
        template: "new-user-tips",
        to: pulseEvent.created.email,
      });
    });
  },
);

```

--------------------------------

TITLE: Initialize Middleware with Lifecycle Hooks (TypeScript)
DESCRIPTION: Demonstrates how to initialize middleware in the Inngest TypeScript SDK. The `init()` function can return functions for both the initial and subsequent lifecycles, supporting both synchronous and asynchronous operations.

SOURCE: https://www.inngest.com/docs/reference/middleware/lifecycle

LANGUAGE: TypeScript
CODE:
```
import { type Middleware } from "inngest";

export const myMiddleware: Middleware = {
  init: () => {
    // Lifecycle hook functions can be sync or async
    return {
      beforeExecution: async (ctx) => {
        console.log("Before execution");
      },
      afterExecution: (ctx) => {
        console.log("After execution");
      }
    };
  }
}; 

```

--------------------------------

TITLE: Throw Standard Errors in Inngest Functions (TypeScript)
DESCRIPTION: Demonstrates how to throw standard JavaScript errors within an Inngest function handler or steps. These errors are automatically handled and retried by Inngest. This is useful for general error reporting and handling unexpected issues during function execution.

SOURCE: https://www.inngest.com/docs/functions/retries

LANGUAGE: typescript
CODE:
```
import { inngest } from "./inngest";

export default inngest.createFunction(
  { id: "import-item-data" },
  { event: "store/import.requested" },
  async ({ event, step }) => {

    // throwing a standard error
    if (!event.itemId) {
      throw new Error("Item ID is required");
    }

    // throwing an error within a step
    const item = await step.run('fetch-item', async () => {
      const response = await fetch(`https://api.ecommerce.com/items/${event.itemId}`);
      if (response.status === 500) {
        throw new Error("Failed to fetch item from ecommerce API");
      }
      // ...
    });
  }
);

```

--------------------------------

TITLE: Serve Inngest Functions with Express.js
DESCRIPTION: Imports the Inngest `serve` handler and integrates it into an Express.js application using `app.use`. Requires the Inngest signing key and a list of Inngest functions to be served. This enables Inngest to securely invoke functions via HTTP.

SOURCE: https://www.inngest.com/docs/guides/trigger-your-code-from-retool

LANGUAGE: javascript
CODE:
```
import { serve } from "inngest/express"
import runBackfillForUser from "../inngest/runBackfillForUser"

app.use("/api/inngest", serve("My API", process.env.INNGEST_SIGNING_KEY, [
  runBackfillForUser,
]))
// your existing routes...
app.get("/api/whatever", ...)
app.post("/api/something_else", ...)

```

--------------------------------

TITLE: Inngest Function Failure Event Payload Example
DESCRIPTION: This JSON object represents the structure of the `inngest/function.failed` event. It contains details about the error, the original event data, the function's ID, the run ID, and the timestamp of the failure. This structure is useful for understanding and handling function failures.

SOURCE: https://www.inngest.com/docs/reference/system-events/inngest-function-failed

LANGUAGE: json
CODE:
```
{
  "name": "inngest/function.failed",
  "data": {
    "error": {
      "__serialized": true,
      "error": "invalid status code: 500",
      "message": "taylor@ok.com is already a list member. Use PUT to insert or update list members.",
      "name": "Error",
      "stack": "Error: taylor@ok.com is already a list member. Use PUT to insert or update list members.\n    at /var/task/.next/server/pages/api/inngest.js:2430:23\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async InngestFunction.runFn (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/components/InngestFunction.js:378:32)\n    at async InngestCommHandler.runStep (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/components/InngestCommHandler.js:459:25)\n    at async InngestCommHandler.handleAction (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/components/InngestCommHandler.js:359:33)\n    at async ServerTiming.wrap (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/helpers/ServerTiming.js:69:21)\n    at async ServerTiming.wrap (/var/task/node_modules/.pnpm/inngest@2.6.0_typescript@5.1.6/node_modules/inngest/helpers/ServerTiming.js:69:21)"
    },
    "event": {
      "data": { "billingPlan": "pro" },
      "id": "01H0TPSHZTVFF6SFVTR6E25MTC",
      "name": "user.signup",
      "ts": 1684523501562,
      "user": { "external_id": "6463da8211cdbbcb191dd7da" }
    },
    "function_id": "my-gcp-cloud-functions-app-hello-inngest",
    "run_id": "01H0TPSJ576QY54R6JJ8MEX6JH"
  },
  "id": "01H0TPW7KB4KCR739TG2J3FTHT",
  "ts": 1684523589227
}
```

--------------------------------

TITLE: Async Middleware Initialization - TypeScript
DESCRIPTION: Illustrates how to perform asynchronous operations during middleware initialization, such as connecting to a database. The `init` function can be an `async` function, and the Inngest SDK will wait for it to resolve.

SOURCE: https://www.inngest.com/docs/features/middleware/create

LANGUAGE: typescript
CODE:
```
import { InngestMiddleware } from "inngest";

new InngestMiddleware({
  name: "Example Middleware",
  async init() {
    const db = await connectToDatabase(); // Assuming connectToDatabase is an async function

    return {};
  },
});

```

--------------------------------

TITLE: Handling step.invoke() Promises
DESCRIPTION: Demonstrates different ways to handle the Promise returned by step.invoke(), including using 'await' and '.then()', and running multiple invocations in parallel.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: APIDOC
CODE:
```
## Handling `step.invoke()` Promises

### Description
Handling `step.invoke()` is similar to handling any other Promise in JavaScript. You can use `await` for direct handling or `.then()` for chaining operations. You can also run multiple invocations concurrently using `Promise.all()`.

### Examples

#### Using the `await` keyword
```typescript
const result = await step.invoke("invoke-function", {
  function: someInngestFn,
  data: { ... },
});
```

#### Using `.then` for chaining
```typescript
step
  .invoke("invoke-function", { function: someInngestFn, data: { ... } })
  .then((result) => {
    // further processing
  });
```

#### Running multiple invocations in parallel
```typescript
Promise.all([
  step.invoke("invoke-first-function", {
    function: firstFunctionReference,
    data: { ... },
  }),
  step.invoke("invoke-second-function", {
    function: secondFn,
    data: { ... },
  }),
]);
```
```

--------------------------------

TITLE: step.sleep() - Pause Function Execution
DESCRIPTION: The `step.sleep()` function allows you to pause the execution of your Inngest function for a specified duration. This is useful for implementing delays, rate limiting, or waiting for external events. The duration can be provided as a number of milliseconds, a string compatible with the 'ms' package (e.g., '30m', '3 hours'), or a Temporal.Duration object (v3.3.3+). Remember to use `await` when calling `step.sleep()` to ensure proper pausing.

SOURCE: https://www.inngest.com/docs/reference/functions/step-sleep

LANGUAGE: APIDOC
CODE:
```
## `step.sleep(id, duration)`

### Description
Pauses the execution of the Inngest function for a specified duration.

### Method
`step.sleep(id: string, duration: number | string | Temporal.Duration): Promise<void>`

### Parameters
#### Path Parameters
* **id** (string) - Required - The ID of the step, used for logging and memoizing step state.
* **duration** (number | string | Temporal.Duration) - Required - The duration to sleep. Can be milliseconds (number), a string format like '30m' or '3 hours', or a `Temporal.Duration` object.

### Request Example
```typescript
// Sleep for 30 minutes using Temporal.Duration
const thirtyMins = Temporal.Duration.from({ minutes: 30 });
await step.sleep("wait-with-temporal", thirtyMins);

// Sleep for 30 minutes using a string
await step.sleep("wait-with-string", "30m");
await step.sleep("wait-with-string-alt", "30 minutes");

// Sleep for 30 minutes using milliseconds
await step.sleep("wait-with-ms", 30 * 60 * 1000);
```

### Response
#### Success Response (200)
This function does not return a value upon successful completion, but resolves the promise after the specified duration has passed.
```

--------------------------------

TITLE: Implement Backend Workflow Actions with EngineAction
DESCRIPTION: Implements the backend logic for workflow actions by defining a handler function that processes events and steps. It extends the frontend definition by adding the `handler`.

SOURCE: https://www.inngest.com/docs/reference/workflow-kit/actions

LANGUAGE: typescript
CODE:
```
import { type EngineAction } from "@inngest/workflow-kit";

import { actionsDefinition } from "./actions-definition";

export const actions: EngineAction[] = [
{
    // Add a Table of Contents
    ...actionsDefinition[0],
    handler: async ({ event, step, workflow, workflowAction, state }) => {
        // ...
    }
},
];
```

--------------------------------

TITLE: Transition `createScheduledFunction` to `inngest.createFunction()`
DESCRIPTION: Demonstrates the conversion from the deprecated `createScheduledFunction` (or `inngest.createScheduledFunction`) to the unified `inngest.createFunction()` method. The cron schedule is now passed within the configuration object.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
// ❌ Removed in v1
const scheduledFn = createScheduledFunction( // or inngest.createScheduledFunction
  "Scheduled",
  "0 9 * * MON",
  async ({ event }) => "..."
);

```

LANGUAGE: typescript
CODE:
```
// ✅ Valid in v1
const inngest = new Inngest({ name: "My App" });

const scheduledFn = inngest.createFunction(
  { name: "Scheduled" },
  { cron: "0 9 * * MON" },
  async ({ event, step }) => "..."
);

```

--------------------------------

TITLE: Define Account Scoped Concurrency Limits in TypeScript
DESCRIPTION: Demonstrates how to define different account-scoped concurrency limits for two separate Inngest functions using TypeScript. It highlights how functions can share a common scope and key but have distinct limits.

SOURCE: https://www.inngest.com/docs/guides/concurrency

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "func-a",
    concurrency: {
      scope: "account",
      key: "\"openai\"",
      limit: 5,
    },
  },
  { event: "ai/summary.requested" },
  async ({ event, step }) => {
  }
);

inngest.createFunction(
  {
    id: "func-b",
    concurrency: {
      scope: "account",
      key: "\"openai\"",
      limit: 50,
    },
  },
  { event: "ai/summary.requested" },
  async ({ event, step }) => {
  }
);

```

--------------------------------

TITLE: Sleep with Various Durations (TypeScript)
DESCRIPTION: Demonstrates how to use `step.sleep()` with different duration formats: Temporal.Duration, string representations (compatible with `ms` package), and milliseconds. The `step.sleep()` function must be awaited.

SOURCE: https://www.inngest.com/docs/reference/functions/step-sleep

LANGUAGE: TypeScript
CODE:
```
// Sleep for 30 minutes
const thirtyMins = Temporal.Duration.from({ minutes: 30 });
await step.sleep("wait-with-temporal", thirtyMins);

await step.sleep("wait-with-string", "30m");
await step.sleep("wait-with-string-alt", "30 minutes");
await step.sleep("wait-with-ms", 30 * 60 * 1000);
```

--------------------------------

TITLE: Access Injected OpenAI Client in Inngest Function
DESCRIPTION: Shows how an Inngest Function can directly access the OpenAI client injected via middleware. The `openai` client is destructured from the function's arguments, simplifying API calls.

SOURCE: https://www.inngest.com/docs/reference/middleware/typescript

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
 {
  name: "user-create"
 },
 {
  event: "app/user.create"
 },
 async ({ openai }) => {
   const chatCompletion = await openai.chat.completions.create({
     messages: [{
      role: "user",
      content: "Say this is a test"
     }],
     model: "gpt-3.5-turbo",
   });

   // ...
 },
);
```

--------------------------------

TITLE: Serve Inngest with Express
DESCRIPTION: This snippet shows how to serve Inngest functions within an Express.js application. It requires the `express.json()` middleware to parse incoming payloads and advises on setting the payload limit.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/express";
import { inngest } from "./src/inngest/client";
import fnA from "./src/inngest/fnA"; // Your own function

// Important:  ensure you add JSON middleware to process incoming JSON POST payloads.
app.use(express.json());
app.use(
  // Expose the middleware on our recommended path at `/api/inngest`.
  "/api/inngest",
  serve({ client: inngest, functions: [fnA] })
);

```

--------------------------------

TITLE: Serve Inngest with Fastify Plugin
DESCRIPTION: This example illustrates serving Inngest functions using the recommended `fastifyPlugin` for Fastify. It registers the plugin with the Inngest client and functions.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import Fastify from "fastify";
import { fastifyPlugin } from "inngest/fastify";
import { inngest, fnA } from "./inngest";

const fastify = Fastify();

fastify.register(fastifyPlugin, {
  client: inngest,
  functions: [fnA],
  options: {},
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

```

--------------------------------

TITLE: Run Synchronous or Asynchronous Code as a Step
DESCRIPTION: Demonstrates how to use `step.run()` to execute code, either synchronously or asynchronously, as a distinct, retriable step within an Inngest function. The function returns a Promise that resolves with the handler's return value. This is useful for tasks like copying data to S3.

SOURCE: https://www.inngest.com/docs/reference/functions/step-run

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "import-product-images" },
  { event: "shop/product.imported" },
  async ({ event, step }) => {
    const uploadedImageURLs = await step.run("copy-images-to-s3", async () => {
      return copyAllImagesToS3(event.data.imageURLs);
    });
  }
);
```

--------------------------------

TITLE: Set Function Priority with CEL
DESCRIPTION: Configure the priority of an Inngest function using a CEL expression. This example sets priority based on the `event.data.priority` field, assuming it returns an integer within the allowed range.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "priority": {
    "run": "event.data.priority"
  }
}
```

--------------------------------

TITLE: Publish to Multiple Channels/Topics from a Function (TypeScript)
DESCRIPTION: This example demonstrates publishing updates to both a global channel and a post-specific channel from an Inngest function. It simulates liking a post and sends an 'updated' event to the post channel and a log to the global channel. Dependencies include 'inngest', '@inngest/realtime', and the channel definitions from 'channels.ts'.

SOURCE: https://www.inngest.com/docs/examples/realtime

LANGUAGE: typescript
CODE:
```
import {
  channel,
  realtimeMiddleware,
  subscribe,
  topic,
} from "@inngest/realtime";
import { EventSchemas, Inngest } from "inngest";
import { globalChannel, postChannel } from "../channels";

export const likePost = app.createFunction(
  {
    id: "post/like",
    retries: 0,
  },
  {
    event: "app/post.like",
  },
  async ({ event: { data: { postId = "123" } }, step, publish }) => {
    if (!postId) {
      await publish(
        globalChannel().logs("Missing postId when trying to like post")
      );
      throw new Error("Missing postId");
    }

    await publish(globalChannel().logs(`Liking post ${postId}`));

    // Fake a post update
    const post = await step.run("Update likes", async () => {
      const fakePost = {
        id: "123",
        likes: Math.floor(Math.random() * 10000),
      };

      return publish(postChannel(fakePost.id).updated(fakePost));
    });

    return post;
  }
);


```

--------------------------------

TITLE: PUT /api/inngest
DESCRIPTION: Triggers the SDK to register all functions with Inngest using the signing key.

SOURCE: https://www.inngest.com/docs/reference/serve

LANGUAGE: APIDOC
CODE:
```
## PUT /api/inngest

### Description
Triggers the SDK to register all functions with Inngest using the signing key.

### Method
PUT

### Endpoint
/api/inngest

### Parameters
#### Request Body
- **signingKey** (string) - Required - The Inngest Signing Key for your selected environment. Recommended to set as `INNGEST_SIGNING_KEY` environment variable.

### Response
#### Success Response (200)
- **message** (string) - A success message indicating the functions were registered.

#### Response Example
```json
{
  "message": "Functions registered successfully."
}
```
```

--------------------------------

TITLE: Define Inngest 'hello-world' Function (TypeScript)
DESCRIPTION: Defines a simple Inngest function named 'hello-world' that waits for a second and returns a greeting. It's triggered by the 'test/hello.world' event. Requires the Inngest client to be initialized.

SOURCE: https://www.inngest.com/docs/getting-started/nextjs-quick-start

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

```

--------------------------------

TITLE: Concurrency Control Across Specific Steps
DESCRIPTION: Guidance on how to manage concurrency for individual steps within an Inngest function by extracting them into separate, invoked functions.

SOURCE: https://www.inngest.com/docs/guides/concurrency

LANGUAGE: APIDOC
CODE:
```
## Step Concurrency Management via Invocation

### Description
This section explains how to achieve fine-grained concurrency control for specific steps within a larger Inngest function. The recommended approach is to extract the step into its own function and use `step.invoke` to call it, allowing independent concurrency settings.

### Method
N/A (Conceptual guidance for function design)

### Endpoint
N/A

### Parameters
N/A

### Request Example
```typescript
// In the main function:
const result = await step.invoke('preprocess-data', async () => {
  // This step has its own concurrency limits defined when its function is created.
  // It might have a higher limit than the main function.
  return await fetch('/api/preprocess', { ... }); 
});

// In a separate function definition (e.g., 'preprocess-data.ts'):
inngest.createFunction(
  {
    id: 'preprocess-data-function',
    concurrency: [
      {
        scope: 'fn',
        key: 'event.data.accountId',
        limit: 5 // Higher concurrency for preprocessing
      }
    ]
  },
  { event: 'data/preprocess.requested' },
  async ({ event, step }) => {
    // ... preprocessing logic ...
    return { processedData: '...' };
  }
);
```

### Response
N/A
```

--------------------------------

TITLE: Mocking Inngest Events
DESCRIPTION: Demonstrates how to mock incoming events for Inngest functions. Events can be mocked individually or as batches. If no events are mocked, a default 'inngest/function.invoked' event is used.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
t.execute({
  events: [{ name: "demo/event.sent", data: { message: "Hi!" } }],
});
```

--------------------------------

TITLE: Rate Limit Function Priority based on Plan using CEL
DESCRIPTION: This example sets function priority based on a 'plan' field in the event data, assigning higher priority (180) to 'enterprise' plans and a default of 0.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "priority": {
    "run": "event.data.plan == 'enterprise' ? 180 : 0"
  }
}
```

--------------------------------

TITLE: Logger Interface Definition (TypeScript)
DESCRIPTION: Defines the TypeScript interface for the Inngest logger, outlining the available methods for logging different severity levels: info, warn, error, and debug.

SOURCE: https://www.inngest.com/docs/guides/logging

LANGUAGE: typescript
CODE:
```
export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}
```

--------------------------------

TITLE: Shared Concurrency Limits Across Functions (Scope)
DESCRIPTION: Configures concurrency limits that are shared across multiple functions within an Inngest account. Uses a static key (e.g., 'openai') to define a shared virtual queue for functions referencing the same scope and key.

SOURCE: https://www.inngest.com/docs/guides/concurrency

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "generate-ai-summary",
    concurrency: [
      {
        scope: "account",
        key: "openai",
        limit: 60,
      },
    ],
  },
  { event: "ai/summary.requested" },
  async ({ event, step }) => {
  }
);
```

--------------------------------

TITLE: Parallelize HTTP Requests with step.fetch()
DESCRIPTION: Demonstrates parallelizing multiple HTTP requests using `step.fetch()` within an Inngest function. Requests are offloaded and processed concurrently, respecting the function's concurrency limits.

SOURCE: https://www.inngest.com/docs/examples/fetch

LANGUAGE: typescript
CODE:
```
const processFiles = inngest.createFunction(
  { id: "process-files", concurrency: 10 },
  { event: "files/process" },
  async ({ step, event }) => {
    // All requests will be offloaded and processed in parallel while matching the concurrency limit
    const responses = await Promise.all(event.data.files.map(async (file) => {
      return step.fetch(`https://api.example.com/files/${file.id}`)
    }))

    // Your Inngest function is resumed here with the responses
    await step.run("process-file", async (file) => {
      const body = await response.json()
      // body.files
    })
  }
)

```

--------------------------------

TITLE: Create Inngest Function (JavaScript)
DESCRIPTION: Demonstrates how to create an Inngest function that listens for a 'clerk/user.created' event and sends a welcome email using the Resend API. This includes using Inngest's step-based execution for asynchronous operations.

SOURCE: https://www.inngest.com/docs/platform/webhooks

LANGUAGE: javascript
CODE:
```
inngest.createFunction(
  { name: "Send welcome email", id: "send-welcome-email" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    const emailAddress = event.data.email_addresses[0].email_address;
    await step.run('send-email', async () => {
      return await resend.emails.send({
        to: emailAddress,
        from: "noreply@inngest.com",
        subject: "Welcome to Inngest!",
        react: WelcomeEmail(),
      })
    });
  }
)
```

--------------------------------

TITLE: Determining Event Types in Handler
DESCRIPTION: Learn how to inspect the `event.name` property within a function handler to determine which specific event triggered the execution, enabling type narrowing.

SOURCE: https://www.inngest.com/docs/guides/multiple-triggers

LANGUAGE: APIDOC
CODE:
```
## Event Type Determination

### Description
This example shows how to check the `event.name` within an Inngest function handler to conditionally execute logic based on the triggering event.

### Code Example
```typescript
// Assuming 'event' is typed as EventA | EventB | InngestScheduledEvent | InngestFnInvoked
async ({ event }) => {
  if (event.name === "user.created") {
    // `event` is type narrowed to user.created event
    console.log("User created:", event.data);
  } else if (event.name === "user.updated") {
    // `event` is type narrowed to user.updated event
    console.log("User updated:", event.data);
  } else if (event.name === "cron.5_minutes") {
    // `event` is type narrowed to the scheduled event
    console.log("Cron triggered");
  }
}
```

**Note:** For batched events, you will need to assert the shape of each event individually within the batch.
```

--------------------------------

TITLE: Inngest v2 Replacing 'tools' with 'step'
DESCRIPTION: Demonstrates the removal of the 'tools' parameter in Inngest v2 function definitions and its replacement with the 'step' parameter. This change streamlines function execution and tool usage.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { name: "Example" },
  { event: "app/user.created" },
  async ({ tools, step }) => {
    // ❌ Invalid in v2
    await tools.run("Foo", () => {});

    // ✅ Valid in v1 and v2
    await step.run("Foo", () => {});
  }
);

```

--------------------------------

TITLE: Stream Updates from a Single Function Run (TypeScript)
DESCRIPTION: This snippet shows how to trigger an Inngest function and subscribe to its updates using a unique channel. It sets up a POST endpoint to receive a prompt, send an event to Inngest, and return a stream of logs. Dependencies include 'crypto' and '@inngest/realtime'.

SOURCE: https://www.inngest.com/docs/examples/realtime

LANGUAGE: typescript
CODE:
```
import crypto from "crypto";
import { inngest } from "@/inngest/client";
import { subscribe } from "@inngest/realtime";

export async function POST(req: Request) {
  const json = await req.json();
  const { prompt } = json;
  const uuid = crypto.randomUUID();

  await inngest.send({
    name: "hello-world/hello",
    data: { uuid },
  });

  const stream = await subscribe(inngest, {
    channel: `hello-world.${uuid}`,
    topics: ["logs"],
  });

  return new Response(stream.getEncodedStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

```

--------------------------------

TITLE: Add OpenAI Client to Inngest Functions (TypeScript v3.34.0+)
DESCRIPTION: This code snippet demonstrates how to add an OpenAI client to all Inngest functions using the `dependencyInjectionMiddleware` in TypeScript version 3.34.0 and above. This allows functions to access the client without explicit instantiation.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection_guide=typescript

LANGUAGE: typescript
CODE:
```
import { openai } from "@openai/client";
import { inngest } from "./inngest";

export const helloWorld = inngest.createMiddleware({
  name: "dependencyInjectionMiddleware",
  middleware: (
    { handler } // { handler } is the Inngest Function definition
  ) => {
    return {
      // handler gets passed to the new function
      handler: async (request) => {
        const openaiClient = new openai.OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        // The function receives the client as an argument.
        return handler(request, { openaiClient });
      },
    };
  },
});

export const myInngestFunction = inngest.createFunction({
  name: "My First Function",
  middleware: [helloWorld],
  trigger: { event: "test.event" },
  async fn({ event, openaiClient }) {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello world" }],
    });
    return response.choices[0].message.content;
  },
});
```

--------------------------------

TITLE: Handle Inngest Function Failures with onFailure Handler (TypeScript)
DESCRIPTION: This snippet demonstrates how to define a function-specific `onFailure` handler in TypeScript. The handler is executed when a function exhausts all its retries, allowing for custom error handling logic such as unsubscribing a user.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/failure-handlers

LANGUAGE: typescript
CODE:
```
/* Option 1: give the inngest function an `onFailure` handler. */
inngest.createFunction(
  {
    id: "update-subscription",
    retries: 5,
    onFailure: async ({ event, error }) => {
      // if the subscription check fails after all retries, unsubscribe the user
      await unsubscribeUser(event.data.userId);
    },
  },
  { event: "user/subscription.check" },
  async ({ event }) => { /* ... */ },
);

```

--------------------------------

TITLE: Retries with Steps
DESCRIPTION: Individual steps within a function can also be configured with their own retry counts. This allows for finer-grained control over retries for different parts of your function's logic.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/retries

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "sync-systems" },
  { event: "auto/sync.request" },
  async ({ step }) => {
    // Can be retried up to 4 times
    const data = await step.run("get-data", async () => {
      return getDataFromExternalSource();
    });

    // Can also be retried up to 4 times
    await step.run("save-data", async () => {
      return db.syncs.insertOne(data);
    });
  },
);

```

--------------------------------

TITLE: Ensure Exclusive Function Execution (TypeScript)
DESCRIPTION: This code snippet demonstrates how to create an Inngest function that guarantees only one instance runs at a time for a given user ID. It utilizes the `singleton` option with a `skip` mode, preventing concurrent executions for the same `event.data.user_id`.

SOURCE: https://www.inngest.com/docs/reference/functions/singleton

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  {
    id: "data-sync",
    singleton: {
      key: "event.data.user_id",
      mode: "skip",
    },
  },
  { event: "data-sync.start" },
  async ({ event }) => {
    // This function will be skipped if another run of the same function is already running for the same user
  }
);
```

--------------------------------

TITLE: Initialize Inngest Client with Realtime Middleware (TypeScript)
DESCRIPTION: Initializes the Inngest client with the realtime middleware. This makes the `publish()` function available within Inngest functions.

SOURCE: https://www.inngest.com/docs/features/realtime

LANGUAGE: typescript
CODE:
```
import {
  Inngest,
} from "inngest";
// ℹ️ Import the middleware from the middleware sub-package:
import {
  realtimeMiddleware,
} from "@inngest/realtime/middleware";

export const inngest = new Inngest({
  id: "my-app",
  middleware: [realtimeMiddleware()],
});

```

--------------------------------

TITLE: Debounce Function Configuration
DESCRIPTION: Example of how to configure debounce for an Inngest Function in TypeScript, including setting the key, period, and timeout.

SOURCE: https://www.inngest.com/docs/guides/debounce

LANGUAGE: APIDOC
CODE:
```
## POST /inngest/functions

### Description
Configures an Inngest Function with debounce to delay execution until a series of events are no longer received within a specified period. This is useful for handling rapid, successive events.

### Method
POST

### Endpoint
`/inngest/functions`

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the function.
- **debounce** (object) - Optional - Configuration object for debounce behavior.
  - **key** (string) - Required - An expression to group events for debouncing (e.g., `event.data.account_id`).
  - **period** (string) - Required - The time delay to apply (e.g., `5m`, `1h`).
  - **timeout** (string) - Optional - The maximum time before the debounced function runs, even if new events are received (e.g., `10m`).
- **event** (object) - Required - Defines the event trigger for the function.
  - **name** (string) - Required - The name of the event (e.g., `intercom/company.updated`).

### Request Example
```json
{
  "id": "handle-webhook",
  "debounce": {
    "key": "event.data.account_id",
    "period": "5m",
    "timeout": "10m"
  },
  "event": {
    "name": "intercom/company.updated"
  }
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message that the function is configured.

#### Response Example
```json
{
  "message": "Function configured successfully"
}
```
```

--------------------------------

TITLE: Function Level Idempotency (Consumer)
DESCRIPTION: Ensure a function is only executed once per unique key derived from the event payload within a 24-hour period using the `idempotency` configuration.

SOURCE: https://www.inngest.com/docs/guides/handling-idempotency

LANGUAGE: APIDOC
CODE:
```
## Inngest Function with Idempotency Configuration

### Description
Creates an Inngest function that handles the `cart/checkout.completed` event, ensuring that the `send-checkout-email` function is executed only once per unique `cartId` within a 24-hour window.

### Method
POST (Inngest Internal Trigger)

### Endpoint
(Internal Inngest Endpoint)

### Parameters
#### Request Body (Event Payload)
- **name** (string) - Required - The name of the event, e.g., `cart/checkout.completed`.
- **data** (object) - Required - The payload of the event.
  - **email** (string) - Required - The recipient's email address.
  - **cartId** (string) - Required - The unique identifier for the shopping cart.

### Request Example (Event Payload)
```json
{
  "name": "cart/checkout.completed",
  "data": {
    "email": "blake@example.com",
    "cartId": "s6CIMNqIaxt503I1gVEICfwp"
  },
  "ts": 1703275661157
}
```

### Function Definition
```typescript
export const sendEmail = inngest.createFunction(
  {
    id: 'send-checkout-email',
    // This is the idempotency key, evaluated using CEL
    idempotency: 'event.data.cartId',
    // For the example event payload, this expression evaluates to: "s6CIMNqIaxt503I1gVEICfwp"
  },
  { trigger: 'cart/checkout.completed' },
  async ({ event, step }) => {
    // Function logic to send email
    console.log(`Sending email to ${event.data.email} for cart ${event.data.cartId}`);
    return { success: true };
  }
);
```

### Response
#### Success Response (200)
- **success** (boolean) - Indicates if the function execution was successful.

#### Response Example
```json
{
  "success": true
}
```
```

--------------------------------

TITLE: Throwing a NonRetriableError in TypeScript
DESCRIPTION: Demonstrates how to throw a predefined error type in TypeScript, which can be useful for signaling unrecoverable issues within an Inngest Function. This error can be searched for using CEL expressions.

SOURCE: https://www.inngest.com/docs/platform/monitor/inspecting-function-runs

LANGUAGE: typescript
CODE:
```
throw new NonRetriableError("Failed to import data");
```

--------------------------------

TITLE: Fetch Inngest Function Runs via REST API
DESCRIPTION: This JavaScript function `getRuns` uses the Inngest REST API to fetch all runs associated with a given event ID. It makes a GET request to the `/v1/events/{eventId}/runs` endpoint and authenticates using the Inngest signing key from environment variables. The function returns the data portion of the API response, which contains an array of run objects.

SOURCE: https://www.inngest.com/docs/examples/fetch-run-status-and-output

LANGUAGE: javascript
CODE:
```
async function getRuns(eventId) {
  const response = await fetch(`https://api.inngest.com/v1/events/${eventId}/runs`, {
    headers: {
      Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
    },
  });
  const json = await response.json();
  return json.data;
}

```

--------------------------------

TITLE: Durable AI Text Generation with Inngest fetch and AI SDK
DESCRIPTION: Illustrates using the Inngest `fetch` utility with the AI SDK to make AI model calls durable. The `createAnthropic` function accepts the `inngestFetch` implementation, ensuring that calls like `generateText` are offloaded to the Inngest Platform when executed within an Inngest function.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch

LANGUAGE: typescript
CODE:
```
import { fetch as inngestFetch } from 'inngest';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// The AI SDK's createAnthropic objects can be passed a custom fetch implementation
const anthropic = createAnthropic({
  fetch: inngestFetch,
});

// NOTE - Using this fetch outside of an Inngest function will fall back to the global fetch
const response = await generateText({
  model: anthropic('claude-3-5-sonnet-20240620'),
  prompt: 'Hello, world!',
});

// A call from inside an Inngest function will be made durable
inngest.createFunction(
  { id: "generate-summary" },
  { event: "post.created" },
  async ({ event }) => {
    // This will use step.fetch automatically!
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      prompt: `Summarize the following post: ${event.data.content}`,
    });
  },
);

```

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "generate-summary" },
  { event: "post.created" },
  async ({ step }) => {
    const anthropic = createAnthropic({
      fetch: step.fetch,
    });

    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      prompt: `Summarize the following post: ${event.data.content}`,
    });
  },
);

```

--------------------------------

TITLE: Unit Test Inngest Function with Mocked Server (Python)
DESCRIPTION: Demonstrates unit testing an Inngest function using the `mocked` library. This approach simulates the Inngest server environment, allowing you to test function logic without a live server. It requires the `inngest` and `inngest.experimental.mocked` libraries.

SOURCE: https://www.inngest.com/docs/reference/python/guides/testing

LANGUAGE: python
CODE:
```
import inngest

def create_message(name: object) -> str:
    return f"Hello, {name}!"

client = inngest.Inngest(app_id="my-app")

@client.create_function(
    fn_id="greet",
    trigger=inngest.TriggerEvent(event="user.login"),
)
async def greet(ctx: inngest.Context) -> str:
    message = await ctx.step.run(
        "create-message",
        create_message,
        ctx.event.data["name"],
    )

    return message

```

LANGUAGE: python
CODE:
```
import unittest
import inngest
from inngest.experimental import mocked
from .functions import greet

# Mocked Inngest client. The app_id can be any string (it's currently unused)
client_mock = mocked.Inngest(app_id="test")

# A normal Python test class
class TestGreet(unittest.TestCase):
    def test_greet(self) -> None:
        # Trigger the function with an in-memory, simulated Inngest server
        res = mocked.trigger(
            greet,
            inngest.Event(name="user.login", data={"name": "Alice"}),
            client_mock,
        )

        # Assert that it ran as expected
        assert res.status is mocked.Status.COMPLETED
        assert res.output == "Hello, Alice!"

```

--------------------------------

TITLE: Multiple Triggers for Inngest Functions (TypeScript)
DESCRIPTION: Configures an Inngest function to trigger on specific events ('user.created', 'user.updated') and a daily cron schedule ('0 5 * * *'). Useful for consolidating logic for various event sources or time-based execution.

SOURCE: https://www.inngest.com/docs/guides/multiple-triggers

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "resync-user-data" },
  [
    { event: "user.created" },
    { event: "user.updated" },
    { cron: "0 5 * * *" }, // Every morning at 5am
  ],
  async ({ event, step }) => {
    // ...
  },
);

```

--------------------------------

TITLE: step.sleepUntil()
DESCRIPTION: Pauses the execution of an Inngest function until a specified datetime. The function's state is memoized across versions using the provided ID.

SOURCE: https://www.inngest.com/docs/reference/functions/step-sleep-until

LANGUAGE: APIDOC
CODE:
```
## `step.sleepUntil(id, datetime)`

### Description

Pauses the execution of an Inngest function until a specified datetime. The function's state is memoized across versions using the provided ID.

### Method

`await` (Promise)

### Endpoint

N/A (SDK function)

### Parameters

#### Path Parameters

None

#### Query Parameters

None

#### Request Body

- **id** (string) - Required - The ID of the step. This will be what appears in your function's logs and is used to memoize step state across function versions.
- **datetime** (Date | string | Temporal.Instant | Temporal.ZonedDateTime) - Required - The datetime at which to continue execution of your function. This can be:
    * A `Date` object
    * Any date time `string` in the format accepted by the `Date` object, i.e. `YYYY-MM-DDTHH:mm:ss.sssZ` or simplified forms like `YYYY-MM-DD` or `YYYY-MM-DDHH:mm:ss`
    * 3.33.0+ `Temporal.Instant`
    * 3.33.0+ `Temporal.ZonedDateTime`

### Request Example

```typescript
// Sleep until the new year
await step.sleepUntil("happy-new-year", "2024-01-01");

// Sleep until September ends
await step.sleepUntil("wake-me-up", "2023-09-30T11:59:59");

// Sleep until the end of the this week
const date = dayjs().endOf("week").toDate();
await step.sleepUntil("wait-for-end-of-the-week", date);

// Sleep until tea time in London
const teaTime = Temporal.ZonedDateTime.from("2025-05-01T16:00:00+01:00[Europe/London]");
await step.sleepUntil("british-tea-time", teaTime);

// Sleep until the end of the day
const now = Temporal.Now.instant();
const endOfDay = now.round({ smallestUnit: "day", roundingMode: "ceil" });
await step.sleepUntil("done-for-today", endOfDay);
```

### Response

#### Success Response (200)

N/A (This is an SDK function, not an HTTP endpoint)

#### Response Example

N/A
```

--------------------------------

TITLE: Poll for Completed Inngest Function Run Output
DESCRIPTION: This `getRunOutput` function polls the Inngest API by repeatedly calling `getRuns` until the function run status is 'Completed'. It includes a delay between polls and throws an error if the run fails or is cancelled. Once completed, it returns the run details.

SOURCE: https://www.inngest.com/docs/examples/fetch-run-status-and-output

LANGUAGE: javascript
CODE:
```
async function getRunOutput(eventId) {
  let runs = await getRuns(eventId);
  while (runs[0].status !== "Completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runs = await getRuns(eventId);
    if (runs[0].status === "Failed" || runs[0].status === "Cancelled") {
      throw new Error(`Function run ${runs[0].status}`);
    }
  }
  return runs[0];
}

```

--------------------------------

TITLE: Middleware Initialization - TypeScript
DESCRIPTION: Shows the basic structure of creating an Inngest middleware with an `init` function. This function runs when the Inngest client is initialized and can be used to set up middleware-specific resources.

SOURCE: https://www.inngest.com/docs/features/middleware/create

LANGUAGE: typescript
CODE:
```
import { InngestMiddleware } from "inngest";

new InngestMiddleware({
  name: "Example Middleware",
  init() {
    // This runs when the client is initialized
    // Use this to set up anything your middleware needs
    return {};
  },
});

```

--------------------------------

TITLE: Debounce Configuration
DESCRIPTION: Configure debouncing for Inngest functions to limit the rate at which functions are invoked based on a unique key expression.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## POST /websites/inngest

### Description
Configure debouncing for Inngest functions to limit the rate at which functions are invoked based on a unique key expression.

### Method
POST

### Endpoint
/websites/inngest

### Parameters
#### Request Body
- **debounce** (object) - optional - A unique key expression to apply the debounce to. The expression is evaluated for each triggering event.
  - **key** (string) - required - A unique key expression to apply the debounce to. Examples: `'event.data.customer_id'`, `'event.data.account_id + "-" + event.user.email'`

```

--------------------------------

TITLE: Configure Function Retries
DESCRIPTION: Set the number of times an Inngest function should be retried upon failure. This configuration allows specifying between 0 and 20 retries.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "retries": 5
}
```

--------------------------------

TITLE: Cancel Function Execution with `cancelOn` (TypeScript)
DESCRIPTION: This snippet demonstrates how to use `cancelOn` in the Inngest SDK to stop a function's execution when a specific event is received. It includes an `event` to watch for and an `if` condition to ensure the correct `userId` matches between the triggering event and the cancellation event.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/cancel-on

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "sync-contacts",
    cancelOn: [
      {
        event: "app/user.deleted",
        // ensure the async (future) event's userId matches the trigger userId
        if: "async.data.userId == event.data.userId",
      },
    ],
  }
  // ...
);
```

--------------------------------

TITLE: Determining Triggered Event Types in Handler (TypeScript)
DESCRIPTION: Shows how to differentiate between various event types within an Inngest function handler using the `event.name` property. This allows for type-safe handling of different events or scheduled triggers that invoke the same function.

SOURCE: https://www.inngest.com/docs/guides/multiple-triggers

LANGUAGE: typescript
CODE:
```
async ({ event }) => {
  //      ^? type event: EventA | EventB | InngestScheduledEvent | InngestFnInvoked
  if (event.name === "a") {
    // `event` is type narrowed to only the `a` event
  } else if (event.name === "b") {
    // `event` is type narrowed to only the `b` event
  } else {
    // `event` is type narrowed to only the `inngest/function.invoked` event
  }
}

```

--------------------------------

TITLE: Serve Inngest Functions with Custom Name Option (v1 & v2)
DESCRIPTION: Shows how to specify a custom name for serving Inngest functions using the `name` option. This overrides the default behavior of using the client's name.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
serve(inngest, [...fns], {
  name: "My Custom App Name",
});

```

--------------------------------

TITLE: Inngest v1 Async Step Function Example
DESCRIPTION: An example of an asynchronous Inngest step function in v1. It utilizes `inngest.createFunction` and the `step` object. Crucially, all step executions must now be `await`ed to ensure proper sequencing and behavior.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: javascript
CODE:
```
// ✅ v1 step function
import { inngest } from "./client";
import { getUser } from "./db";
import { sendAlert, sendEmail } from "./email";

export default inngest.createFunction(
  { name: "Example" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    // The step must now be awaited!
    const user = await step.run("Get user email", () => getUser(event.userId));

    await step.run("Send email", () => sendEmail(user.email, "Welcome!"));
    await step.run("Send alert to staff", () => sendAlert("New user created!"));
  }
);
```

--------------------------------

TITLE: Create Background Job Function with Inngest (TypeScript)
DESCRIPTION: Defines a background job function using Inngest that runs in response to a specific event ('app/user.created'). It uses `step.run` for reliable execution of tasks like sending emails and `step.sleepUntil` to pause execution until a future date. Each step is automatically retried on failure.

SOURCE: https://www.inngest.com/docs/guides/background-jobs

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";
const inngest = new Inngest({ id: "signup-flow" });

export const sendSignUpEmail = inngest.createFunction(
  { id: "send-signup-email" },
  { event: "app/user.created" },
  ({ event, step }) => {
    await step.run("send-the-user-a-signup-email", async () => {
      await sesclient.clientsendEmail({
        to: event.data.user_email,
        subject: "Welcome to Inngest!"
        message: "...",
      });
    });
    await step.sleepUntil("wait-for-the-future", "2023-02-01T16:30:00");

    await step.run("do-some-work-in-the-future", async () => {
      // Code here runs in the future automatically.
    });
  }
);

```

--------------------------------

TITLE: Serve Inngest Functions in Next.js
DESCRIPTION: This Node.js code snippet demonstrates how to initialize an Inngest client with a specific app ID and then use the `serve` handler to make your functions available via an API endpoint. This creates a new Inngest app named 'example-app'.

SOURCE: https://www.inngest.com/docs/apps

LANGUAGE: javascript
CODE:
```
import { Inngest } from "inngest";
import { serve } from "inngest/next"; // or your preferred framework
import { sendSignupEmail } from "./functions";

const inngest = new Inngest({ id: "example-app" });

serve({
  client: inngest,
  functions: [sendSignupEmail],
});

```

--------------------------------

TITLE: TypeScript: Advanced Mutation with Middleware
DESCRIPTION: Demonstrates advanced mutation in Inngest middleware using TypeScript. It shows how to define middleware with specific types and data, and how these are inferred in the Inngest function. The example utilizes a const assertion for literal value inference.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection_guide=typescript

LANGUAGE: typescript
CODE:
```
// In middleware
dependencyInjectionMiddleware({
  foo: "bar",
} as const)

// In a function
async ({ event, foo }) => {
  //             ^? (parameter) foo: "bar"
}
```

--------------------------------

TITLE: Rate Limit Function Execution
DESCRIPTION: This example demonstrates how to set a rate limit on a function, ensuring it runs at most once every 4 hours for a specific company ID.

SOURCE: https://www.inngest.com/docs/reference/functions/rate-limit

LANGUAGE: APIDOC
CODE:
```
## POST /functions/rate-limit

### Description
Allows you to set a hard limit on how many times a function can start within a given time period. Events exceeding the rate limit are skipped.

### Method
POST

### Endpoint
/functions

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the function.
- **rateLimit** (object) - Optional - Options to configure rate limiting.
  - **key** (string) - Optional - A unique key expression to apply the limit to. Evaluated for each triggering event.
  - **limit** (number) - Required - The maximum number of functions to run in the given time period.
  - **period** (string) - Required - The time period for the limit (e.g., '1s', '24h').
- **event** (object) - Required - Defines the event that triggers the function.

### Request Example
```json
{
  "id": "synchronize-data",
  "rateLimit": {
    "key": "event.data.company_id",
    "limit": 1,
    "period": "4h"
  },
  "event": "intercom/company.updated"
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message indicating the function was created or updated.

#### Response Example
```json
{
  "message": "Function 'synchronize-data' created successfully."
}
```
```

--------------------------------

TITLE: Create Custom Inngest Middleware for Logging
DESCRIPTION: This middleware logs the output of a function if the incoming event name matches a specified string. It uses the `InngestMiddleware` class and provides a `transformOutput` hook to perform the logging.

SOURCE: https://www.inngest.com/docs/features/middleware/create

LANGUAGE: typescript
CODE:
```
import { InngestMiddleware } from "inngest";

export const createMyMiddleware = (logEventOutput: string) => {
return new InngestMiddleware({
    name: "My Middleware",
    init() {
    return {
        onFunctionRun({ ctx, fn, steps }) {
        if (ctx.event.name === logEventOutput) {
            return {
            transformOutput({ result, step }) {
                console.log(
                `${logEventOutput} output: ${JSON.stringify(result)}`
                );
            },
            };
        }

        return {};
        },
    };
    },
});
};

```

--------------------------------

TITLE: GET /api/inngest
DESCRIPTION: Returns function metadata and renders a debug page in development environments.

SOURCE: https://www.inngest.com/docs/reference/serve

LANGUAGE: APIDOC
CODE:
```
## GET /api/inngest

### Description
Returns function metadata and renders a debug page when in development mode.

### Method
GET

### Endpoint
/api/inngest

### Parameters
No parameters are expected for this endpoint.

### Response
#### Success Response (200)
- **metadata** (object) - Contains metadata about the registered functions.

#### Response Example
```json
{
  "metadata": {
    "function_id_1": {
      "name": "Function Name 1",
      "trigger": {
        "type": "event",
        "event": "user.signup"
      }
    },
    "function_id_2": {
      "name": "Function Name 2",
      "trigger": {
        "type": "schedule",
        "cron": "* * * * *"
      }
    }
  }
}
```
```

--------------------------------

TITLE: Create and Register Middleware - TypeScript
DESCRIPTION: Demonstrates how to create a new Inngest middleware with a name and an initialization function, and then register it with the Inngest client. The `init` function is called when the client is initialized.

SOURCE: https://www.inngest.com/docs/features/middleware/create

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";
import { InngestMiddleware } from "inngest";

// Create a new middleware
const myMiddleware = new InngestMiddleware({
  name: "My Middleware",
  init: () => {
      return {};
  },
});

// Register it on the client
const inngest = new Inngest({
  id: "my-app",
  middleware: [myMiddleware],
});

```

--------------------------------

TITLE: Handle step.invoke() with await and then - TypeScript
DESCRIPTION: Demonstrates two common ways to handle the Promise returned by `step.invoke()`: using the `await` keyword and using the `.then()` method for chaining operations.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: typescript
CODE:
```
// Using the "await" keyword
const result = await step.invoke("invoke-function", {
  function: someInngestFn,
  data: { ... },
});

// Using `then` for chaining
step
  .invoke("invoke-function", { function: someInngestFn, data: { ... } })
  .then((result) => {
    // further processing
  });

// Running multiple invocations in parallel
Promise.all([
  step.invoke("invoke-first-function", {
    function: firstFunctionReference,
    data: { ... },
  }),
  step.invoke("invoke-second-function", {
    function: secondFn,
    data: { ... },
  }),
]);
```

--------------------------------

TITLE: Wildcard Event Trigger for Inngest Functions (TypeScript)
DESCRIPTION: Defines an Inngest function triggered by any event matching the 'app/blog.post.*' pattern. This is useful for handling related events, such as all blog post-related activities, and requires explicit type definitions for the wildcard events.

SOURCE: https://www.inngest.com/docs/guides/multiple-triggers

LANGUAGE: typescript
CODE:
```
type WildcardEvents = {
  "app/blog.post.*": {
    name: "app/blog.post.created" | "app/blog.post.published";
    data: {
      postId: string;
      authorId: string;
      createdAt: string;
    } | {
      postId: string;
      authorId: string;
      publishedAt: string;
    }
  }
}
const inngest = new Inngest({
  id: "my-app",
  schemas: new EventSchemas().fromRecord<WildcardEvents>()
});

inngest.createFunction(
  { id: "blog-updates-to-slack" },
  { event: "app/blog.post.*" },
  async ({ event, step }) => {
    // ...
  },
);

```

--------------------------------

TITLE: Configure Function-Level Idempotency Key (TypeScript)
DESCRIPTION: This TypeScript snippet shows how to configure idempotency at the function level using the `idempotency` option. A CEL expression is used to generate a unique key based on the event payload, preventing duplicate executions of the function within a 24-hour period.

SOURCE: https://www.inngest.com/docs/guides/handling-idempotency

LANGUAGE: typescript
CODE:
```
export const sendEmail = inngest.createFunction(
  {
    id: 'send-checkout-email',
    idempotency: 'event.data.cartId',
  },
  { trigger: 'cart/checkout.completed' },
  async ({ event, step }) => { /* ... */ }
)
```

--------------------------------

TITLE: Configure Event Batching - Max Size and Timeout
DESCRIPTION: Set up event batching for an Inngest function, specifying the maximum number of events per batch and the timeout duration before invoking the function.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "batchEvents": {
    "maxSize": 100,
    "timeout": "30s"
  }
}
```

--------------------------------

TITLE: Searching for a Custom Error by Event Data and Name using CEL
DESCRIPTION: Demonstrates a CEL expression to search for Inngest Function runs that encountered a specific custom error (UserNotFoundError) and filtered by event data (userId). This enables precise error diagnosis.

SOURCE: https://www.inngest.com/docs/platform/monitor/inspecting-function-runs

LANGUAGE: cel
CODE:
```
event.data.userId == "12345" && output.name == "UserNotFoundError"
```

--------------------------------

TITLE: Configure Custom Fetch Fallback with Inngest
DESCRIPTION: Sets a custom fallback function for the Inngest fetch when called outside an Inngest function. Requires the 'inngest' package.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch

LANGUAGE: typescript
CODE:
```
import { fetch } from "inngest";

const api = new MyProductApi({
  fetch: fetch.config({ fallback: myCustomFetch }),
});
```

--------------------------------

TITLE: Using fetch() Utility with Custom Fetch in TypeScript
DESCRIPTION: Shows how to integrate the Inngest `fetch` utility with libraries like Axios by passing it as a custom fetch implementation. This makes requests made through the library durable when called within an Inngest function. Calls outside an Inngest function will default to the global fetch.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch

LANGUAGE: typescript
CODE:
```
import { fetch } from "inngest";

const api = new MyProductApi({ fetch });

// A call outside an Inngest function will fall back to the global fetch
await api.getProduct(1);

// A call from inside an Inngest function will be made durable and offloaded to the Inngest Platform
inngest.createFunction(
  { id: "my-fn" },
  { event: "product/activated" },
  async () => {
    await api.getProduct(1);
  },
);

```

--------------------------------

TITLE: Implementing `onFunctionRun` Middleware in JavaScript
DESCRIPTION: This code demonstrates how to create a custom Inngest middleware using the `onFunctionRun` lifecycle. It shows how to access context, steps, and functions, and how to define transformations for input and output.

SOURCE: https://www.inngest.com/docs/reference/middleware/lifecycle

LANGUAGE: javascript
CODE:
```
const myMiddleware = new InngestMiddleware({
  name: "My Middleware",
  init({ client, fn }) {
    return {
      onFunctionRun({ ctx, fn, steps }) {
        return {
          transformInput({ ctx, fn, steps }) {
            // ...
            return {
              // All returns are optional
              ctx: { /* extend fn input */ },
              steps: steps.map(({ data }) => { /* transform step data */ })
            }
          },
          beforeMemoization() {
            // ...
          },
          afterMemoization() {
            // ...
          },
          beforeExecution() {
            // ...
          },
          afterExecution() {
            // ...
          },
          transformOutput({ result, step }) {
            // ...
            return {
              // All returns are optional
              result: {
                // Transform data before it goes back to Inngest
              }
            }
          }
        }
      }
    }
  }
});

// Example of using the middleware with an Inngest client:
// const inngest = new Inngest({ id: "my-app", plugins: [myMiddleware] });
```

--------------------------------

TITLE: Custom Inngest Serve Handler
DESCRIPTION: Demonstrates how to create a custom Inngest 'serve' handler for frameworks not explicitly supported. It outlines the structure for handling requests, responses, headers, and URLs, and includes an example function.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { Inngest, InngestCommHandler, type ServeHandlerOptions } from "inngest";

const serve = (options: ServeHandlerOptions) => {
  const handler = new InngestCommHandler ({
    frameworkName: "edge",
    fetch: fetch.bind(globalThis),
    ...options,
    handler: (req: Request) => {
      return {
        body: () => req.json(),
        headers: (key) => req.headers.get(key),
        method: () => req.method,
        url: () => new URL(req.url, `https://${req.headers.get("host") || ""}`),
        transformResponse: ({ body, status, headers }) => {
          return new Response(body, { status, headers });
        },
      };
    },
  });

  return handler.createHandler();
};

const inngest = new Inngest ({ id: "example-edge-app" });

const fn = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  () => "Hello, World!"
);

export default serve ({ client: inngest, functions: [fn] });

```

--------------------------------

TITLE: Send Single and Multiple Events with step.sendEvent (TypeScript)
DESCRIPTION: Demonstrates the usage of `step.sendEvent` to send either a single event payload or an array of event payloads. The `id` parameter serves as a step identifier for logging and memoization. Ensure `step.sendEvent` is called with `await` for proper function sleeping.

SOURCE: https://www.inngest.com/docs/reference/functions/step-send-event

LANGUAGE: typescript
CODE:
```
// Send a single event
await step.sendEvent("send-activation-event", {
  name: "app/user.activated",
  data: { userId: "01H08SEAXBJFJNGTTZ5TAWB0BD" },
});

// Send an array of events
await step.sendEvent("send-invoice-events", [
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e024befa68763f5b500" },
  },
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e08f29fb563c972b1f7" },
  },
]);

```

--------------------------------

TITLE: Example Payload for inngest/function.cancelled Event
DESCRIPTION: This is an example of the JSON payload received when a function is cancelled in Inngest. It includes details about the cancellation error, the original event, and the specific function and run identifiers.

SOURCE: https://www.inngest.com/docs/reference/system-events/inngest-function-cancelled

LANGUAGE: json
CODE:
```
{
  "name": "inngest/function.cancelled",
  "data": {
    "error": {
      "error": "function cancelled",
      "message": "function cancelled",
      "name": "Error"
    },
    "event": {
      "data": {
        "content": "Yost LLC explicabo eos",
        "transcript": "s3://product-ideas/carber-vac-release.txt",
        "userId": "bdce1b1b-6e3a-43e6-84c2-2deb559cdde6"
      },
      "id": "01JDJK451Y9KFGE5TTM2FHDEDN",
      "name": "integrations/export.requested",
      "ts": 1732558407003,
      "user": {}
    },
    "events": [
      {
        "data": {
          "content": "Yost LLC explicabo eos",
          "transcript": "s3://product-ideas/carber-vac-release.txt",
          "userId": "bdce1b1b-6e3a-43e6-84c2-2deb559cdde6"
        },
        "id": "01JDJK451Y9KFGE5TTM2FHDEDN",
        "name": "integrations/export.requested",
        "ts": 1732558407003
      }
    ],
    "function_id": "demo-app-export",
    "run_id": "01JDJKGTGDVV4DTXHY6XYB7BKK"
  },
  "id": "01JDJKH1S5P2YER8PKXPZJ1YZJ",
  "ts": 1732570023717
}
```

--------------------------------

TITLE: Inngest Function Concurrency Configuration
DESCRIPTION: This snippet demonstrates how to configure concurrency limits for an Inngest function. You can set a simple numerical limit or provide a more detailed object with limit, scope, and key.

SOURCE: https://www.inngest.com/docs/functions/concurrency

LANGUAGE: APIDOC
CODE:
```
## Inngest Function Concurrency Configuration

### Description
Configure the maximum number of concurrently running steps for your Inngest function. This helps manage rate limits, database operations, and resource consumption.

### Method
N/A (Configuration option within function definition)

### Endpoint
N/A

### Parameters
#### Request Body (Function Configuration Object)
- **concurrency** (object | number) - Optional - Options to configure concurrency. Specifying a `number` is a shorthand to set the `limit` property.
  - **limit** (number) - Required - The maximum number of concurrently running steps. A value of `0` or `undefined` means no limit. The maximum value depends on your account plan.
  - **scope** (string) - Optional - The scope for the concurrency limit. Can be `'account'`, `'env'`, or `'fn'` (default). `'fn'` limits concurrency to runs of this specific function. `'env'` limits across all functions in an environment with the same key. `'account'` limits across all environments with the same key.
  - **key** (string) - Optional - An expression that evaluates to a string, used as the concurrency queue name. Required when `scope` is `'env'` or `'account'`. Expressions use Common Expression Language (CEL), with the event data accessible via dot notation (e.g., `'event.data.customer_id'`).

### Request Example
```typescript
export default inngest.createFunction(
  {
    id: "sync-contacts",
    concurrency: {
      limit: 10,
      scope: "env",
      key: "event.data.user_id + \"-\" + event.data.import_id"
    },
  }
  // ...
);
```

### Response
N/A (This is a configuration setting, not an API request/response)

### Error Handling
N/A
```

--------------------------------

TITLE: Inngest Function for Blog Post Workflow (TypeScript)
DESCRIPTION: Creates an Inngest function that triggers the blog post workflow. It listens for 'blog-post.updated' and 'blog-post.published' events and initiates the workflow engine to process these events. It depends on the '@inngest/workflow-kit' package.

SOURCE: https://www.inngest.com/docs/guides/user-defined-workflows

LANGUAGE: typescript
CODE:
```
import { Engine } from "@inngest/workflow-kit";

import { loadWorkflow } from "../loaders/workflow";
import { inngest } from "./client";
import { actionsWithHandlers } from "./workflowActionHandlers";

const workflowEngine = new Engine({
  actions: actionsWithHandlers,
  loader: loadWorkflow,
});

export default inngest.createFunction(
  { id: "blog-post-workflow" },
  // Triggers
  // - When a blog post is set to "review"
  // - When a blog post is published
  [{ event: "blog-post.updated" }, { event: "blog-post.published" }],
  async ({ event, step }) => {
    // When `run` is called, the loader function is called with access to the event
    await workflowEngine.run({ event, step });
  }
);

```

--------------------------------

TITLE: H3 Server Integration
DESCRIPTION: Hosts an Inngest function using a simple H3 server. Requires `createApp`, `eventHandler`, `toNodeListener` from `h3`, and the `serve` handler from `inngest/h3`.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: javascript
CODE:
```
import { createApp, eventHandler, toNodeListener } from "h3";
import { serve } from "inngest/h3";
import { createServer } from "node:http";
import { inngest } from "./inngest/client";
import fnA from "./inngest/fnA";

const app = createApp();
app.use(
  "/api/inngest",
  eventHandler(
    serve({
      client: inngest,
      functions: [fnA],
    })
  )
);

createServer(toNodeListener(app)).listen(process.env.PORT || 3000);

```

--------------------------------

TITLE: Using step.fetch() for API Requests
DESCRIPTION: Demonstrates how to use `step.fetch()` to make HTTP requests from within an Inngest function. This offloads the request to the Inngest Platform, ensuring durability.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch

LANGUAGE: APIDOC
CODE:
```
## POST /functions/inngest/functions.ts

### Description
Makes an HTTP GET request to a specified URL and processes the response within an Inngest function.

### Method
POST

### Endpoint
`/functions/inngest/functions.ts`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
```typescript
import { inngest } from "./client";

export const retrieveTextFile = inngest.createFunction(
  { id: "retrieveTextFile" },
  { event: "textFile/retrieve" },
  async ({ step }) => {
    // The fetching of the text file is offloaded to the Inngest Platform
    const response = await step.fetch(
      "https://example-files.online-convert.com/document/txt/example.txt"
    );

    // The Inngest function run is resumed when the HTTP request is complete
    await step.run("extract-text", async () => {
      const text = await response.text();
      const exampleOccurences = text.match(/example/g);
      return exampleOccurences?.length;
    });
  }
);
```

### Response
#### Success Response (200)
Returns the count of "example" occurrences in the fetched text file.

#### Response Example
```json
{
  "exampleOccurrences": 5 
}
```
```

--------------------------------

TITLE: Send Slack Notification on Function Failure
DESCRIPTION: An example of a failure handler that sends a notification to Slack when an Inngest function fails.

SOURCE: https://www.inngest.com/docs/reference/functions/handling-failures

LANGUAGE: APIDOC
CODE:
```
## POST /inngest/functions

### Description
This example demonstrates using the `onFailure` handler to send a Slack notification when the `sync-shopify-products` function fails.
It extracts relevant data from the failed event and uses the Slack Web API to post a message.

### Method
POST

### Endpoint
/inngest/functions

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **id** (string) - Required - The unique identifier for the function (`sync-shopify-products`).
- **onFailure** (function) - Required - The failure handler function.
  - **error** (Error) - The error object from the failed function.
  - **event** (object) - The system event payload (`"inngest/function.failed"`). Contains `data.event` with the original event.
  - **step** (object) - Inngest step utilities.
- **event** (object) - Required - The event trigger for the function (`shop/product_sync.requested`).

### Request Example
```json
{
  "id": "sync-shopify-products",
  "onFailure": "async ({ error, event }) => { /* Slack notification logic */ }",
  "event": {
    "event": "shop/product_sync.requested",
    "data": {
      "storeId": "12345"
    }
  }
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message.

#### Response Example
```json
{
  "message": "Function created successfully"
}
```
```

--------------------------------

TITLE: POST /cancellations
DESCRIPTION: Allows for bulk cancellation of Inngest function runs based on specified criteria. You can cancel functions within a given time range and optionally filter them using an expression.

SOURCE: https://www.inngest.com/docs/guides/cancel-running-functions

LANGUAGE: APIDOC
CODE:
```
## POST /cancellations

### Description
Cancels Inngest functions in bulk based on application ID, function ID, and a time range. An optional expression can be provided to further filter which functions to cancel.

### Method
POST

### Endpoint
https://api.inngest.com/v1/cancellations

### Parameters
#### Request Body
- **app_id** (string) - Required - The ID of the application.
- **function_id** (string) - Required - The ID of the function to cancel.
- **started_after** (string) - Required - Timestamp in ISO 8601 format. Cancels functions started after this time.
- **started_before** (string) - Required - Timestamp in ISO 8601 format. Cancels functions started before this time.
- **if** (string) - Optional - An expression to filter which functions to cancel. For example: `event.data.userId == 'user_o9235hf84hf'`

### Request Example
```json
{
  "app_id": "acme-app",
  "function_id": "schedule-reminder",
  "started_after": "2024-01-21T18:23:12.000Z",
  "started_before": "2024-01-22T14:22:42.130Z",
  "if": "event.data.userId == 'user_o9235hf84hf'"
}
```

### Response
#### Success Response (200)
- **id** (string) - The unique ID for the cancellation job.
- **environment_id** (string) - The ID of the environment where the cancellation job was initiated.
- **function_id** (string) - The ID of the function that was targeted for cancellation.
- **started_after** (string) - The start timestamp used for the cancellation filter.
- **started_before** (string) - The end timestamp used for the cancellation filter.
- **if** (string) - The conditional expression used for filtering cancellations.

#### Response Example
```json
{
  "id": "01HMRMPE5ZQ4AMNJ3S2N79QGRZ",
  "environment_id": "e03843e1-d2df-419e-9b7b-678b03f7398f",
  "function_id": "schedule-reminder",
  "started_after": "2024-01-21T18:23:12.000Z",
  "started_before": "2024-01-22T14:22:42.130Z",
  "if": "event.data.userId == 'user_o9235hf84hf'"
}
```
```

--------------------------------

TITLE: Example Events for cancelOn
DESCRIPTION: Illustrates example events that would trigger and cancel a function configured with `cancelOn`.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/cancel-on

LANGUAGE: APIDOC
CODE:
```
## Example Events

### Triggering Event (`app/user.created`)
This event initiates the function execution.

```json
{
  "name": "app/user.created",
  "data": {
    "userId": "123",
    "name": "John Doe"
  }
}
```

### Cancelling Event (`app/user.deleted`)
This event, matching the `userId` from the triggering event, will cancel the function.

```json
{
  "name": "app/user.deleted",
  "data": {
    "userId": "123"
  }
}
```
```

--------------------------------

TITLE: Inngest.Any / InngestFunction.Any: Typing collections of Inngest primitives
DESCRIPTION: The `Any` type within Inngest namespaces provides a way to represent any instance of a class without type inference. This is useful for typing arrays of functions or primitives created by factories.

SOURCE: https://www.inngest.com/docs/typescript

LANGUAGE: typescript
CODE:
```
import { type InngestFunction } from "inngest";

const functionsToServe: InngestFunction.Any[] = [];

```

--------------------------------

TITLE: inngest/function.cancelled Event
DESCRIPTION: The `inngest/function.cancelled` event is sent when a function is cancelled for any reason, including manual cancellation, timeouts, or bulk cancellation. This event is useful for implementing cleanup logic or tracking function cancellations.

SOURCE: https://www.inngest.com/docs/reference/system-events/inngest-function-cancelled

LANGUAGE: APIDOC
CODE:
```
## Event: inngest/function.cancelled

### Description
This event is triggered whenever a function is cancelled in your Inngest environment. It can be used for cleanup tasks or to log cancellations in external systems.

### Event Name
`inngest/function.cancelled`

### Payload

- **name** (string) - The name of the event, which is always `"inngest/function.cancelled"`.
- **data** (object) - The event payload data.
  - **error** (object) - Data about the cancellation error.
    - **message** (string) - The cancellation error message, which is typically `"function cancelled"`.
    - **name** (string) - The name of the error, defaulting to `"Error"`.
  - **event** (object) - The original event payload that was passed to the cancelled function.
    - **data** (object) - The data associated with the original event.
    - **id** (string) - The ID of the original event.
    - **name** (string) - The name of the original event.
    - **ts** (number) - The timestamp of the original event.
    - **user** (object) - User information related to the original event.
  - **events** (array) - An array of events, likely including the original event.
    - **data** (object) - The data associated with the event.
    - **id** (string) - The ID of the event.
    - **name** (string) - The name of the event.
    - **ts** (number) - The timestamp of the event.
  - **function_id** (string) - The ID of the cancelled function.
  - **run_id** (string) - The ID of the specific run of the cancelled function.
- **id** (string) - The unique ID of this `inngest/function.cancelled` event.
- **ts** (number) - The timestamp in milliseconds when the cancellation occurred.

### Example Payload
```json
{
  "name": "inngest/function.cancelled",
  "data": {
    "error": {
      "error": "function cancelled",
      "message": "function cancelled",
      "name": "Error"
    },
    "event": {
      "data": {
        "content": "Yost LLC explicabo eos",
        "transcript": "s3://product-ideas/carber-vac-release.txt",
        "userId": "bdce1b1b-6e3a-43e6-84c2-2deb559cdde6"
      },
      "id": "01JDJK451Y9KFGE5TTM2FHDEDN",
      "name": "integrations/export.requested",
      "ts": 1732558407003,
      "user": {}
    },
    "events": [
      {
        "data": {
          "content": "Yost LLC explicabo eos",
          "transcript": "s3://product-ideas/carber-vac-release.txt",
          "userId": "bdce1b1b-6e3a-43e6-84c2-2deb559cdde6"
        },
        "id": "01JDJK451Y9KFGE5TTM2FHDEDN",
        "name": "integrations/export.requested",
        "ts": 1732558407003
      }
    ],
    "function_id": "demo-app-export",
    "run_id": "01JDJKGTGDVV4DTXHY6XYB7BKK"
  },
  "id": "01JDJKH1S5P2YER8PKXPZJ1YZJ",
  "ts": 1732570023717
}
```
```

--------------------------------

TITLE: Limit Inngest Function Concurrency by Customer ID (TypeScript)
DESCRIPTION: This TypeScript example demonstrates how to configure an Inngest function to limit concurrency based on a customer ID. It uses `concurrency: { limit: 1, key: 'event.data.customerId' }` to ensure only one import job runs per customer at a time. The function processes a CSV file uploaded by a customer.

SOURCE: https://www.inngest.com/docs/guides/concurrency

LANGUAGE: TypeScript
CODE:
```
export const send = inngest.createFunction(
  {
    name: "Process customer csv import",
    id: "process-customer-csv-import",
    concurrency: {
      limit: 1,
      key: `event.data.customerId`, // You can use any piece of data from the event payload
    },
  },
  { event: "csv/file.uploaded" },
  async ({ event, step }) => {
    await step.run("process-file", async () => {
      const file = await bucket.fetch(event.data.fileURI);
      // ...
    });

    return { message: "success" };
  }
);

```

--------------------------------

TITLE: Mocking Inngest Sleep/waitForEvent Steps
DESCRIPTION: Provides examples for mocking steps like `step.sleep` and `step.waitForEvent`. These are crucial for testing functions that pause execution. The example shows mocking a `step.sleep` to act as a no-operation.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
// Given the following function that sleeps
const myFunction = inngest.createFunction(
  { id: "my-function" },
  { event: "user.created" },
  async ({ event, step }) => {
    await step.sleep("one-day-delay", "1d");
    return { message: "success" };
  }
)
// Mock the step to execute a no-op handler to return immediately
t.execute({
  steps: [
    {
      id: "one-day-delay",
      handler() {}, // no return value necessary
    },
  ],
});
```

--------------------------------

TITLE: Configure batching for events in TypeScript
DESCRIPTION: Configures an Inngest function to batch events based on a maximum size, timeout, and an optional key or conditional expression. The function processes a batch of 'log/api.call' events, mapping them to database attributes and performing a bulk write operation.

SOURCE: https://www.inngest.com/docs/guides/batching

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "record-api-calls",
    batchEvents: {
      maxSize: 100,
      timeout: "5s",
      key: "event.data.user_id", // Optional: batch events by user ID
      if: "event.data.account_type == \"free\"", // Optional: Only batch events from free accounts 
    },
  },
  { event: "log/api.call" },
  async ({ events, step }) => {
    // NOTE: Use the `events` argument, which is an array of event payloads
    const attrs = events.map((evt) => {
      return {
        user_id: evt.data.user_id,
        endpoint: evt.data.endpoint,
        timestamp: toDateTime(evt.ts),
        account_type: evt.data.account_type,
      };
    });

    const result = await step.run("record-data-to-db", async () => {
      return db.bulkWrite(attrs);
    });

    return { success: true, recorded: result.length };
  }
);

```

--------------------------------

TITLE: Remix Edge Functions: Enable Streaming Responses
DESCRIPTION: Configures a Remix Edge Function to allow streaming responses back to Inngest, providing a 15-minute request timeout. Requires setting the runtime to 'edge' and adding the 'streaming: "allow"' option to the serve handler.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
export const config {
  runtime: "edge",
};

const handler = serve ({
  client: inngest,
  functions: [...fns],
  streaming: "allow",
});

```

--------------------------------

TITLE: Access Environment Variables in Inngest Function
DESCRIPTION: Example of an Inngest function that accesses environment variables passed through the `env` object from the middleware. The `env` object is typed, allowing for direct access to environment variables like `env.MY_VAR`.

SOURCE: https://www.inngest.com/docs/examples/middleware/cloudflare-workers-environment-variables

LANGUAGE: typescript
CODE:
```
const myFn = inngest.createFunction(
  { id: 'my-fn' },
  { event: 'demo/event.sent' },
  // The "env" argument returned in transformInput is passed through:
  async ({ event, step, env }) => {

    // The env object will be typed as well:
    console.log(env.MY_VAR);
  }
);

```

--------------------------------

TITLE: Multiple Triggers
DESCRIPTION: Configure an Inngest function to trigger on multiple specific events or cron schedules. This allows a single function to handle various event types or run periodically.

SOURCE: https://www.inngest.com/docs/guides/multiple-triggers

LANGUAGE: APIDOC
CODE:
```
## POST /inngest/functions

### Description
Creates or updates an Inngest function with the specified configuration, including event triggers and cron schedules.

### Method
POST

### Endpoint
/inngest/functions

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the function.
- **triggers** (array) - Required - A list of trigger configurations. Each trigger can be an event or a cron schedule.
  - **event** (string) - The name of the event to trigger on.
  - **cron** (string) - A cron expression for scheduling the function.

### Request Example
```json
{
  "id": "resync-user-data",
  "triggers": [
    { "event": "user.created" },
    { "event": "user.updated" },
    { "cron": "0 5 * * *" } // Every morning at 5am
  ]
}
```

### Response
#### Success Response (200)
Indicates the function was successfully configured.

#### Response Example
```json
{
  "message": "Function configured successfully"
}
```
```

--------------------------------

TITLE: Receive Pydantic Event in Function - Python
DESCRIPTION: Shows how to define an Inngest function that receives a specific Pydantic event type. Uses the event's class name for the trigger and the `from_event` class method to parse the incoming Inngest event.

SOURCE: https://www.inngest.com/docs/reference/python/guides/pydantic

LANGUAGE: python
CODE:
```
@client.create_function(
    fn_id="handle-upvoted-post",
    trigger=inngest.TriggerEvent(event=PostUpvotedEvent.name),
)
def fn(ctx: inngest.ContextSync) -> None:
    event = PostUpvotedEvent.from_event(ctx.event)


```

--------------------------------

TITLE: Transition `createFunction` to `inngest.createFunction()`
DESCRIPTION: Illustrates the migration from the older `createFunction` helper to the current `inngest.createFunction()` signature. The new method requires an Inngest client instance and uses an object for configuration.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
// ❌ Removed in v1
const singleStepFn = createFunction(
  "Single step",
  "example/single.step",
  async ({ event }) => "..."
);

```

LANGUAGE: typescript
CODE:
```
// ✅ Valid in v1
const inngest = new Inngest({ name: "My App" });

const singleStepFn = inngest.createFunction(
  { name: "Single step" },
  { event: "example/single.step" },
  async ({ event, step }) => "..."
);

```

--------------------------------

TITLE: Create Reusable Actions Middleware for Inngest (TypeScript)
DESCRIPTION: This utility creates custom Inngest middleware to provide a set of predefined actions that can be invoked directly within Inngest functions, rather than using `step.run()`. This promotes code reusability for common tasks like fetching data.

SOURCE: https://www.inngest.com/docs/reference/middleware/examples

LANGUAGE: TypeScript
CODE:
```
/**
 * Pass to a client to provide a set of actions as steps to all functions, or to
 * a function to provide a set of actions as steps only to that function.
 */
const inngest = new Inngest({
  id: "my-app",
  middleware: [
    createActionsMiddleware({
      getUser(id: string) {
        return db.user.get(id);
      },
    }),
  ],
});

inngest.createFunction(
  { id: "user-data-dump" },
  { event: "app/data.requested" },
  async ({ event, action: { getUser } }) => {
    // The first parameter is the step's options or ID
    const user = await getUser("get-user-details", event.data.userId);
  }
);
```

LANGUAGE: TypeScript
CODE:
```
import { InngestMiddleware, StepOptionsOrId } from "inngest";

/**
 * Create a middleware that wraps a set of functions in step tooling, allowing
 * them to be invoked directly instead of using `step.run()`.
 *
 * This is useful for providing a set of common actions to a particular function
 * or to all functions created by a client.
 */
export const createActionsMiddleware = <T extends Actions>(rawActions: T) => {
  return new InngestMiddleware({
    name: "Inngest: Actions",
    init: () => {
      return {
        onFunctionRun: () => {
          return {
            transformInput: ({ ctx: { step } }) => {
              const action: FilterActions<T> = Object.entries(
                rawActions
              ).reduce((acc, [key, value]) => {
                if (typeof value !== "function") {
                  return acc;
                }

                const action = (
                  idOrOptions: StepOptionsOrId,
                  ...args: unknown[]
                ) => {
                  return step.run(idOrOptions, () => value(...args));
                };

                return {
                  ...acc,
                  [key]: action,
                };
              }, {} as FilterActions<T>);

              return {
                ctx: { action },
              };
            },
          };
        },
      };
    },
  });
};

type Actions = Record<string, unknown>;

/**
 * Filter out all keys from `T` where the associated value does not match type
 * `U`.
 */
type KeysNotOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? never : P;
}[keyof T];

/**
 * Given a set of generic objects, extract any top-level functions and
 * appropriately shim their types.
 *
 * We use this type to allow users to spread a set of functions into the
 * middleware without having to worry about non-function properties.
 */
type FilterActions<Fns extends Record<string, any>> = {
  [K in keyof Omit<Fns, KeysNotOfType<Fns, (...args: any[]) => any>>]: (
    idOrOptions: StepOptionsOrId,
    ...args: Parameters<Fns[K]>
  ) => Promise<Awaited<ReturnType<Fns[K]>>>;
};
```

--------------------------------

TITLE: Install @inngest/test
DESCRIPTION: Installs the @inngest/test package as a development dependency. This package is required for programmatic testing of Inngest functions and has a peer dependency on inngest@>=3.22.12.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: bash
CODE:
```
npm install -D @inngest/test
```

--------------------------------

TITLE: Summarize Content via GPT-4 with Inngest
DESCRIPTION: This Inngest function, written in TypeScript, outlines a RAG workflow to summarize content using GPT-4. It demonstrates querying a vector database, retrieving file transcripts, invoking a chat completion, saving the summary, and pushing notifications. The function utilizes Inngest steps for automatic retries.

SOURCE: https://www.inngest.com/docs/examples/ai-agents-and-rag

LANGUAGE: typescript
CODE:
```
export const summarizeContent = inngest.createFunction(
  { name: 'Summarize content via GPT-4', id: 'summarize-content' },
  { event: 'ai/summarize.content' },
  async ({ event, step, attempt }) => {
    const results = await step.run('query-vectordb', async () => {
      return {
        matches: [
          {
            id: 'vec3',
            score: 0,
            values: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
            text: casual.sentences(3),
          },
          {
            id: 'vec4',
            score: 0.0799999237,
            values: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
            text: casual.sentences(3),
          },
          {
            id: 'vec2',
            score: 0.0800000429,
            values: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
            text: casual.sentences(3),
          },
        ],
        namespace: 'ns1',
        usage: { readUnits: 6 },
      };
    });

    const transcript = await step.run('read-s3-file', async () => {
      return casual.sentences(10);
    });

    // We can globally share throttle limited functions like this using invoke
    const completion = await step.invoke('generate-summary-via-gpt-4', {
      function: chatCompletion,
      data: {
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that summaries content for product launches.',
          },
          {
            role: 'user',
            content: `Question: Summarize my content: 
${transcript}. 
Information: ${results.matches
              .map((m) => m.text)
              .join('. ')}`,
          },
        ],
      },
    });
    // You might use the response like this:
    const summary = completion.choices[0].message.content;

    await step.run('save-to-db', async () => {
      return casual.uuid;
    });

    await step.run('websocket-push-to-client', async () => {
      return casual.uuid;
    });
    return { success: true, summaryId: casual.uuid };
  }
);

```

--------------------------------

TITLE: Priority Configuration
DESCRIPTION: Configure the priority of Inngest function executions using a CEL expression.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## POST /websites/inngest

### Description
Configure the priority of Inngest function executions using a CEL expression.

### Method
POST

### Endpoint
/websites/inngest

### Parameters
#### Request Body
- **priority** (object) - optional - Options to configure how to prioritize functions.
  - **run** (string) - optional - An expression which must return an integer between -600 and 600. Examples: `event.data.priority`, `event.data.plan == 'enterprise' ? 180 : 0`

```

--------------------------------

TITLE: Set Concurrency Limit for a Function
DESCRIPTION: This snippet demonstrates how to set a concurrency limit for a specific Inngest function using the `concurrency` option with a `limit` value. This helps manage resource usage and adhere to external API rate limits.

SOURCE: https://www.inngest.com/docs/functions/concurrency

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  {
    id: "sync-contacts",
    concurrency: {
      limit: 10,
    },
  }
  // ...
);

```

--------------------------------

TITLE: Add Inngest Client and Function to FastAPI App (Python)
DESCRIPTION: Integrates Inngest into a FastAPI app by creating an Inngest client, defining a function triggered by an event, and serving the Inngest endpoint.

SOURCE: https://www.inngest.com/docs/getting-started/python-quick-start

LANGUAGE: python
CODE:
```
import logging
from fastapi import FastAPI
import inngest
import inngest.fast_api

# Create an Inngest client
inngest_client = inngest.Inngest(
    app_id="fast_api_example",
    logger=logging.getLogger("uvicorn"),
)

# Create an Inngest function
@inngest_client.create_function(
    fn_id="my_function",
    # Event that triggers this function
    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def my_function(ctx: inngest.Context) -> str:
    ctx.logger.info(ctx.event)
    return "done"

app = FastAPI()

# Serve the Inngest endpoint
inngest.fast_api.serve(app, inngest_client, [my_function])

```

--------------------------------

TITLE: Value Expressions for Dynamic Values (CEL)
DESCRIPTION: Examples of value expressions used to return dynamic values for function run priority or other configurations in Inngest. These expressions can include conditional logic.

SOURCE: https://www.inngest.com/docs/guides/writing-expressions

LANGUAGE: CEL
CODE:
```
// Return a 0 priority if the billing plan is enterprise, otherwise return 1800
`event.data.billingPlan == 'enterprise' ? 0 : 1800`

// Return a value based on multiple conditions
`event.data.billingPlan == 'enterprise' && event.data.requestNumber < 10 ? 0 : 1800`
```

--------------------------------

TITLE: Handling NonRetriableError from step.invoke()
DESCRIPTION: This example illustrates how to use a try-catch block to handle potential `NonRetriableError` exceptions that can occur when invoking functions, such as timeouts or rate limiting.

SOURCE: https://www.inngest.com/docs/reference/functions/step-invoke

LANGUAGE: javascript
CODE:
```
import { NonRetriableError } from "inngest";

try {
  await step.invoke("my/rate-limited-function");
} catch (e) {
  if (e instanceof NonRetriableError) {
    console.error("Function invocation failed with a non-retriable error:", e);
  } else {
    throw e;
  }
}
```

--------------------------------

TITLE: Inngest API Route Handler (Next.js)
DESCRIPTION: Sets up a Next.js API route handler for Inngest at `/api/inngest`. It uses the `serve` function from the Inngest SDK to handle incoming events and delegate them to registered functions.

SOURCE: https://www.inngest.com/docs/getting-started/nextjs-quick-start

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
  ],
});

```

--------------------------------

TITLE: Searching for a NonRetriableError using CEL
DESCRIPTION: Shows how to construct a CEL (Common Expression Language) query to search for specific errors based on their name and message within Inngest Function run outputs. This helps in filtering and identifying failed runs.

SOURCE: https://www.inngest.com/docs/platform/monitor/inspecting-function-runs

LANGUAGE: cel
CODE:
```
output.name == "NonRetriableError" && output.message == "Failed to import data"
```

--------------------------------

TITLE: Create Inngest Function with OpenAI Client (TypeScript)
DESCRIPTION: This snippet shows how to define an Inngest Function that leverages the OpenAI client available in its context. It creates a chat completion using the 'gpt-3.5-turbo' model and a predefined message.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection_guide=typescript

LANGUAGE: typescript
CODE:
```
inngest.createFunction({ name: "user-create" }, { event: "app/user.create" }, async ({ openai }) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Say this is a test" }],
    model: "gpt-3.5-turbo",
  });

  // ...
});
```

--------------------------------

TITLE: Define Multiple Channels and Topics (TypeScript)
DESCRIPTION: This snippet defines multiple Inngest Realtime channels and topics for streaming updates from different function runs. It includes a global channel for general logs and a post-specific channel with topics for 'updated' and 'deleted' events, using Zod for schema validation. Dependencies include '@inngest/realtime' and 'zod'.

SOURCE: https://www.inngest.com/docs/examples/realtime

LANGUAGE: typescript
CODE:
```
import {
  channel,
  topic,
} from "@inngest/realtime";
import { z } from "zod";

export const globalChannel = channel("global").addTopic(topic("logs").type<string>());

export const postChannel = channel((postId: string) => `post:${postId}`)
  .addTopic(
    topic("updated").schema(
      z.object({
        id: z.string(),
        likes: z.number(),
      })
    )
  )
  .addTopic(
    topic("deleted").schema(
      z.object({
        id: z.string(),
        reason: z.string(),
      })
    )
  );


```

--------------------------------

TITLE: Capture function failures with Sentry in Node.js
DESCRIPTION: This example demonstrates how to capture all failed Inngest function errors using Sentry's Node.js library. It initializes Sentry, reconstructs the error object from the event data, and captures the exception with additional metadata.

SOURCE: https://www.inngest.com/docs/reference/functions/handling-failures

LANGUAGE: javascript
CODE:
```
import * as Sentry from "@sentry/node";
import { inngest } from "./client";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
});

export default inngest.createFunction(
  {
    name: "Send failures to Sentry",
    id: "send-failed-function-errors-to-sentry"
  },
  { event: "inngest/function.failed" },
  async ({ event, step }) => {

    // The error is serialized as JSON, so we must re-construct it for Sentry's error handling:
    const error = event.data.error;
    const reconstructedEvent = new Error(error.message);
    // Set the name in the newly created event:
    // You can even customize the name here if you'd like,
    // e.g. `Function Failure: ${event.} - ${error.name}`
    reconstructedEvent.name = error.name;

    // Add the stack trace to the error:
    reconstructedEvent.stack = error.stack;

    // Capture the error with Sentry and append any additional tags or metadata:
    Sentry.captureException(reconstructedEvent,{
      extra: {
        function_id,
      },
    });

    // Flush the Sentry queue to ensure the error is sent:
    return await Sentry.flush();
  }
);

```

--------------------------------

TITLE: Batch Events by Customer ID using CEL
DESCRIPTION: Configure event batching for an Inngest function, using a CEL expression to group events by `customer_id`.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "batchEvents": {
    "key": "'event.data.customer_id'"
  }
}
```

--------------------------------

TITLE: Inngest v0 Step Function Example
DESCRIPTION: An example of a synchronous Inngest step function in v0. It uses the `createStepFunction` API and the `tools` object for running tasks sequentially. Note the lack of `async`/`await` for step execution.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: javascript
CODE:
```
// ⚠️ v0 step function
import { createStepFunction } from "inngest";
import { getUser } from "./db";
import { sendAlert, sendEmail } from "./email";

export default createStepFunction(
  "Example",
  "app/user.created",
  ({ event, tools }) => {
    const user = tools.run("Get user email", () => getUser(event.userId));

    tools.run("Send email", () => sendEmail(user.email, "Welcome!"));
    tools.run("Send alert to staff", () => sendAlert("New user created!"));
  }
);
```

--------------------------------

TITLE: Sleep for a Duration using Python SDK
DESCRIPTION: Demonstrates how to pause function execution using the Inngest Python SDK. The sleep function accepts a step ID and a duration, which can be a timedelta object or milliseconds.

SOURCE: https://www.inngest.com/docs/reference/python/steps/sleep

LANGUAGE: python
CODE:
```
import inngest
import datetime

@inngest_client.create_function(
    fn_id="my_function",
    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def fn(ctx: inngest.Context) -> None:
    await ctx.step.sleep("zzz", datetime.timedelta(seconds=2))

```

--------------------------------

TITLE: Define Failure Handler with Inngest TypeScript SDK
DESCRIPTION: Defines a failure handler for an Inngest function using the `onFailure` option. This handler is called when the main function fails after its maximum number of retries. It receives the error, event, step, and runId as arguments, allowing for actions like sending alerts or notifications.

SOURCE: https://www.inngest.com/docs/reference/functions/handling-failures

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export default inngest.createFunction(
  {
    id: "import-product-images",
    onFailure: async ({ error, event, step }) => {
      // This is the failure handler which can be used to
      // send an alert, notification, or whatever you need to do
    },
  },
  { event: "shop/product.imported" },
  async ({ event, step, runId }) => {
    // This is the main function handler's code
  }
);

```

--------------------------------

TITLE: Cancellation Configuration
DESCRIPTION: Define events that can cancel a running or sleeping Inngest function, including matching criteria and timeouts.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## POST /websites/inngest

### Description
Define events that can cancel a running or sleeping Inngest function, including matching criteria and timeouts.

### Method
POST

### Endpoint
/websites/inngest

### Parameters
#### Request Body
- **cancelOn** (array of objects) - optional - Define events that can be used to cancel a running or sleeping function.
  - **event** (string) - required - The event name which will be used to cancel.
  - **match** (string) - optional - The property to match the event trigger and the cancelling event. Examples: `data.userId`.
  - **if** (string) - optional - An expression on which to conditionally match the original event trigger (`event`) and the wait event (`async`). Cannot be combined with `match`. Examples: `event.data.userId == async.data.userId && async.data.billing_plan == 'pro'`.
  - **timeout** (string) - optional - The amount of time to wait to receive the cancelling event. Examples: `"30m"`, `"3 hours"`, or `"2.5d"`.

```

--------------------------------

TITLE: Add Event Wait Step (TypeScript)
DESCRIPTION: Illustrates adding a second step to an Inngest multi-step function using `step.waitForEvent()`. This step waits for a specific event (`app/post.created`) to occur within a defined timeout (24 hours) to check if a user created a post.

SOURCE: https://www.inngest.com/docs/guides/multi-step-functions

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "activation-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.run("send-welcome-email", async () => {
      return await sendEmail({ email: event.user.email, template: "welcome" });
    });

    // Wait for an "app/post.created" event
    const postCreated = await step.waitForEvent("wait-for-post-creation", {
      event: "app/post.created",
      match: "data.user.id", // the field "data.user.id" must match
      timeout: "24h", // wait at most 24 hours
    });
  }
);

```

--------------------------------

TITLE: Using the fetch() utility with external libraries
DESCRIPTION: Shows how to pass the Inngest `fetch()` utility to packages like Axios or AI SDKs, making their requests durable when called within an Inngest function.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch

LANGUAGE: APIDOC
CODE:
```
## POST /functions/inngest/functions.ts

### Description
Initializes an AI SDK client with the Inngest `fetch` implementation and uses it to generate text, making the AI request durable.

### Method
POST

### Endpoint
`/functions/inngest/functions.ts`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
```typescript
import { fetch as inngestFetch } from 'inngest';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// The AI SDK's createAnthropic objects can be passed a custom fetch implementation
const anthropic = createAnthropic({
  fetch: inngestFetch,
});

// A call from inside an Inngest function will be made durable
inngest.createFunction(
  { id: "generate-summary" },
  { event: "post.created" },
  async ({ event }) => {
    // This will use step.fetch automatically!
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      prompt: `Summarize the following post: ${event.data.content}`,
    });
  },
);
```

### Response
#### Success Response (200)
Successfully generates text based on the provided prompt and model.

#### Response Example
```json
{
  "text": "This is a generated summary..."
}
```
```

--------------------------------

TITLE: Defining and Throwing a Custom Error in TypeScript
DESCRIPTION: Illustrates how to define a custom error class that extends Inngest's NonRetriableError in TypeScript. This allows for more specific error handling and searching by custom error names.

SOURCE: https://www.inngest.com/docs/platform/monitor/inspecting-function-runs

LANGUAGE: typescript
CODE:
```
import { NonRetriableError } from "inngest";

class UserNotFoundError extends NonRetriableError {
  constructor(message: string) {
    super(message);
    this.name = "UserNotFoundError";
  }
}
inngest.createFunction(
  { id: "my-fn" },
  { event: "user" },
  async ({ step, event }) => {
    await step.run("get-user", async () => {
      const user = await getUser(event.data.userId);
      if (!user) {
        throw new UserNotFoundError(`User not found (${event.data.userId})`);
      }
      // ...
    });
  }
);
```

--------------------------------

TITLE: Reminder Created Event Example (JSON)
DESCRIPTION: An example of a JSON payload for the 'tasks/reminder.created' event. This event triggers the reminder function and contains data such as `userId`, `reminderId`, and `reminderBody`, which are used to schedule and display the reminder.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-events

LANGUAGE: json
CODE:
```
{
  "name": "tasks/reminder.created",
  "data": {
    "userId": "user_123",
    "reminderId": "reminder_0987654321",
    "reminderBody": "Pick up Jane from the airport"
  }
}

```

--------------------------------

TITLE: Inngest: Call another function asynchronously with invoke
DESCRIPTION: Asynchronously calls another Inngest function, allowing for code reuse and workflow composition. It supports passing input data and retrieving results. Configuration options include concurrency limits. Dependencies include the Inngest SDK.

SOURCE: https://www.inngest.com/docs/learn/inngest-steps

LANGUAGE: javascript
CODE:
```
// A function we will call in another place in our app
const computeSquare = inngest.createFunction(
  { id: "compute-square" },
  { event: "calculate/square" },
  async ({ event }) => {
    return { result: event.data.number * event.data.number }; // Result typed as { result: number }
  }
);

// In this function, we'll call `computeSquare`
const mainFunction = inngest.createFunction(
  { id: "main-function" },
  { event: "main/event" },
  async ({ step }) => {
    const square = await step.invoke("compute-square-value", {
      function: computeSquare,
      data: { number: 4 }, // input data is typed, requiring input if it's needed
    });

    return `Square of 4 is ${square.result}.`; // square.result is typed as number
  }
);
```

--------------------------------

TITLE: Combine Account and Function Concurrency Limits in TypeScript
DESCRIPTION: This example demonstrates combining two concurrency limits in a single Inngest function. It sets an account-level limit using 'openai' as a key and a function-level limit based on 'event.data.account_id'. This creates multiple virtual queues to manage concurrent executions.

SOURCE: https://www.inngest.com/docs/guides/concurrency

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "unique-function-id",
    concurrency: [
      {
         // Use an account-level concurrency limit for this function, using the
         // "openai" key as a virtual queue.  Any other function which
         // runs using the same "openai"` key counts towards this limit.
         scope: "account",
         key: `"openai"`,
         limit: 10,
      },
      {
         // Create another virtual concurrency queue for this function only.  This
         // limits all accounts to a single execution for this function, based off
         // of the `event.data.account_id` field.
         // NOTE - "fn" is the default scope, so we could omit this field.
         scope: "fn",
         key: "event.data.account_id",
         limit: 1,
      },
    ],
  },
  { event: "ai/summary.requested" },
  async ({ event, step }) => {
  }
);

```

--------------------------------

TITLE: Configure Priority in TypeScript
DESCRIPTION: Demonstrates how to configure dynamic priority for an Inngest function in TypeScript. The 'run' property accepts an expression that evaluates to seconds, adjusting the function's execution priority. A positive value prioritizes the run ahead of other jobs, while a negative value delays it. This example prioritizes enterprise accounts.

SOURCE: https://www.inngest.com/docs/guides/priority

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  {
    id: "ai-generate-summary",
    priority: {
      // For enterprise accounts, a given function run will be prioritized
      // ahead of functions that were enqueued up to 120 seconds ago.
      // For all other accounts, the function will run with no priority.
      run: "event.data.account_type == 'enterprise' ? 120 : 0",
    },
  },
  { event: "ai/summary.requested" },
  async ({ event, step }) => {
    // This function will be prioritized based on the account type
  }
);

```

--------------------------------

TITLE: Send Event
DESCRIPTION: Sends 1 or more events to the Inngest server from within a function. Returns a list of the event IDs.

SOURCE: https://www.inngest.com/docs/reference/python/steps/send-event

LANGUAGE: APIDOC
CODE:
```
## POST /functions/send_event

### Description
Sends one or more events to the Inngest server from within an Inngest function. This method returns a list of the event IDs for the sent events.

### Method
POST

### Endpoint
`/functions/send_event`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **step_id** (str) - Required - The unique identifier for the step within the function.
- **events** (Event | list[Event]) - Required - One or more events to send.
  - **data** (dict) - Optional - Any data to associate with the event.
  - **id** (str) - Optional - A unique ID for idempotency. The first event with a given ID triggers the run.
  - **name** (str) - Required - The name of the event, recommended to use dot notation (e.g., `app/user.created`).
  - **ts** (int) - Optional - Timestamp in milliseconds for when the event occurred. Defaults to Inngest server receive time. If in the future, function runs are scheduled.

### Request Example
```json
{
  "step_id": "unique_step_id",
  "events": [
    {
      "name": "app/user.created",
      "data": {"user_id": 123},
      "id": "event-id-1",
      "ts": 1678886400000
    }
  ]
}
```

### Response
#### Success Response (200)
- **event_ids** (list[str]) - A list of IDs for the successfully sent events.

#### Response Example
```json
{
  "event_ids": ["event-id-1"]
}
```
```

--------------------------------

TITLE: Configuring Inngest with Winston Logger (TypeScript)
DESCRIPTION: Example of initializing an Inngest client with a custom Winston logger. It configures Winston to use console and DataDog HTTP transports, setting up logging for production environments like Vercel.

SOURCE: https://www.inngest.com/docs/guides/logging

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";
import winston from "winston";

/// Assuming we're deploying to Vercel.
/// Other providers likely have their own pre-defined environment variables you can use.
const env = process.env.VERCEL_ENV || "development";
const ddTransportOps = {
  host: "http-intake.logs.datadoghq.com",
  path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nextjs&service=inngest&ddtags=env:${env}`,
  ssl: true,
};

const logger = winston.createLogger({
  level: "info",
  exitOnError: false,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http(ddTransportOps),
  ],
});

// Pass `logger` to the Inngest client, and this winston logger will be accessible within functions
export const inngest = new Inngest({
  id: "my-awesome-app",
  logger: logger,
  // ...
});

```

--------------------------------

TITLE: Defining Types for Wildcard Triggers
DESCRIPTION: Define TypeScript types for events matched by wildcard triggers to ensure type safety and provide accurate event data shaping within your function.

SOURCE: https://www.inngest.com/docs/guides/multiple-triggers

LANGUAGE: APIDOC
CODE:
```
## Event Schemas with Wildcards

### Description
This example demonstrates how to define custom TypeScript types for events matched by wildcard patterns using `EventSchemas`.

### Code Example
```typescript
import { Inngest, EventSchemas } from 'inngest';

type WildcardEvents = {
  "app/blog.post.*": {
    name: "app/blog.post.created" | "app/blog.post.published";
    data: {
      postId: string;
      authorId: string;
      createdAt: string;
    } | {
      postId: string;
      authorId: string;
      publishedAt: string;
    }
  }
}

const inngest = new Inngest({
  id: "my-app",
  schemas: new EventSchemas().fromRecord<WildcardEvents>()
});

inngest.createFunction(
  { id: "blog-updates-to-slack" },
  { event: "app/blog.post.*" },
  async ({ event, step }) => {
    // `event` is now strongly typed according to WildcardEvents
    if (event.name === "app/blog.post.created") {
      console.log(event.data.postId);
    }
    // ...
  },
);
```
```

--------------------------------

TITLE: Batching Configuration
DESCRIPTION: Configure how Inngest functions consume batches of events, including maximum size, timeout, and conditional batching.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## POST /websites/inngest

### Description
Configure how Inngest functions consume batches of events, including maximum size, timeout, and conditional batching.

### Method
POST

### Endpoint
/websites/inngest

### Parameters
#### Request Body
- **batchEvents** (object) - optional - Configure how the function should consume batches of events.
  - **maxSize** (number) - required - The maximum number of events a batch can have. Current limit is `100`.
  - **timeout** (string) - required - How long to wait before invoking the function with the batch even if it's not full. Current permitted values are from `1s` to `60s`.
  - **key** (string) - optional - A unique key expression to apply the batching to. Examples: `'event.data.customer_id'`, `'event.data.account_id + "-" + event.user.email'`
  - **if** (string) - optional - A boolean expression to conditionally batch events that evaluate to true on this expression. Examples: `'event.data.account_type == "free"'`

```

--------------------------------

TITLE: Send Welcome Email on App Signup with TypeScript
DESCRIPTION: This Inngest function is triggered by an 'app/signup.completed' event and sends a welcome email to the new user using the `sendEmail` helper function.

SOURCE: https://www.inngest.com/docs/guides/resend-webhook-events

LANGUAGE: typescript
CODE:
```
import { sendEmail } from "./resend";

const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email' },
  { event: 'app/signup.completed' },
  async ({ event }) => {
	  const { user } = event.data;
    await sendEmail(user.email, "Welcome to Acme", (
      <div>
        <h1>Welcome to ACME, {user.firstName}</h1>
      </div>
    ));
  }
)
```

--------------------------------

TITLE: Initialize Inngest Client
DESCRIPTION: Provides an example of how to initialize an Inngest client, which is a prerequisite for creating functions using the `inngest.createFunction()` method. It's recommended to export this client instance for reuse across the application.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";

// We recommend exporting your client from a separate file so that it can be
// reused across the codebase.
export const inngest = new Inngest({ name: "My App" });

```

--------------------------------

TITLE: Remix: Setup Inngest API Endpoint
DESCRIPTION: Configures the Inngest API endpoint for Remix applications. This code sets up the Remix route handler to serve Inngest functions.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
// app/routes/api.inngest.ts
import { serve } from "inngest/remix";
import { inngest } from "~/inngest/client";
import fnA from "~/inngest/fnA";

const handler = serve({
  client: inngest,
  functions: [fnA],
});

export { handler as action, handler as loader };

```

--------------------------------

TITLE: Deno Fresh Integration
DESCRIPTION: Integrates Inngest with Deno's Fresh framework using the esm.sh CDN. Requires the `serve` handler from `inngest/deno/fresh` and your Inngest client and functions.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { serve } from "https://esm.sh/inngest/deno/fresh";
import { inngest } from "./src/inngest/client.ts";
import fnA from "./src/inngest/fnA"; // Your own function

export const handler = serve({
  client: inngest,
  functions: [fnA],
});

```

--------------------------------

TITLE: Reminder Deleted Event Example (JSON)
DESCRIPTION: An example of a JSON payload for the 'tasks/reminder.deleted' event. This event is used to cancel a previously scheduled reminder function. It includes `userId` and `reminderId` to match and cancel the correct reminder.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-events

LANGUAGE: json
CODE:
```
{
  "name": "tasks/reminder.deleted",
  "data": {
    "userId": "user_123",
    "reminderId": "reminder_0987654321"
  }
}

```

--------------------------------

TITLE: Handle Standard Errors in Inngest Functions (TypeScript)
DESCRIPTION: Demonstrates how to throw standard JavaScript errors (like Error, TypeError) within an Inngest function handler or a step. Inngest automatically retries these errors. This is useful for general error conditions during event processing.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors

LANGUAGE: typescript
CODE:
```
import { inngest, step } from "inngest";

export default inngest.createFunction(
  { id: "import-item-data" },
  { event: "store/import.requested" },
  async ({ event }) => {

    // throwing a standard error
    if (!event.itemId) {
      throw new Error("Item ID is required");
    }

    // throwing an error within a step
    const item = await step.run('fetch-item', async () => {
      const response = await fetch(`https://api.ecommerce.com/items/${event.itemId}`);
      if (response.status === 500) {
        throw new Error("Failed to fetch item from ecommerce API");
      }
      // ...
    });
  }
);

```

--------------------------------

TITLE: Python SDK Middleware Constructor and transform_input/output Changes
DESCRIPTION: This snippet highlights changes in the Inngest Python SDK's middleware, including the addition of 'raw_request' to the constructor, the 'steps' and 'function' arguments to 'transform_input', and the replacement of 'output' with 'result' in 'transform_output'. The return types for these methods are now None, emphasizing in-place argument mutation.

SOURCE: https://www.inngest.com/docs/reference/python/migrations/v0

LANGUAGE: Python
CODE:
```
class TransformOutputResult:
    # Mutations to these fields within middleware will be kept after running
    # middleware
    error: typing.Optional[Exception]
    output: object

    # Mutations to these fields within middleware will be discarded after
    # running middleware
    step: typing.Optional[TransformOutputStepInfo]
```

LANGUAGE: Python
CODE:
```
class TransformOutputStepInfo:
    id: str
    op: Opcode
    opts: typing.Optional[dict[str, object]]
```

--------------------------------

TITLE: Inject OpenAI Client using Middleware (TypeScript)
DESCRIPTION: Configures Inngest to inject an OpenAI client instance into all functions using the dependencyInjectionMiddleware. This avoids repetitive client instantiation within each function.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection

LANGUAGE: typescript
CODE:
```
import { dependencyInjectionMiddleware } from "inngest";
import OpenAI from 'openai';

const openai = new OpenAI();

const inngest = new Inngest({
  id: 'my-app',
  middleware: [
    dependencyInjectionMiddleware({ openai }),
  ],
});

```

--------------------------------

TITLE: Publish Updates to a Channel (TypeScript)
DESCRIPTION: This code demonstrates how to publish updates to a specific Inngest Realtime channel and topic. It defines a channel and topic using the '@inngest/realtime' library and then uses this to publish a log message from within an Inngest function. Dependencies include 'inngest' and '@inngest/realtime'.

SOURCE: https://www.inngest.com/docs/examples/realtime

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";
import { realtimeMiddleware, channel, topic } from "@inngest/realtime";

const inngest = new Inngest({
  id: "my-app",
  middleware: [realtimeMiddleware()],
});

export const helloChannel = channel((uuid: string) => `hello-world.${uuid}`).addTopic(
  topic("logs").type<string>()
);

export const someTask = inngest.createFunction(
  { id: "hello-world" },
  { event: "hello-world/hello" },
  async ({ event, step, publish }) => {
    const { uuid } = event.data;
    await publish(helloChannel(uuid).logs("Hello, world!"));
  }
);

```

--------------------------------

TITLE: Create OpenAI Middleware in TypeScript
DESCRIPTION: Defines a custom Inngest middleware to inject an OpenAI client instance into the function context. It uses the `transformInput` hook to add the `openai` client, making it available to all Inngest functions without explicit instantiation.

SOURCE: https://www.inngest.com/docs/reference/middleware/typescript

LANGUAGE: typescript
CODE:
```
import { InngestMiddleware } from "inngest";
import OpenAI from "openai";

const openaiMiddleware = new InngestMiddleware({
  name: "OpenAI Middleware",
  init() {
    const openai = new OpenAI();

    return {
      onFunctionRun(ctx) {
        return {
          transformInput(ctx) {
            return {
              // Anything passed via `ctx` will be merged with the function's arguments
              ctx: {
                openai,
              },
            };
          },
        };
      },
    };
  },
});
```

--------------------------------

TITLE: Create Cloudflare Workers Middleware for Inngest
DESCRIPTION: This middleware extracts the `env` object from the Cloudflare Workers fetch event handler arguments and makes it available to Inngest function handlers. It uses the `onFunctionRun` and `transformInput` lifecycle methods.

SOURCE: https://www.inngest.com/docs/examples/middleware/cloudflare-workers-environment-variables

LANGUAGE: typescript
CODE:
```
import { Inngest, InngestMiddleware } from 'inngest';

const bindings = new InngestMiddleware({
  name: 'Cloudflare Workers bindings',
  init({ client, fn }) {
    return {
      onFunctionRun({ ctx, fn, steps, reqArgs }) {
        return {
          transformInput({ ctx, fn, steps }) {
            // reqArgs is the array of arguments passed to the Worker's fetch event handler
            // ex. fetch(request, env, ctx)
            // We cast the argument to the global Env var that Wrangler generates:
            const env = reqArgs[1] as Env;
            return {
              ctx: {
                // Return the env object to the function handler's input args
                env,
              },
            };
          },
        };
      },
    };
  },
});

// Include the middleware when creating the Inngest client
export const inngest = new Inngest({
  id: 'my-workers-app',
  middleware: [bindings],
});

```

--------------------------------

TITLE: Synchronize Data with Rate Limiting (TypeScript Example)
DESCRIPTION: An example of an Inngest function designed to synchronize company data from Intercom, with rate limiting applied. It limits runs to once every 4 hours per company ID to avoid over-syncing. The function fetches company data and updates the database.

SOURCE: https://www.inngest.com/docs/reference/functions/rate-limit

LANGUAGE: typescript
CODE:
```
/** Example event payload:
{
  name: "intercom/company.updated",
  data: {
    company_id: "123456789",
    company_name: "Acme, Inc."
  }
}
*/
export default inngest.createFunction(
  {
    id: "synchronize-data",
    rateLimit: {
      key: "event.data.company_id",
      limit: 1,
      period: "4h",
    },
  },
  { event: "intercom/company.updated" },
  async ({ event, step }) => {
    const company = await step.run(
      "fetch-latest-company-data-from-intercom",
      async () => {
        return await client.companies.find({
          companyId: event.data.company_id,
        });
      }
    );

    await step.run("update-company-data-in-database", async () => {
      return await database.companies.upsert({ id: company.id }, company);
    });
  }
);
```

--------------------------------

TITLE: Inngest Event Payload Example
DESCRIPTION: Provides an example of the event payload object that triggers an Inngest function, including name, data, version, and timestamp.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: javascript
CODE:
```
{
  name: "app/account.created",
  data: {
    userId: "1234567890"
  },
  v: "2023-05-12.1",
  ts: 1683898268584
}
```

--------------------------------

TITLE: Retries and Failure Handling
DESCRIPTION: Configure the number of retries for Inngest functions and define a callback for failure scenarios.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## POST /websites/inngest

### Description
Configure the number of retries for Inngest functions and define a callback for failure scenarios.

### Method
POST

### Endpoint
/websites/inngest

### Parameters
#### Request Body
- **retries** (number) - optional - Configure the number of times the function will be retried from `0` to `20`. Default: `4`.
- **onFailure** (function) - optional - A function that will be called only when this Inngest function fails after all retries have been attempted.

```

--------------------------------

TITLE: Send Reminder Email Conditionally in Inngest (TypeScript)
DESCRIPTION: This code snippet demonstrates an Inngest function that sends a welcome email upon user creation and then waits for a 'post.created' event. If the post creation event is not received within 24 hours, it sends a reminder email. It utilizes `step.run` for executing code blocks and `step.waitForEvent` to pause execution until a specific event occurs.

SOURCE: https://www.inngest.com/docs/guides/multi-step-functions

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "activation-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    await step.run("send-welcome-email", async () => {
      return await sendEmail({ email: event.user.email, template: "welcome" });
    });

    // Wait for an "app/post.created" event
    const postCreated = await step.waitForEvent("wait-for-post-creation", {
      event: "app/post.created",
      match: "data.user.id", // the field "data.user.id" must match
      timeout: "24h", // wait at most 24 hours
    });

    if (!postCreated) {
      // If no post was created, send a reminder email
      await step.run("send-reminder-email", async () => {
        return await sendEmail({
          email: event.user.email,
          template: "reminder",
        });
      });
    }
  }
);

```

--------------------------------

TITLE: Prevent Duplicate Event Runs (TypeScript)
DESCRIPTION: Demonstrates how to prevent duplicate function executions by adding a unique `id` to the event payload when sending events with the Inngest SDK. This ID is used for deduplication.

SOURCE: https://www.inngest.com/docs/events

LANGUAGE: typescript
CODE:
```
await inngest.send({
  // Your deduplication id must be specific to this event payload.
  // Use something that will not be used across event types, not a generic value like cartId
  id: "cart-checkout-completed-ed12c8bde",
  name: "storefront/cart.checkout.completed",
  data: {
    cartId: "ed12c8bde",
    // ...the rest of the payload's data...
  }
});
```

--------------------------------

TITLE: Mocking events for test execution
DESCRIPTION: Demonstrates how to provide mock data, such as events, to the `InngestTestEngine` either during initialization or for individual `execute` or `executeStep` calls. These mocks can override default behaviors.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
// Set the events for every execution
const t = new InngestTestEngine({
  function: helloWorld,
  // mocks here
});

// Or for just one, which will overwrite any current event mocks
t.execute({
  // mocks here
});

t.executeStep("my-step", {
  // mocks here
})
```

--------------------------------

TITLE: Execute Parallel Steps with ctx.group.parallel() in Python (Sync)
DESCRIPTION: Illustrates how to achieve step parallelism in a synchronous Python function using `ctx.group.parallel()`. This approach enables concurrent execution of multiple steps within a single function invocation. It's suitable for straightforward parallel tasks where async capabilities are not required.

SOURCE: https://www.inngest.com/docs/guides/step-parallelism

LANGUAGE: python
CODE:
```
@client.create_function(
  fn_id="my-fn",
  trigger=inngest.TriggerEvent(event="my-event"),
)
def fn(ctx: inngest.ContextSync) -> None:
  user_id = ctx.event.data["user_id"]

  (updated_user, sent_email) = ctx.group.parallel(
    (
      lambda: ctx.step.run("update-user", update_user, user_id),
      lambda: ctx.step.run("send-email", send_email, user_id),
    )
  )


```

--------------------------------

TITLE: Python Middleware Lifecycle Hooks
DESCRIPTION: Details the order of execution for Inngest Python middleware hooks during a function run and event sending.

SOURCE: https://www.inngest.com/docs/reference/python/middleware/lifecycle

LANGUAGE: APIDOC
CODE:
```
## Python Middleware Lifecycle Hooks

### Function Execution Hooks

The following middleware hooks are called during a function run. They can be invoked multiple times per function execution, depending on the number of steps.

1.  **`transform_input`**: Called upon receiving a request from Inngest, before any functions are executed. Useful for data mutation like decryption.
    *   **Arguments**:
        *   `ctx` (Context, required): The `ctx` argument passed to Inngest functions.
        *   `function` (Function, required): The Inngest function object.
        *   `steps` (StepMemos, required): Memoized step data.

2.  **`before_memoization`**: Called before checking memoized step data.

3.  **`after_memoization`**: Called after exhausting memoized step data.

4.  **`before_execution`**: Called before executing new code, typically after the last memoized step.

5.  **`after_execution`**: Called after executing new code.

6.  **`transform_output`**: Called after a step or function returns. Useful for mutating data before sending it back, like encryption.
    *   **Arguments**:
        *   `result` (TransformOutputResult, required): Contains `error` (Exception, optional), `output` (object, optional), and `step` (TransformOutputStepInfo, optional).

7.  **`before_response`**: Called before sending a response back to Inngest.

### Event Sending Hooks

These hooks are specifically for managing events being sent to Inngest.

1.  **`before_send_events`**: Called before sending events to Inngest.
    *   **Arguments**:
        *   `events` (list[Event], required): The list of events to send.

2.  **`after_send_events`**: Called after sending events to Inngest.
    *   **Arguments**:
        *   `result` (SendEventsResult, required): Contains `error` (str, optional) and `ids` (list[str], required).
```

--------------------------------

TITLE: Run Steps in Parallel with Promise.all() in Node.js
DESCRIPTION: Demonstrates how to execute multiple Inngest steps concurrently using `Promise.all()` in a Node.js function. Each step is initiated without awaiting, and then `Promise.all()` is used to await their completion, enabling parallel execution. This is useful for tasks like sending emails and updating user data simultaneously.

SOURCE: https://www.inngest.com/docs/guides/step-parallelism

LANGUAGE: javascript
CODE:
```
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "signup-flow" });

export const fn = inngest.createFunction(
  { id: "post-payment-flow" },
  { event: "stripe/charge.created" },
  async ({ event, step }) => {
    // These steps are not `awaited` and run in parallel when Promise.all
    // is invoked.
    const sendEmail = step.run("confirmation-email", async () => {
      const emailID = await sendEmail(event.data.email);
      return emailID;
    });

    const updateUser = step.run("update-user", async () => {
      return db.updateUserWithCharge(event);
    });

    // Run both steps in parallel.  Once complete, Promise.all will return all
    // parallelized state here.
    //
    // This ensures that all steps complete as fast as possible, and we still have
    // access to each step's data once they're complete.
    const [emailID, updates] = await Promise.all([sendEmail, updateUser]);

    return { emailID, updates };
  }
);

```

--------------------------------

TITLE: Define Event Cancellation by Event Name
DESCRIPTION: Configure an Inngest function to be cancelable by a specific event. This snippet defines cancellation based on the event name 'user.cancelled'.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "cancelOn": [
    {
      "event": "user.cancelled"
    }
  ]
}
```

--------------------------------

TITLE: Configure Debounce with TypeScript
DESCRIPTION: This snippet shows how to configure a function with a debounce period and key using the Inngest TypeScript SDK. The function will execute 5 minutes after the last event with the same 'account_id' is received. It utilizes the 'intercom/company.updated' event.

SOURCE: https://www.inngest.com/docs/guides/debounce

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  {
    id: "handle-webhook",
    debounce: {
      key: "event.data.account_id",
      period: "5m",
      timeout: "10m",
    },
  },
  { event: "intercom/company.updated" },
  async ({ event, step }) => {
    // This function will only be scheduled 5 minutes after events are no longer received with the same
    // `event.data.account_id` field.
    //
    // `event` will be the last event in the series received.
  }
);
```

--------------------------------

TITLE: Access Injected OpenAI Client in Inngest Function (TypeScript)
DESCRIPTION: Demonstrates how an Inngest Function, configured with the OpenAI client via middleware, can directly access and use the 'openai' client instance from its arguments to perform operations like creating chat completions.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
 {
 name: "user-create"
 },
 {
 event: "app/user.create"
 },
 async ({ openai }) => {
   const chatCompletion = await openai.chat.completions.create({
     messages: [{
       role: "user",
       content: "Say this is a test"
     }],
     model: "gpt-3.5-turbo",
   });

   // ...
 },
);

```

--------------------------------

TITLE: Send Multiple Events (TypeScript)
DESCRIPTION: Demonstrates how to send a list of events using Inngest. The `events` list must not exceed 5000 items. This function can be used for fan-out scenarios.

SOURCE: https://www.inngest.com/docs/usage-limits/inngest

LANGUAGE: typescript
CODE:
```
const events = [{name: "<event-name>", data: {}}, ...];

await step.sendEvent("send-example-events", events);
// or
await inngest.send(events);
```

--------------------------------

TITLE: Transform Stripe Webhook Events in JavaScript
DESCRIPTION: This JavaScript function transforms incoming Stripe webhook events, extracting the raw request body and the Stripe-Signature header. This data is then used to verify the signature in Inngest functions.

SOURCE: https://www.inngest.com/docs/platform/webhooks

LANGUAGE: javascript
CODE:
```
function transform(evt, headers, queryParams, raw) {
  return {
    name: `stripe/${evt.type}`,
    data: {
      raw,
      sig: headers["Stripe-Signature"],
    }
  };
};

```

--------------------------------

TITLE: Inngest v3 Serve Configuration
DESCRIPTION: Details on new and removed configuration options for the `serve()` function in v3.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: APIDOC
CODE:
```
## Serve Configuration

### `serve()`

#### Added
- **baseUrl** (string): Sets the URL for communicating with Inngest. Synonymous with `INNGEST_BASE_URL` or client `baseUrl`.

#### Removed
- **inngestBaseUrl**: Use `baseUrl` instead.
- **landingPage**: Deprecated in v2. Use the Inngest Dev Server (`npx inngest-cli@latest dev`).
```

--------------------------------

TITLE: Run Workflow Instance with Inngest Engine (TypeScript)
DESCRIPTION: This snippet demonstrates how to initialize and use the Inngest `Engine` within an Inngest Function. It configures the engine with custom actions and a loader function to retrieve workflow instances from events.

SOURCE: https://www.inngest.com/docs/reference/workflow-kit/engine

LANGUAGE: typescript
CODE:
```
import { Engine, type Workflow } from "@inngest/workflow-kit";

import { inngest } from "./client";
import { actions } from "./actions";
import { loadWorkflowInstanceFromEvent } from "./loaders";

const workflowEngine = new Engine({
  actions: actionsWithHandlers,
  loader: (event) => {
    return loadWorkflowInstanceFromEvent(event);
  },
});

export default inngest.createFunction(
  { id: "blog-post-workflow" },
  { event: "blog-post.updated" },
  async ({ event, step }) => {
    // When `run` is called,
    //  the loader function is called with access to the event
    await workflowEngine.run({ event, step });
  }
);

```

--------------------------------

TITLE: Python: Sleep until a specific time
DESCRIPTION: Demonstrates how to use the `sleep_until` function from the Inngest Python SDK. This function takes a unique step ID and a `datetime.datetime` object to specify when the execution should resume. It's useful for scheduling tasks.

SOURCE: https://www.inngest.com/docs/reference/python/steps/sleep-until

LANGUAGE: python
CODE:
```
@inngest_client.create_function(
    fn_id="my_function",
    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def fn(ctx: inngest.Context) -> None:
    await ctx.step.sleep_until(
        "zzz",
        datetime.datetime.now() + datetime.timedelta(seconds=2),
    )

```

--------------------------------

TITLE: Inngest Step Overview
DESCRIPTION: This section provides an overview of Inngest Steps, explaining their fundamental role as building blocks within Inngest functions and highlighting the benefits of using them for improved reliability, error handling, and testability.

SOURCE: https://www.inngest.com/docs/learn/inngest-steps

LANGUAGE: APIDOC
CODE:
```
## Inngest Steps

Steps are fundamental building blocks in Inngest functions. Each step represents an individual task (or other unit of work) within a function that can be executed independently.

### Benefits of Using Steps
  * **Improved reliability**: structured steps enable precise control and handling of each task within a function.
  * **Error handling**: capturing and managing errors at the step level means better error recovery.
  * **Retry mechanism**: failing steps can be retried and recovered independently, without re-executing other successful steps.
  * **Independent testing**: each step can be tested and debugged independently from others.
  * **Improved code readability**: modular approach makes code easier to navigate and refactor.
```

--------------------------------

TITLE: Configure Start Timeout for Inngest Function (TypeScript)
DESCRIPTION: Sets a 10-second timeout for a function run to start after being queued. If the run doesn't start within this period, it will be canceled. This is useful for preventing excessively long waits in the queue.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-timeouts

LANGUAGE: typescript
CODE:
```
const scheduleReminder = inngest.createFunction(
  {
    id: "schedule-reminder",
    timeouts: {
      // If the run takes longer than 10s to start, cancel the run.
      start: "10s",
    },
  }
  { event: "tasks/reminder.created" },
  async ({ event, step }) => {
    await step.run('send-reminder-push', async () => {
      await pushNotificationService.push(event.data.reminder)
    })
  }
  // ...
);
```

--------------------------------

TITLE: Configure Start and Finish Timeouts for Inngest Function (TypeScript)
DESCRIPTION: Configures a function with a 10-second timeout for starting and a 30-second timeout for completion after execution begins. This ensures that runs are canceled if they are either stuck in the queue for too long or take too long to execute.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-timeouts

LANGUAGE: typescript
CODE:
```
const scheduleReminder = inngest.createFunction(
  {
    id: "schedule-reminder",
    timeouts: {
      // If the run takes longer than 10s to start, cancel the run.
      start: "10s",
      // And if the run takes longer than 30s to finish after starting, cancel the run.
      finish: "30s",
    },
  }
  { event: "tasks/reminder.created" },
  async ({ event, step }) => {
    await step.run('send-reminder-push', async () => {
      await pushNotificationService.push(event.data.reminder)
    })
  }
  // ...
);
```

--------------------------------

TITLE: TypeScript: Inngest Workflow with Realtime Confirmation
DESCRIPTION: This TypeScript code demonstrates an Inngest workflow that uses Realtime channels and the `waitForEvent` function to manage a human-in-the-loop process. It publishes a message requiring confirmation and waits for a specific reply event, correlating messages using a UUID. Dependencies include 'crypto' and '@inngest/realtime'.

SOURCE: https://www.inngest.com/docs/examples/realtime

LANGUAGE: typescript
CODE:
```
import crypto from "crypto";
import { Inngest } from "inngest";
import { realtimeMiddleware, channel, topic } from "@inngest/realtime";

const inngest = new Inngest({
  id: "my-app",
  middleware: [realtimeMiddleware()],
});

export const agenticWorkflowChannel = channel("agentic-workflow").addTopic(
  topic("messages").schema(
    z.object({
      message: z.string(),
      confirmationUUid: z.string(),
    })
  )
);

export const agenticWorkflow = inngest.createFunction(
  { id: "agentic-workflow" },
  { event: "agentic-workflow/start" },
  async ({ event, step, publish }) => {
    await step.run(/* ... */);
    const confirmationUUid = await step.run("get-confirmation-uuid", async () => crypto.randomUUID());
    await publish(agenticWorkflowChannel().messages({
      message: "Confirm to proceed?",
      confirmationUUid,
    }));
    const confirmation = await step.waitForEvent("wait-for-confirmation", {
      event: "agentic-workflow/confirmation",
      timeout: "15m",
      if: `async.data.confirmationUUid == "${confirmationUUid}"`, 
    });
    if (confirmation) {
      // continue workflow
    }
  }
);

```

--------------------------------

TITLE: GET /v1/events/{eventId}/runs
DESCRIPTION: Fetches all runs triggered by a specific event ID. This allows you to check the status and retrieve the output of a function run.

SOURCE: https://www.inngest.com/docs/examples/fetch-run-status-and-output

LANGUAGE: APIDOC
CODE:
```
## GET /v1/events/{eventId}/runs

### Description
Retrieves a list of all function runs associated with a given event ID. This endpoint is crucial for monitoring the execution status and output of your Inngest functions.

### Method
GET

### Endpoint
`/v1/events/{eventId}/runs`

### Parameters
#### Path Parameters
- **eventId** (string) - Required - The unique identifier of the event to fetch runs for.

#### Query Parameters
None

#### Request Body
None

### Request Example
```
GET https://api.inngest.com/v1/events/01HWAVEB858VPPX47Z65GR6P6R/runs
Authorization: Bearer YOUR_INNGEST_SIGNING_KEY
```

### Response
#### Success Response (200)
- **data** (array) - An array of run objects, each containing details like `run_id`, `status`, `output`, etc.

#### Response Example
```json
{
  "data": [
    {
      "run_id": "01HWAVJ8ASQ5C3FXV32JS9DV9Q",
      "run_started_at": "2024-04-25T14:46:45.337Z",
      "function_id": "6219fa64-9f58-41b6-95ec-a45c7172fa1e",
      "function_version": 12,
      "environment_id": "6219fa64-9f58-41b6-95ec-a45c7172fa1e",
      "event_id": "01HWAVEB858VPPX47Z65GR6P6R",
      "status": "Completed",
      "ended_at": "2024-04-25T14:46:46.896Z",
      "output": {
        "status": "success",
        "processedItems": 98,
        "failedItems": 2
      }
    }
  ]
}
```
```

--------------------------------

TITLE: Create a FastAPI App with Inngest Function using Modal (Python)
DESCRIPTION: This Python script defines a FastAPI application that integrates with Inngest. It sets up a Modal application, loads environment variables, defines an Inngest function, and serves the Inngest endpoint using the Inngest FastAPI adapter. The script requires FastAPI, Inngest, and Modal libraries.

SOURCE: https://www.inngest.com/docs/reference/python/guides/modal

LANGUAGE: python
CODE:
```
import os

from dotenv import load_dotenv
from fastapi import FastAPI
import inngest
import inngest.fast_api
import modal

load_dotenv()

app = modal.App("test-fast-api")

# Load all environment variables that start with "INNGEST_"
env: dict[str, str] = {}
for k, v, in os.environ.items():
    if k.startswith("INNGEST_"):
        env[k] = v

image = (
    modal.Image.debian_slim()
    .pip_install_from_requirements("requirements.txt")
    .env(env)
)

fast_api_app = FastAPI()

# Create an Inngest client
inngest_client = inngest.Inngest(app_id="fast_api_example")

# Create an Inngest function
@inngest_client.create_function(
    fn_id="my-fn",
    trigger=inngest.TriggerEvent(event="my-event"),
)
async def fn(ctx: inngest.Context) -> str:
    print(ctx.event)
    return "done"

# Serve the Inngest endpoint (its path is /api/inngest)
inngest.fast_api.serve(fast_api_app, inngest_client, [fn])

@app.function(image=image)
@modal.asgi_app()
def fastapi_app():
    return fast_api_app

```

--------------------------------

TITLE: Timeout Configuration
DESCRIPTION: Configure timeouts for Inngest functions, including startup and completion timeouts.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: APIDOC
CODE:
```
## POST /websites/inngest

### Description
Configure timeouts for Inngest functions, including startup and completion timeouts.

### Method
POST

### Endpoint
/websites/inngest

### Parameters
#### Request Body
- **timeouts** (object) - optional - Options to configure timeouts for cancellation.
  - **start** (string) - optional - The timeout for starting a function run. Examples: `10s`, `45m`, `18h30m`.
  - **finish** (string) - optional - The timeout for finishing a function run.

```

--------------------------------

TITLE: Standard Error Handling
DESCRIPTION: Inngest automatically handles and retries standard JavaScript errors (like Error, TypeError) thrown within function handlers or steps.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/errors

LANGUAGE: APIDOC
CODE:
```
## POST /functions/handle-item-data

### Description
Handles item data import and throws standard errors for validation or fetch failures.

### Method
POST

### Endpoint
/functions/handle-item-data

### Request Body
- **itemId** (string) - Required - The ID of the item to import.

### Request Example
```json
{
  "itemId": "12345"
}
```

### Response
#### Success Response (200)
- **status** (boolean) - Indicates the success of the operation.

#### Response Example
```json
{
  "status": true
}
```
```

--------------------------------

TITLE: Serve Handler Implementation (TypeScript)
DESCRIPTION: Implements a request handler for the Inngest SDK, processing different HTTP methods (PUT, POST, GET) to handle deployment, function execution, and introspection requests. It parses URLs and request bodies to extract necessary data.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
export const serve: ServeHandler = (inngest, fns, opts) => {
  const handler = new InngestCommHandler(
    name,
    inngest,
    fns,
    {
      fetch: fetch.bind(globalThis),
      ...opts,
    },
    (req: Request) => {
      const url = new URL(req.url, `https://${req.headers.get("host") || ""}`);

      return {
        url,
        register: () => {
          if (req.method === "PUT") {
            return {
              deployId: url.searchParams.get(queryKeys.DeployId) as string,
            };
          }
        },
        run: async () => {
          if (req.method === "POST") {
            return {
              data: (await req.json()) as Record<string, unknown>,
              fnId: url.searchParams.get(queryKeys.FnId) as string,
              stepId: url.searchParams.get(queryKeys.StepId) as string,
              signature: req.headers.get(headerKeys.Signature) as string,
            };
          }
        },
        view: () => {
          if (req.method === "GET") {
            return {
              isIntrospection: url.searchParams.has(queryKeys.Introspect),
            };
          }
        },
      };
    },
    ({ body, status, headers }): Response => {
      return new Response(body, { status, headers });
    }
  );

  return handler.createHandler();
};
```

--------------------------------

TITLE: Combining Multiple Concurrency Limits
DESCRIPTION: Example demonstrating how to set multiple concurrency limits for an Inngest function, combining account-level and function-level scopes.

SOURCE: https://www.inngest.com/docs/guides/concurrency

LANGUAGE: APIDOC
CODE:
```
## POST /websites/inngest

### Description
This endpoint demonstrates how to configure an Inngest function with multiple concurrency limits. It combines an account-level limit for a specific key (e.g., 'openai') and a function-level limit based on event data.

### Method
POST

### Endpoint
`/websites/inngest`

### Parameters
#### Request Body
- **id** (string) - Required - A unique identifier for the function.
- **concurrency** (array) - Required - An array of concurrency limit objects.
  - **scope** (string) - Optional - The scope of the concurrency limit ('account' or 'fn'). Defaults to 'fn'.
  - **key** (string) - Required - The key used to group runs for concurrency limiting.
  - **limit** (number) - Required - The maximum number of concurrent runs allowed for this key and scope.
- **event** (object) - Required - Defines the event that triggers the function.
  - **name** (string) - Required - The name of the event.

### Request Example
```json
{
  "id": "unique-function-id",
  "concurrency": [
    {
      "scope": "account",
      "key": "openai",
      "limit": 10
    },
    {
      "scope": "fn",
      "key": "event.data.account_id",
      "limit": 1
    }
  ],
  "event": {
    "name": "ai/summary.requested"
  }
}
```

### Response
#### Success Response (200)
Indicates the function was created or updated successfully. The response body typically confirms the function's configuration.

#### Response Example
```json
{
  "message": "Function configured successfully",
  "functionId": "unique-function-id"
}
```
```

--------------------------------

TITLE: Create Inngest Client (TypeScript)
DESCRIPTION: Initializes an Inngest client with a unique application ID and sets up an array to export Inngest functions. This code should be placed in a dedicated Inngest file.

SOURCE: https://www.inngest.com/docs/getting-started/nodejs-quick-start

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

// Create an empty array where we'll export future Inngest functions
export const functions = [];

```

--------------------------------

TITLE: Add OpenAI Client to Inngest Functions (Python v0.3.0+)
DESCRIPTION: This Python code snippet illustrates how to inject an OpenAI client into Inngest functions using the `dependencyInjectionMiddleware` for Python version 0.3.0 and newer. This method centralizes client management.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection_guide=typescript

LANGUAGE: python
CODE:
```
from inngest import Inngest, InngestMiddleware
from openai import OpenAI

client = Inngest(
    # your Inngest client config
)

class DependencyInjectionMiddleware(InngestMiddleware):
    async def transform_request(self, request, handler):
        openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        return await handler(request, openai_client=openai_client)

@client.create_function(
    name="My First Function",
    trigger=inngest.trigger.event("test.event"),
    middleware=[DependencyInjectionMiddleware()],
)
def my_inngest_function(event, openai_client):
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hello world"}],
    )
    return response.choices[0].message.content
```

--------------------------------

TITLE: Step Handler Examples: Async, Sync, and Data Return
DESCRIPTION: Illustrates various ways to use `step.run()` with different handler types. It shows how to fetch API data asynchronously, transform data synchronously, and insert data without necessarily returning a value. Steps are designed to return data that can be used in subsequent steps.

SOURCE: https://www.inngest.com/docs/reference/functions/step-run

LANGUAGE: typescript
CODE:
```
// Steps can have async handlers
const result = await step.run("get-api-data", async () => {
  // Steps should return data used in other steps
  return fetch("...").json();
});

// Steps can have synchronous handlers
const data = await step.run("transform", () => {
  return transformData(result);
});

// Returning data is optional
await step.run("insert-data", async () => {
  db.insert(data);
});
```

--------------------------------

TITLE: Create Inngest Function with Event Trigger (JavaScript)
DESCRIPTION: This Inngest function, written in JavaScript, is configured to trigger on the 'retool/backfill.requested' event. It imports an external backfill script and executes it using the 'user_id' from the event data, returning a status code based on the script's success.

SOURCE: https://www.inngest.com/docs/guides/trigger-your-code-from-retool

LANGUAGE: javascript
CODE:
```
import { runBackfillForUser } from "../lib/backfill-scripts";
import { inngest } from "./client";

export default inngest.createFunction(
  { id: "run-backfill-for-user" }, // The name displayed in the Inngest dashboard
  { event: "retool/backfill.requested" }, // The event triggger
  async ({ event }) => {
    const result = await runBackfillForUser(event.data.user_id);

    return {
      status: result.ok ? 200 : 500,
      message: `Ran backfill for user ${event.data.user_id}`,
    };
  }
);
```

--------------------------------

TITLE: Configure Rate Limiting in TypeScript
DESCRIPTION: This snippet demonstrates how to configure rate limiting for an Inngest function in TypeScript. It sets a limit of 1 function run per 4 hours, keyed by a company ID from the event data. This prevents excessive runs for the same company.

SOURCE: https://www.inngest.com/docs/guides/rate-limiting

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  {
    id: "synchronize-data",
    rateLimit: {
      limit: 1,
      period: "4h",
      key: "event.data.company_id",
    },
  },
  { event: "intercom/company.updated" },
  async ({ event, step }) => {
    // This function will be rate limited
    // It will only run once per 4 hours for a given event payload with matching company_id
  }
);

```

--------------------------------

TITLE: Serve API Handler Usage
DESCRIPTION: Example of how to import and use the serve API handler with your Inngest client and functions.

SOURCE: https://www.inngest.com/docs/sdk/reference/serve

LANGUAGE: APIDOC
CODE:
```
## POST /api/inngest

### Description
Invokes functions with the request body as incoming function state.

### Method
POST

### Endpoint
/api/inngest

### Request Body
- **event** (object) - Required - The event data for the function.
- **signature** (string) - Required - The signature of the request.
- **timestamp** (number) - Required - The timestamp of the request.

### Response
#### Success Response (200)
- **data** (object) - The result of the function invocation.

### Request Example
```json
{
  "event": {
    "name": "user.signup",
    "data": {
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  },
  "signature": "<signature>",
  "timestamp": 1678886400
}
```

#### Response Example
```json
{
  "data": {
    "message": "User signed up successfully."
  }
}
```
```

--------------------------------

TITLE: Create Signup Drip Campaign with Inngest
DESCRIPTION: This Javascript code defines an Inngest function to manage a user signup drip campaign. It sends a welcome email, waits for an engagement event (email click), and then conditionally sends follow-up emails based on user interaction and plan type. Dependencies include 'inngest' SDK, a 'sendEmail' function, and a 'db' object for user data.

SOURCE: https://www.inngest.com/docs/guides/resend-webhook-events

LANGUAGE: javascript
CODE:
```
const signupDripCampaign = inngest.createFunction(
  { id: "signup-drip-campaign" },
  { event: "app/signup.completed" },
  async ({ event, step }) => {
    const { user } = event.data;
    const { email, first_name } = user
    const welcome = "Welcome to ACME";

    const { id: emailId } = await step.run("welcome-email", async () => {
      return await sendEmail(
        email,
        welcome,
        <div>
          <h1>Welcome to ACME, {user.firstName}</h1>
        </div>
      );
    });

    // Wait up to 3 days for the user open the email and click any link in it
    const clickEvent = await step.waitForEvent("wait-for-engagement", {
      event: "resend/email.clicked",
			if: `async.data.email_id == ${emailId}`,
      timeout: "3 days",
    });

    // if the user clicked the email, send them power user tips
    if (clickEvent) {
      await step.sleep("delay-power-tips-email", "1 day");
      await step.run("send-power-user-tips", async () => {
        await sendEmail(
          email,
          "Supercharge your ACME experience",
          <h1>
            Hello {firstName}, here are tips to get the most out of ACME
          </h1>
        );
      });

      // wait one more day before sending the trial offer
      await step.sleep("delay-trial-email", "1 day");
    }

    // check that the user is not already on the pro plan
    const dbUser = db.users.byEmail(email);

    if (dbUser.plan !== "pro") {
      // send them a free trial offer
      await step.run("trial-offer-email", async () => {
        await sendEmail(
          email,
          "Free ACME Pro trial",
          <h1>
            Hello {firstName}, try our Pro features for 30 days for free
          </h1>
        );
      });
    }
  }
);

```

--------------------------------

TITLE: Configure Batching
DESCRIPTION: Demonstrates how to configure batching for an Inngest function, including maxSize, timeout, key, and conditional batching.

SOURCE: https://www.inngest.com/docs/guides/batching

LANGUAGE: APIDOC
CODE:
```
## POST /functions/configure-batching

### Description
Configures an Inngest function to process multiple events in a single execution, optimizing for high-load scenarios.

### Method
POST

### Endpoint
/functions/configure-batching

### Parameters
#### Request Body
- **id** (string) - Required - The unique identifier for the function.
- **batchEvents** (object) - Optional - Configuration for batching events.
  - **maxSize** (number) - The maximum number of events to include in a batch.
  - **timeout** (string) - The duration to wait for events before triggering the batch execution (e.g., "5s").
  - **key** (string) - Optional expression to group events by (e.g., "event.data.user_id").
  - **if** (string) - Optional boolean expression to conditionally enable batching (e.g., "event.data.account_type == \"free\"").

### Request Example
```json
{
  "id": "record-api-calls",
  "batchEvents": {
    "maxSize": 100,
    "timeout": "5s",
    "key": "event.data.user_id",
    "if": "event.data.account_type == \"free\""
  }
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message indicating successful configuration.

#### Response Example
```json
{
  "message": "Batching configured successfully for function record-api-calls."
}
```
```

--------------------------------

TITLE: Concurrency Configuration
DESCRIPTION: This section provides an example of configuring concurrency limits for Inngest functions in TypeScript.

SOURCE: https://www.inngest.com/docs/guides/concurrency

LANGUAGE: APIDOC
CODE:
```
## POST /api/functions/config

### Description
Configure concurrency settings for Inngest functions.

### Method
POST

### Endpoint
`/api/functions/config`

### Parameters
#### Request Body
- **id** (string) - Required - The unique identifier for the function.
- **concurrency** (object) - Optional - Configuration for concurrency limits.
  - **scope** (string: 'account' | 'env' | 'fn') - Optional - The scope of the concurrency limit. Defaults to 'fn'.
  - **key** (string) - Optional - An expression that evaluates to a string used as the concurrency queue name. Required for 'env' and 'account' scopes.
  - **limit** (number) - Required - The maximum number of concurrently running steps. 0 or undefined means no limit.
- **event** (string | object) - Required - The event the function listens to.

### Request Example
```json
{
  "id": "func-a",
  "concurrency": {
    "scope": "account",
    "key": "'openai'",
    "limit": 5
  },
  "event": "ai/summary.requested"
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message.

#### Response Example
```json
{
  "message": "Function concurrency configured successfully."
}
```
```

--------------------------------

TITLE: Toggle Dark Mode Script - JavaScript
DESCRIPTION: This JavaScript snippet handles toggling between light and dark modes based on system preferences and local storage. It includes functions to update the UI mode and temporarily disable transitions for a smoother visual change.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection_guide=typescript

LANGUAGE: javascript
CODE:
```
  document.documentElement.classList.add('docs');

  // change to "let = darkModeMediaQuery" if/when this moves to the _document
  window.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  updateMode()
  window.darkModeMediaQuery.addEventListener('change', updateModeWithoutTransitions)
  window.addEventListener('storage', updateModeWithoutTransitions)

  function updateMode() {
    let isSystemDarkMode = window.darkModeMediaQuery.matches
    let isDarkMode = window.localStorage.isDarkMode === 'true' || (!('isDarkMode' in window.localStorage) && isSystemDarkMode)

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isDarkMode === isSystemDarkMode) {
      delete window.localStorage.isDarkMode
    }
  }

  function disableTransitionsTemporarily() {
    document.documentElement.classList.add('[&_*]:!transition-none')
    window.setTimeout(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none')
    }, 0)
  }

  function updateModeWithoutTransitions() {
    disableTransitionsTemporarily()
    updateMode()
  }
```

--------------------------------

TITLE: Run Pydantic Lists with output_type - Python
DESCRIPTION: Shows how to specify complex Pydantic types, such as lists of Union types, as the output_type for step functions. This allows for deserializing lists of different Pydantic models returned by a step.

SOURCE: https://www.inngest.com/docs/reference/python/guides/pydantic

LANGUAGE: python
CODE:
```
await ctx.step.run("get-person", get_users, output_type=list[User | Admin])

```

--------------------------------

TITLE: Preserve Stack Traces by Awaiting Promises in Inngest
DESCRIPTION: Explains the importance of awaiting Promises returned by functions executed in different event loop cycles, such as API calls or database operations, to preserve stack traces. Immediately returning a Promise may omit the calling function from the stack trace, hindering debugging.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors

LANGUAGE: javascript
CODE:
```
inngest.createFunction(
  { id: "update-recent-usage" },
  { event: "app/update-recent-usage" },
  async ({ event, step }) => {
    // ...
    await step.run("update in db", () => doSomeWork(event.data));
    // ...
  }
);

```

--------------------------------

TITLE: Limit Concurrency by Customer ID
DESCRIPTION: This example shows how to limit the concurrency of a function based on a specific key, such as a customer ID. This is useful for preventing a single customer's operations from overwhelming the system or hitting API limits.

SOURCE: https://www.inngest.com/docs/functions/concurrency

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  {
    id: "process-customer-data",
    concurrency: {
      limit: 5,
      key: "event.data.customer_id",
    },
  }
  // ...
);

```

--------------------------------

TITLE: Run Steps in Parallel with Lambda - Python
DESCRIPTION: Executes multiple Inngest steps concurrently using lambda functions within a tuple. Each lambda wraps a `ctx.step.run` call. The results are returned as a tuple.

SOURCE: https://www.inngest.com/docs/reference/python/steps/parallel

LANGUAGE: python
CODE:
```
@inngest_client.create_function(
    fn_id="my-function",
    trigger=inngest.TriggerEvent(event="my-event"),
)
async def fn(ctx: inngest.Context) -> None:
    user_id = ctx.event.data["user_id"]

    (updated_user, sent_email) = await ctx.group.parallel(
        (
            lambda: ctx.step.run("update-user", update_user, user_id),
            lambda: ctx.step.run("send-email", send_email, user_id),
        )
    )

```

--------------------------------

TITLE: Advanced Middleware Mutation with Const Assertion (TypeScript)
DESCRIPTION: Shows how to use a const assertion within dependencyInjectionMiddleware to enforce literal types for injected values, providing more accurate type inference within Inngest Functions.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection

LANGUAGE: typescript
CODE:
```
// In middleware
dependencyInjectionMiddleware({
  foo: "bar",
} as const)

// In a function
async ({ event, foo }) => {
  //             ^? (parameter) foo: "bar"
}

```

--------------------------------

TITLE: Use `waitForEvent` for Onboarding Drip Campaign
DESCRIPTION: Implements a step function that waits for a 'user/account.setup.completed' event after a 'user/new.signup'. It includes a timeout and matching logic based on `user_id`, with type safety for event data.

SOURCE: https://www.inngest.com/docs/typescript

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export default inngest.createFunction(
  { id: "onboarding-drip-campaign" },
  { event: "user/new.signup" },
  async ({ event, step }) => {
    await step.run("send-welcome-email", async () => {
      // "event" will be fully typed provide typesafety within this function
      return await email.send("welcome", event.data.email);
    });

    // We wait up to 2 days for the user to set up their account
    const accountSetupCompleted = await step.waitForEvent(
      "wait-for-setup-complete",
      {
        event: "user/account.setup.completed",
        timeout: "2d",
        // ⬇️ This matches both events using the same property
        // Since both events types are registered above, this is match is typesafe
        match: "data.user_id",
      }
    );

    if (!accountSetupCompleted) {
      await step.run("send-setup-account-guide", async () => {
        return await email.send("account_setup_guide", event.data.email);
      });
    }
  }
);

```

--------------------------------

TITLE: Verifying Request Signatures
DESCRIPTION: This section details how to verify incoming webhook signatures to ensure authenticity and data integrity. It includes examples of how to extract the signature and raw request body in a transform function and then use them to verify the signature within an Inngest function.

SOURCE: https://www.inngest.com/docs/platform/webhooks

LANGUAGE: APIDOC
CODE:
```
## Verifying Request Signatures

Many webhook providers sign their requests with a secret key to ensure that the request is coming from them. This establishes trust with the webhook provider and ensures that the event data has not been tampered with.

To verify a webhook signature, you'll need to return the signature and raw request body string in your transform. For example, the following transform function could be used for Stripe webhooks:

### Transform Function Example (Stripe)

```javascript
function transform(evt, headers, queryParams, raw) {
  return {
    name: `stripe/${evt.type}`,
    data: {
      raw,
      sig: headers["Stripe-Signature"],
    }
  };
};
```

Then you can use that data to verify the signature in your Inngest functions:

### Inngest Function Example for Verification

```javascript
inngest.createFunction(
  { id: "stripe/charge.updated" },
  { event: "stripe/charge.updated" },
  async ({ attempt, event, step }) => {
    // Assuming `verifySig` and `stripeSecret` are defined elsewhere
    if (!verifySig(event.data.raw, event.data.sig, stripeSecret)) {
      // Use NonRetriableError for immediate failure without retries
      throw new NonRetriableError("failed signature verification");
    }

    // Now it's safe to use the event data.
    const data = JSON.parse(event.data.raw);
    // Process the verified event data
  }
);
```

### Error Handling
- `NonRetriableError`: Use this error type when signature verification fails, as retrying the same request will also fail.

```

--------------------------------

TITLE: Verify Stripe Webhook Signature in Inngest (JavaScript)
DESCRIPTION: This Inngest function verifies a Stripe webhook signature using the raw request body and signature. It parses the event data if the signature is valid. Requires a `verifySig` function and `stripeSecret`.

SOURCE: https://www.inngest.com/docs/platform/webhooks

LANGUAGE: javascript
CODE:
```
inngest.createFunction(
  { id: "stripe/charge.updated" },
  { event: "stripe/charge.updated" },
  async ({ attempt, event, step }) => {
    if (!verifySig(event.data.raw, event.data.sig, stripeSecret)) {
      throw new NonRetriableError("failed signature verification");
    }

    // Now it's safe to use the event data.
    const data = JSON.parse(event.data.raw);
  }
);

```

--------------------------------

TITLE: Create Inngest Client (TypeScript)
DESCRIPTION: Defines and exports an Inngest client instance. This client is used to interact with the Inngest platform, send events, and register functions within a Next.js application.

SOURCE: https://www.inngest.com/docs/getting-started/nextjs-quick-start

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

```

--------------------------------

TITLE: Trigger Background Job with Inngest Send (TypeScript)
DESCRIPTION: Shows how to trigger an Inngest background job by sending an event. The `inngest.send` method is used with the event name ('app/user.created') that matches the trigger defined in the background function. Any data passed in the `data` object is available to the triggered function.

SOURCE: https://www.inngest.com/docs/guides/background-jobs

LANGUAGE: typescript
CODE:
```
await inngest.send({
  name: "app/user.created", // This matches the event used in `createFunction`
  data: {
    email: "test@example.com",
    // any data you want to send
  },
});

```

--------------------------------

TITLE: Access Attempt Counter in Inngest Functions
DESCRIPTION: Shows how to access the current attempt number for a step within an Inngest function handler. The `attempt` variable is zero-indexed and increments with each retry, resetting upon successful execution. This is useful for implementing retry logic or switching to alternative services after a certain number of attempts.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors

LANGUAGE: javascript
CODE:
```
inngest.createFunction(
  { id: "generate-summary" },
  { event: "blog/post.created" },
  async ({ attempt }) => {
    // `attempt` is the zero-index attempt number

    await step.run('call-llm', async () => {
      if (attempt < 2) {
        // Call OpenAI's API two times
      } else {
        // After two attempts to OpenAI, try a different LLM, for example, Mistral
      }
    });
  }
);

```

--------------------------------

TITLE: Sync new user from Clerk to database
DESCRIPTION: This function listens for the 'clerk/user.created' event and inserts the new user's data into the database. It extracts user ID, name, and email from the event payload.

SOURCE: https://www.inngest.com/docs/guides/clerk-webhook-events

LANGUAGE: typescript
CODE:
```
const syncUser = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    // The event payload's data will be the Clerk User json object
    const { user } = event.data;
    const { id, first_name, last_name } = user;
    const email = user.email_addresses.find(e =>
      e.id === user.primary_email_address_id
    ).email;
    await database.users.insert({ id, email, first_name, last_name });
  }
)

```

--------------------------------

TITLE: Send Slack Notification on Function Failure - Inngest TypeScript SDK
DESCRIPTION: This example demonstrates how to send a Slack notification when an Inngest function fails. It uses the Slack Web API's `chat.postMessage` method to post a message to a specified Slack channel with details about the failure, including the store ID and the error message.

SOURCE: https://www.inngest.com/docs/reference/functions/handling-failures

LANGUAGE: typescript
CODE:
```
import { client } from "@slack/web-api";
import { inngest } from "./client";

export default inngest.createFunction(
  {
    id: "sync-shopify-products",
    // Your handler should be an async function:
    onFailure: async ({ error, event }) => {
      const originalEvent = event.data.event;

      // Post a message to the Engineering team's alerts channel in Slack:
      const result = await client.chat.postMessage({
        token: process.env.SLACK_TOKEN,
        channel: "C12345",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Sync Shopify function failed for Store ${
                originalEvent.storeId
              }: ${error.toString()}`,
            },
          },
        ],
      });

      return result;
    },
  },
  { event: "shop/product_sync.requested" },
  async ({ event, step, runId }) => {
    // This is the main function handler's code
    const products = await step.run("fetch-products", async () => {
      const storeId = event.data.storeId;
      // The function might fail here or...
    });
    await step.run("save-products", async () => {
      // The function might fail here after the maximum number of retries
    });
  }
);

```

--------------------------------

TITLE: Cloning InngestTestEngine with mocks
DESCRIPTION: Shows how to clone an existing `InngestTestEngine` instance to reuse complex mock configurations. New mocks can be provided during cloning, which will be merged with or override existing mocks.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
// Make a direct clone, which includes any mocks
const otherT = t.clone();

// Provide some more mocks in addition to any existing ones
const anotherT = t.clone({
  // mocks here
});
```

--------------------------------

TITLE: Mocking Inngest Steps
DESCRIPTION: Shows how to mock Inngest steps to control their behavior during testing. This includes mocking successful steps and steps that are designed to fail. Handlers run lazily when their corresponding step ID is encountered.

SOURCE: https://www.inngest.com/docs/reference/testing

LANGUAGE: typescript
CODE:
```
t.execute({
  steps: [
    {
      id: "successful-step",
      handler() {
        return "We did it!";
      },
    },
    {
      id: "dangerous-step",
      handler() {
        throw new Error("Oh no!");
      },
    },
  ],
});
```

LANGUAGE: typescript
CODE:
```
let message = "";

t.execute({
  steps: [
    {
      id: "build-greeting",
      handler() {
        message = "Hello, ";
        return message;
      },
    },
    {
      id: "build-name",
      handler() {
        return message + " World!";
      },
    },
  ],
});
```

LANGUAGE: typescript
CODE:
```
// Mock the step to execute a no-op handler to return immediately
t.execute({
  steps: [
    {
      id: "one-day-delay",
      handler() {}, // no return value necessary
    },
  ],
});
```

--------------------------------

TITLE: Inngest Rule: No Variable Mutation in Step
DESCRIPTION: Prohibits mutating variables inside `step.run()`. Instead, results should be returned from `step.run()` to ensure correct state management across Inngest's multiple executions of a function.

SOURCE: https://www.inngest.com/docs/sdk/eslint

LANGUAGE: javascript
CODE:
```
"@inngest/no-variable-mutation-in-step": "error" // recommended
```

LANGUAGE: javascript
CODE:
```
// ❌ Bad
// THIS IS WRONG!  step.run only runs once and is skipped for future
// steps, so userID will not be defined.
let userId;

// Do NOT do this!  Instead, return data from step.run.
await step.run("get-user", async () => {
  userId = await getRandomUserId();
});

console.log(userId); // undefined
```

LANGUAGE: javascript
CODE:
```
// ✅ Good
// This is the right way to set variables within step.run :)
const userId = await step.run("get-user", () => getRandomUserId());

console.log(userId); // 123
```

--------------------------------

TITLE: Disable Fetch Fallback with Inngest
DESCRIPTION: Disables the fallback mechanism for the Inngest fetch function entirely. Requires the 'inngest' package.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch

LANGUAGE: typescript
CODE:
```
import { fetch } from "inngest";

const api = new MyProductApi({
  fetch: fetch.config({ fallback: undefined }),
});
```

--------------------------------

TITLE: Set up Inngest Client in TypeScript
DESCRIPTION: Creates a new Inngest client instance, which is essential for defining functions and triggering events within your application. This setup is typically done once.

SOURCE: https://www.inngest.com/docs/sdk/overview

LANGUAGE: typescript
CODE:
```
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "my-app",
});

```

--------------------------------

TITLE: Handling Standard Errors
DESCRIPTION: Demonstrates how Inngest automatically retries functions and steps when standard JavaScript errors (like Error, TypeError) or custom errors extending Error are thrown.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors

LANGUAGE: APIDOC
CODE:
```
## POST /api/inngest/handle_error

### Description
This example shows how to throw a standard `Error` in an Inngest function handler or within a step to trigger automatic retries.

### Method
POST

### Endpoint
/api/inngest/handle_error

### Parameters

#### Request Body
- **event** (object) - Required - The Inngest event data, expected to have an `itemId` property.

### Request Example
```json
{
  "eventId": "evt_12345",
  "data": {
    "itemId": "item_abc"
  }
}
```

### Response
#### Success Response (200)
- **result** (boolean) - Indicates if the operation was successful.

#### Response Example
```json
{
  "result": true
}
```

### Error Handling Example
```javascript
import { inngest } from './inngest';

export default inngest.createFunction(
  { id: "import-item-data" },
  { event: "store/import.requested" },
  async ({ event, step }) => {
    // throwing a standard error
    if (!event.itemId) {
      throw new Error("Item ID is required");
    }

    // throwing an error within a step
    const item = await step.run('fetch-item', async () => {
      const response = await fetch(`https://api.ecommerce.com/items/${event.itemId}`);
      if (response.status === 500) {
        throw new Error("Failed to fetch item from ecommerce API");
      }
      return response.json();
    });
    // ... process item
    return { success: true };
  }
);
```
```

--------------------------------

TITLE: Boolean Expressions Examples (CEL)
DESCRIPTION: Examples of boolean expressions for conditional matching in Inngest. These expressions evaluate to true or false and can be used for matching events, cancellations, or within function triggers.

SOURCE: https://www.inngest.com/docs/guides/writing-expressions

LANGUAGE: CEL
CODE:
```
// Match a field to a string
"event.data.billingPlan == 'enterprise'"

// Number comparison
"event.data.amount > 1000"

// Combining multiple conditions
"event.data.billingPlan == 'enterprise' && event.data.amount > 1000"
"event.data.billingPlan != 'pro' || event.data.amount < 300"

// Compare the function trigger with an inbound event (for wait for event or cancellation)
"event.data.userId == async.data.userId"

// Alternatively, you can use JavaScript string interpolation for wait for event
`${userId} == async.data.userId` // => "user_1234 == async.data.userId"
```

--------------------------------

TITLE: NestJS: Setup Inngest API Endpoint
DESCRIPTION: Configures the Inngest API endpoint in a NestJS application. It sets up the Express application, registers the Inngest middleware, and injects dependencies for logging and application services into the Inngest functions.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import {
  Logger
} from '@nestjs/common';
import {
  NestFactory
} from '@nestjs/core';
import {
  NestExpressApplication
} from '@nestjs/platform-express';
import {
  serve
} from 'inngest/express';

import {
  inngest
} from '@modules/common/inngest/client';
import {
  getInngestFunctions
} from '@modules/common/inngest/functions';

import {
  AppModule
} from './app.module';
import {
  AppService
} from './app.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // Setup inngest
  app.useBodyParser('json', { limit: '10mb' });

  // Inject Dependencies into inngest functions

  const logger = app.get(Logger);
  const appService = app.get(AppService);

  // Pass dependencies into this function
  const inngestFunctions = getInngestFunctions({
    appService,
    logger,
  });

  // Register inngest endpoint
  app.use(
    '/api/inngest',
    serve({
      client: inngest,
      functions: inngestFunctions,
    }),
  );

  // Start listening for http requests
  await app.listen(3000);
}

bootstrap();

```

--------------------------------

TITLE: Wait for Event in Python using Inngest SDK
DESCRIPTION: This snippet demonstrates how to use the `step.wait_for_event` function from the Inngest Python SDK. It waits for a specific event ('app/wait_for_event.fulfill') within a 2-second timeout. The `ctx.step.wait_for_event` function is used to pause execution until the specified event is received or the timeout occurs.

SOURCE: https://www.inngest.com/docs/reference/python/steps/wait-for-event

LANGUAGE: python
CODE:
```
@inngest_client.create_function(
    fn_id="my_function",
    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def fn(ctx: inngest.Context) -> None:
    res = await ctx.step.wait_for_event(
        "wait",
        event="app/wait_for_event.fulfill",
        timeout=datetime.timedelta(seconds=2),
    )

```

--------------------------------

TITLE: Configure Throttling in TypeScript
DESCRIPTION: This snippet demonstrates how to configure throttling for an Inngest function using the Inngest TypeScript SDK. It includes settings for limit, period, burst, and a custom throttling key based on event data.

SOURCE: https://www.inngest.com/docs/guides/throttling

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  {
    id: "unique-function-id",
    throttle: {
      limit: 1,
      period: "5s",
      burst: 2,
      key: "event.data.user_id",
    },
  }
  { event: "ai/summary.requested" },
  async ({ event, step }) => {
  }
);

```

--------------------------------

TITLE: Nuxt: Setup Inngest API Endpoint
DESCRIPTION: Configures the Inngest API endpoint within a Nuxt server route. This allows Nuxt applications to seamlessly integrate with Inngest functions.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { serve } from "inngest/nuxt";
import { inngest } from "~~/inngest/client";
import fnA from "~~/inngest/fnA"; // Your own function

export default defineEventHandler(
  serve({
    client: inngest,
    functions: [fnA],
  })
);

```

--------------------------------

TITLE: Initialize Encryption Middleware (TypeScript)
DESCRIPTION: Initializes the encryption middleware with a provided encryption key, typically sourced from environment variables. This middleware can then be integrated into the Inngest client configuration to automatically encrypt specified event data, step data, and function output.

SOURCE: https://www.inngest.com/docs/features/middleware/encryption-middleware

LANGUAGE: typescript
CODE:
```
import { encryptionMiddleware } from "@inngest/middleware-encryption";

// Initialize the middleware
const mw = encryptionMiddleware({
  // your encryption key string should not be hard coded
  key: process.env.MY_ENCRYPTION_KEY,
});

// Use the middleware with Inngest
const inngest = new Inngest({
  id: "my-app",
  middleware: [mw],
});

```

--------------------------------

TITLE: NonRetriableError
DESCRIPTION: Use NonRetriableError to prevent Inngest from retrying a function or step, suitable for unrecoverable errors like invalid input.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/errors

LANGUAGE: APIDOC
CODE:
```
## POST /functions/mark-store-imported

### Description
Marks a store as imported. Throws NonRetriableError if the store is not found or an underlying error occurs, preventing further retries.

### Method
POST

### Endpoint
/functions/mark-store-imported

### Parameters
#### Request Body
- **storeId** (string) - Required - The ID of the store to mark as imported.
- **imported** (boolean) - Required - The status to set for the store.

### Request Example
```json
{
  "storeId": "store-abc",
  "imported": true
}
```

### Response
#### Success Response (200)
- **ok** (boolean) - Indicates if the store update was successful.

#### Response Example
```json
{
  "ok": true
}
```

### Error Handling
- **NonRetriableError**: Thrown when the store is not found or an issue occurs during the update, preventing retries. Includes an optional `cause` parameter for the original error.
```

--------------------------------

TITLE: Transform Resend Events for Inngest
DESCRIPTION: This JavaScript function transforms incoming Resend webhook events into a format compatible with Inngest. It prefixes event names with 'resend/' and passes the event data. This is essential for correctly routing and processing Resend events within the Inngest platform.

SOURCE: https://www.inngest.com/docs/guides/resend-webhook-events

LANGUAGE: javascript
CODE:
```
function transform(evt, headers = {}, queryParams = {}) {
  return {
    // Add a prefix to the name of the event
    name: `resend/${evt.type}`,
    data: evt.data,
   };
}
```

--------------------------------

TITLE: Install Inngest SDK
DESCRIPTION: Command to install the Inngest SDK for JavaScript/TypeScript. This package provides the necessary tools to integrate Inngest functionalities into your application.

SOURCE: https://www.inngest.com/docs/getting-started/nextjs-quick-start

LANGUAGE: bash
CODE:
```
npm install inngest

```

--------------------------------

TITLE: RetryAfterError
DESCRIPTION: Use RetryAfterError to specify a custom delay before the next retry attempt for a function or step, useful for rate limiting or race conditions.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/errors

LANGUAGE: APIDOC
CODE:
```
## POST /functions/send-welcome-sms

### Description
Sends a welcome SMS to a user. If rate limits are hit or an error occurs that requires a delay, RetryAfterError is used.

### Method
POST

### Endpoint
/functions/send-welcome-sms

### Parameters
#### Request Body
- **user.phoneNumber** (string) - Required - The phone number of the user.

### Request Example
```json
{
  "user": {
    "phoneNumber": "+15551234567"
  }
}
```

### Response
#### Success Response (200)
- **success** (boolean) - Indicates if the SMS was sent successfully.
- **retryAfter** (number | string | date) - The delay before the next retry, if applicable.

#### Response Example
```json
{
  "success": true,
  "retryAfter": null
}
```

### Error Handling
- **RetryAfterError**: Thrown when an API rate limit is hit or a specific delay is needed before retrying. Requires a `message` and `retryAfter` parameter (milliseconds, time string, or Date object). Includes an optional `cause` parameter for the original error.
```

--------------------------------

TITLE: Run Pydantic Models with output_type - Python
DESCRIPTION: Demonstrates using Pydantic models as the return type for step functions. Requires setting the client serializer to PydanticSerializer and specifying the output_type in ctx.step.run. Handles runtime JSON deserialization back to the correct Python type.

SOURCE: https://www.inngest.com/docs/reference/python/guides/pydantic

LANGUAGE: python
CODE:
```
client = inngest.Inngest(
    app_id="my-app",

    # Must set the client serializer when using Pydantic output
    serializer=inngest.PydanticSerializer(),
)

class User(pydantic.BaseModel):
    name: str

async def get_user() -> User:
    return User(name="Alice")

@client.create_function(
    fn_id="my-fn",
    trigger=inngest.TriggerEvent(event="my-event"),
)
async def my_fn(ctx: inngest.Context) -> None:
    # user object is a Pydantic object at both runtime and compile time
    user = await ctx.step.run("get-user", get_user, output_type=User)

```

--------------------------------

TITLE: Next.js: Setup Inngest API Endpoint (App Router)
DESCRIPTION: Sets up the Inngest API route for Next.js applications using the App Router. This configuration allows Inngest to handle incoming requests for your serverless functions.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import fnA from "../../../inngest/fnA"; // Your own functions

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [fnA],
});

```

--------------------------------

TITLE: waitForEvent
DESCRIPTION: Pauses the execution of an Inngest function until a specified event is received or a timeout occurs. It supports matching events based on specific fields or conditional expressions.

SOURCE: https://www.inngest.com/docs/reference/functions/step-wait-for-event

LANGUAGE: APIDOC
CODE:
```
## POST /functions/waitForEvent

### Description
Waits for a specific event to occur, allowing your function to pause execution and resume when the event is received or a timeout is reached.

### Method
POST

### Endpoint
/functions/waitForEvent

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **id** (string) - Required - The ID of the step, used for memoization.
- **options** (object) - Required - Configuration for waiting for the event.
  - **event** (string) - Required - The name of the event to wait for.
  - **timeout** (string) - Required - The duration to wait for the event (e.g., "30m", "2.5d").
  - **match** (string) - Optional - The property to match between the trigger and wait event (dot-notation, e.g., "data.userId"). Cannot be used with `if`.
  - **if** (string) - Optional - A CEL expression to conditionally match events (e.g., "event.data.userId == async.data.userId"). Cannot be used with `match`.

### Request Example
```json
{
  "id": "wait-for-approval",
  "options": {
    "event": "app/invoice.approved",
    "timeout": "7d",
    "match": "data.invoiceId"
  }
}
```

### Response
#### Success Response (200)
- **eventPayload** (object | null) - The payload of the event received, or null if the timeout occurred.

#### Response Example
```json
{
  "eventPayload": {
    "data": {
      "invoiceId": "inv_12345"
    }
  }
}
```
```

--------------------------------

TITLE: Pause Execution Until a Given Date using step.sleepUntil
DESCRIPTION: Pauses the execution of an Inngest function until a specific date and time. It takes a Date object as an argument, allowing for precise scheduling of events, such as sending a reminder on a user-defined date.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "send-scheduled-reminder" },
  { event: "app/reminder.scheduled" },
  async ({ event, step }) => {
    const date = new Date(event.data.remind_at);
    await step.sleepUntil("wait-for-scheduled-reminder", date);
    // Do something else
  }
);
```

--------------------------------

TITLE: step.sleep()
DESCRIPTION: Describes the `step.sleep()` method, which pauses execution for a specified duration. It clarifies that Inngest handles the scheduling without consuming compute time and that functions can sleep for up to a year (seven days on free tier plans).

SOURCE: https://www.inngest.com/docs/learn/inngest-steps

LANGUAGE: APIDOC
CODE:
```
## step.sleep()

This method pauses execution for a specified duration. Even though it seems like a `setInterval`, your function does not run for that time (you don't use any compute). Inngest handles the scheduling for you. Use it to add delays or to wait for a specific amount of time before proceeding. At maximum, functions can sleep for a year (seven days for the free tier plans).

```typescript
export default inngest.createFunction(
  { id: "send-delayed-email" },
  { event: "app/user.signup" },
  async ({ event, step }) => {
    await step.sleep("wait-a-couple-of-days", "2d");
    // Do something else
  }
);
```
```

--------------------------------

TITLE: Bulk Cancellation API Response Example
DESCRIPTION: This JSON object represents a successful response from the Inngest Bulk Cancellation API. It includes the unique ID of the cancellation job, the environment ID, the function ID targeted, and the parameters used for the cancellation request.

SOURCE: https://www.inngest.com/docs/guides/cancel-running-functions

LANGUAGE: json
CODE:
```
{
  "id": "01HMRMPE5ZQ4AMNJ3S2N79QGRZ",
  "environment_id": "e03843e1-d2df-419e-9b7b-678b03f7398f",
  "function_id": "schedule-reminder",
  "started_after": "2024-01-21T18:23:12.000Z",
  "started_before": "2024-01-22T14:22:42.130Z",
  "if": "event.data.userId == 'user_o9235hf84hf'"
}
```

--------------------------------

TITLE: Send welcome email for new Clerk user
DESCRIPTION: This function also listens for the 'clerk/user.created' event. It extracts the user's email and first name to send a personalized welcome email.

SOURCE: https://www.inngest.com/docs/guides/clerk-webhook-events

LANGUAGE: typescript
CODE:
```
const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    const { user } = event.data;
    const { first_name } = user;
    const email = user.email_addresses.find(e =>
      e.id === user.primary_email_address_id
    ).email;
    await emails.sendWelcomeEmail({ email, first_name });
  }
)

```

--------------------------------

TITLE: Advanced netlify.toml Configuration (Custom Host/Path)
DESCRIPTION: Provides advanced configuration for netlify.toml to specify a custom host or path for Inngest function syncing.

SOURCE: https://www.inngest.com/docs/deploy/netlify

LANGUAGE: toml
CODE:
```
[[plugins]]
package = "netlify-plugin-inngest"

  [plugins.inputs]
    host = "https://my-specific-domain.com"
    path = "/api/inngest"
```

--------------------------------

TITLE: Debounce by Customer ID using CEL
DESCRIPTION: Configure debouncing for Inngest functions by specifying a unique key expression using the Common Expression Language (CEL). This example debounces events based on the customer ID found in the event data.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "debounce": {
    "key": "'event.data.customer_id'"
  }
}
```

--------------------------------

TITLE: Send Email with Resend in TypeScript
DESCRIPTION: A helper function to send emails using the Resend service. It requires the Resend API key to be set as an environment variable.

SOURCE: https://www.inngest.com/docs/guides/resend-webhook-events

LANGUAGE: typescript
CODE:
```
// resend.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  content: React.ReactElement
) {
  const { data, error } = await resend.emails.send({
    from: 'Acme <noreply@acme.dev>',
    to: [to],
    subject,
    react: content
  });

  if (error) {
    throw error;
  }
	return data;
};

```

--------------------------------

TITLE: TypeScript: Wait for a Specific Event with Timeout
DESCRIPTION: Pauses a function's execution until a specified event is received, with an optional timeout. It returns the received event or null if the timeout is reached. The `match` parameter ensures the correct event is correlated.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "send-onboarding-nudge-email" },
  { event: "app/account.created" },
  async ({ event, step }) => {
    const onboardingCompleted = await step.waitForEvent(
      "wait-for-onboarding-completion",
      { event: "app/onboarding.completed", timeout: "3d", match: "data.userId" }
    );
    if (!onboardingCompleted) {
      // if no event is received within 3 days, onboardingCompleted will be null
    } else {
      // if the event is received, onboardingCompleted will be the event payload object
    }
  }
);

```

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "onboarding-email-drip-campaign" },
  { event: "app/account.created" },
  async ({ event, step }) => {
    // Send the user the welcome email immediately
    await step.run("send-welcome-email", async () => {
      await sendEmail(event.user.email, "welcome");
    });

    // Wait up to 3 days for the user to complete the final onboarding step
    // If the event is received within these 3 days, onboardingCompleted will be the
    // event payload itself, if not it will be null
    const onboardingCompleted = await step.waitForEvent("wait-for-onboarding", {
      event: "app/onboarding.completed",
      timeout: "3d",
      // The "data.userId" must match in both the "app/account.created" and
      // the "app/onboarding.completed" events
      match: "data.userId",
    });

    // If the user has not completed onboarding within 3 days, send them a nudge email
    if (!onboardingCompleted) {
      await step.run("send-onboarding-nudge-email", async () => {
        await sendEmail(event.user.email, "onboarding_nudge");
      });
    } else {
      // If they have completed onboarding, send them a tips email
      await step.run("send-tips-email", async () => {
        await sendEmail(event.user.email, "new_user_tips");
      });
    }
  }
);

```

--------------------------------

TITLE: Standard Errors
DESCRIPTION: Inngest automatically handles and retries all standard `Error` objects, including built-in errors like `TypeError` and custom errors that extend the `Error` class. You can throw these errors directly within your function handler or within a step.

SOURCE: https://www.inngest.com/docs/functions/retries

LANGUAGE: APIDOC
CODE:
```
## POST /api/functions/import-item-data

### Description
This function handler processes the `store/import.requested` event. It demonstrates throwing a standard `Error` if `event.itemId` is missing and how to throw an error within an Inngest step when fetching item data.

### Method
POST

### Endpoint
`/api/functions/import-item-data`

### Parameters
#### Event Payload
- **itemId** (string) - Required - The ID of the item to import.

### Request Example
```json
{
  "name": "store/import.requested",
  "data": {
    "itemId": "12345"
  }
}
```

### Response
#### Success Response (200)
Returns `true` if the item data is processed successfully, or throws an error.

#### Response Example
```json
true
```
```

--------------------------------

TITLE: Call OpenAI with step.ai.infer() in TypeScript
DESCRIPTION: This example demonstrates how to use `step.ai.infer()` to call the OpenAI API for summarization. It offloads the inference request to Inngest's infrastructure, providing AI observability, metrics, and monitoring. The function is triggered by the 'app/ticket.created' event.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "summarize-contents" },
  { event: "app/ticket.created" },
  async ({ event, step }) => {

    // This calls your model's chat endpoint, adding AI observability,
    // metrics, datasets, and monitoring to your calls.
    const response = await step.ai.infer("call-openai", {
      model: step.ai.models.openai({ model: "gpt-4o" }),
      // body is the model request, which is strongly typed depending on the model
      body: {
        messages: [{
          role: "assistant",
          content: "Write instructions for improving short term memory",
        }],
      },
    });

    // The response is also strongly typed depending on the model.
    return response.choices;
  }
);

```

--------------------------------

TITLE: Preventing Retries with NonRetriableError
DESCRIPTION: Throwing a `NonRetriableError` will immediately stop any further retries for a step or function. This is useful for handling permanent errors where continuing execution is futile.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/retries

LANGUAGE: typescript
CODE:
```
import { NonRetriableError } from "inngest";

inngest.createFunction(
  { id: "user-weekly-digest" },
  { event: "user/weekly.digest.requested" },
  async ({ event, step }) => {
    const user = await step
      .run("get-user-email", () => {
        return db.users.findOne(event.data.userId);
      })
      .catch((err) => {
        if (err.name === "UserNotFoundError") {
          throw new NonRetriableError("User no longer exists; stopping");
        }

        throw err;
      });

    await step.run("send-digest", () => {
      return sendDigest(user.email);
    });
  },
);

```

--------------------------------

TITLE: Transform Clerk webhook events to Inngest format
DESCRIPTION: A JavaScript function to transform a Clerk webhook payload into the Inngest event format. It maps the event type to the event name and uses the payload's data field.

SOURCE: https://www.inngest.com/docs/platform/webhooks

LANGUAGE: javascript
CODE:
```
function transform(evt, headers = {}, queryParams = {}) {
  return {
    name: `clerk/${evt.type}`,
    data: evt.data,
    // You can optionally set ts using data from the raw json payload
    // to explicitly set the timestamp of the incoming event.
    // If ts is not set, it will be automatically set to the time the request is received.
  }
}

```

--------------------------------

TITLE: Wait for Event Step
DESCRIPTION: This section details the `wait_for_event` step, which allows your Inngest function to pause and wait for a specific event to be received. It includes parameters for event name, conditional matching, and timeouts.

SOURCE: https://www.inngest.com/docs/reference/python/steps/wait-for-event

LANGUAGE: APIDOC
CODE:
```
## Wait for Event

### Description
Wait until the Inngest server receives a specific event. If an event is received before the timeout then the event is returned. If the timeout is reached then `None` is returned.

### Method
N/A (This is a step within a function, not a direct API endpoint)

### Endpoint
N/A

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
This describes the arguments for the `wait_for_event` step:

- **step_id** (str) - required - Step ID. Should be unique within the function.
- **event** (str) - required - Name of the event to wait for.
- **if_exp** (str | None) - optional - Only match events that match this CEL expression. For example, `"event.data.height == async.data.height"` will only match incoming events whose `data.height` matches the `data.height` value for the trigger event.
- **timeout** (int | datetime.timedelta) - required - In milliseconds.

### Request Example
```python
await ctx.step.wait_for_event(
    "wait",
    event="app/wait_for_event.fulfill",
    timeout=datetime.timedelta(seconds=2),
)
```

### Response
#### Success Response (200)
Returns the received event if matched before timeout, otherwise returns None.

#### Response Example
```json
{
  "example": "event_data"
}
```
```json
{
  "example": null
}
```
```

--------------------------------

TITLE: Express.js Server Setup with Inngest
DESCRIPTION: Sets up an Express.js server to serve Inngest functions and includes an API route for sending events to Inngest. Requires 'express' and 'inngest' packages. The server listens on port 3000.

SOURCE: https://www.inngest.com/docs/getting-started/nodejs-quick-start

LANGUAGE: typescript
CODE:
```
import express from "express";
import { serve } from "inngest/express";
import { inngest, functions } from "./src/inngest"

const app = express();

app.use(express.json());
app.use("/api/inngest", serve({ client: inngest, functions }));

// Create a new route
app.get("/api/hello", async function (req, res, next) {
  await inngest.send({
    name: "test/hello.world",
    data: {
      email: "testUser@example.com",
    },
  }).catch(err => next(err));
  res.json({ message: 'Event sent!' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

```

--------------------------------

TITLE: Bind Fetch for Inngest SDK
DESCRIPTION: Resolves 'Illegal invocation' errors by ensuring the custom fetch function is correctly bound to its context, typically `globalThis`, when initializing the Inngest SDK.

SOURCE: https://www.inngest.com/docs/faq

LANGUAGE: typescript
CODE:
```
new Inngest({
  fetch: fetch.bind(globalThis),
});
```

--------------------------------

TITLE: Inngest Client and Serve Configuration (v3)
DESCRIPTION: Demonstrates the updated configuration options for creating an Inngest client and serving Inngest functions in v3. It highlights the addition of `baseUrl` and the removal of `inngestBaseUrl` and `landingPage`.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: javascript
CODE:
```
new Inngest({
  // Added: baseUrl - Sets the URL to communicate with Inngest
  baseUrl: "http://localhost:8288"
});
```

LANGUAGE: javascript
CODE:
```
serve({
  // Added: baseUrl - Sets the URL to communicate with Inngest
  baseUrl: "http://localhost:8288"
});
```

--------------------------------

TITLE: Install Inngest ESLint Plugin
DESCRIPTION: Installs the Inngest ESLint plugin as a development dependency using npm. This is the first step to enabling linting for Inngest functions.

SOURCE: https://www.inngest.com/docs/sdk/eslint

LANGUAGE: bash
CODE:
```
npm install -D @inngest/eslint-plugin
```

--------------------------------

TITLE: Send a Single Event (TypeScript)
DESCRIPTION: Send a single event to Inngest using the `send` method of the initialized client. The event must include a `name` and `data` property. Use `await` to ensure the event is sent before the function exits.

SOURCE: https://www.inngest.com/docs/events

LANGUAGE: typescript
CODE:
```
import { inngest } from "../inngest/client";

// This sends an event to Inngest.
await inngest.send({
  // The event name
  name: "storefront/cart.checkout.completed",
  // The event's data
  data: {
    cartId: "ed12c8bde",
    itemIds: ["9f08sdh84", "sdf098487", "0fnun498n"],
    account: {
      id: 123,
      email: "test@example.com",
    },
  },
});
```

--------------------------------

TITLE: Connect to Inngest and Log Connection State (TypeScript)
DESCRIPTION: Establishes a connection to Inngest and logs the connection state. The `connect` function returns a promise that resolves when the connection is active. This snippet demonstrates basic connection establishment.

SOURCE: https://www.inngest.com/docs/setup/connect

LANGUAGE: typescript
CODE:
```
const connection = await connect({
  apps: [...],
})
console.log(`The worker connection is: ${connection.state}`)
// The worker connection is: ACTIVE
```

--------------------------------

TITLE: Create Inngest Directory
DESCRIPTION: This command creates a new directory named 'inngest' in the project's root directory, which is used to store Inngest function files.

SOURCE: https://www.inngest.com/docs/guides/trigger-your-code-from-retool

LANGUAGE: bash
CODE:
```
mkdir -p inngest
```

--------------------------------

TITLE: Create Signup Drip Campaign with Inngest
DESCRIPTION: Demonstrates creating an email drip campaign triggered by a user signup event. It includes sending a welcome email, waiting for user engagement (email click), sending follow-up emails with tips, and offering a trial based on user plan status. It utilizes Inngest's step function for managing asynchronous tasks and delays.

SOURCE: https://www.inngest.com/docs/examples/email-sequence

LANGUAGE: javascript
CODE:
```
const signupDripCampaign = inngest.createFunction(
  { id: "signup-drip-campaign" },
  { event: "app/signup.completed" },
  async ({ event, step }) => {
    const { user } = event.data;
    const { email, first_name } = user
    const welcome = "Welcome to ACME";

    const { id: emailId } = await step.run("welcome-email", async () => {
      return await sendEmail(
        email,
        welcome,
        <div>
          <h1>Welcome to ACME, {user.firstName}</h1>
        </div>
      );
    });

    // Wait up to 3 days for the user open the email and click any link in it
    const clickEvent = await step.waitForEvent("wait-for-engagement", {
      event: "resend/email.clicked",
      if: `async.data.email_id == ${emailId}`,
      timeout: "3 days",
    });

    // if the user clicked the email, send them power user tips
    if (clickEvent) {
      await step.sleep("delay-power-tips-email", "1 day");
      await step.run("send-power-user-tips", async () => {
        await sendEmail(
          email,
          "Supercharge your ACME experience",
          <h1>
            Hello {firstName}, here are tips to get the most out of ACME
          </h1>
        );
      });

      // wait one more day before sending the trial offer
      await step.sleep("delay-trial-email", "1 day");
    }

    // check that the user is not already on the pro plan
    const dbUser = db.users.byEmail(email);

    if (dbUser.plan !== "pro") {
      // send them a free trial offer
      await step.run("trial-offer-email", async () => {
        await sendEmail(
          email,
          "Free ACME Pro trial",
          <h1>
            Hello {firstName}, try our Pro features for 30 days for free
          </h1>
        );
      });
    }
  }
);

```

--------------------------------

TITLE: Initialize Inngest Client (Python)
DESCRIPTION: Demonstrates how to initialize the Inngest client with a required application ID. This client is used for configuring your application and sending events outside of Inngest functions.

SOURCE: https://www.inngest.com/docs/reference/python/client/overview

LANGUAGE: python
CODE:
```
import inngest

inngest_client = inngest.Inngest(
    app_id="flask_example",
)
```

--------------------------------

TITLE: Limit Email Notifications with Rate Limiting (TypeScript Example)
DESCRIPTION: Illustrates how to limit sending email notifications to prevent spamming users. This Inngest function is configured to send at most one email per hour for a given user and service ID combination when a 'service/check.failed' event occurs.

SOURCE: https://www.inngest.com/docs/reference/functions/rate-limit

LANGUAGE: typescript
CODE:
```
/** Example event payload:
{
  name: "service/check.failed",
  data: {
    incident_id: "01HB9PWHZ4CZJYRAGEY60XEHCZ",
    issue: "HTTP uptime check failed at 2023-09-26T21:23:51.515631317Z",
    user_id: "user_aW5uZ2VzdF9pc19mdWNraW5nX2F3ZXNvbWU=",
    service_name: "api",
    service_id: "01HB9Q2EFBYG2B7X8VCD6JVRFH"
  },
  user: {
    external_id: "user_aW5uZ2VzdF9pc19mdWNraW5nX2F3ZXNvbWU=",
    email: "user@example.com"
  }
}
*/
export default inngest.createFunction(
  {
    id: "send-check-failed-notification",
    rateLimit: {
      // Don't send duplicate emails to the same user for the same service over 1 hour
      key: `event.data.user_id + "-" + event.data.service_id`,
      limit: 1,
      period: "1h",
    },
  },
  { event: "service/check.failed" },
  async ({ event, step }) => {
    await step.run("send-alert-email", async () => {
      return await resend.emails.send({
        from: "notifications@myco.com",
        to: event.user.email,
        subject: `ALERT: ${event.data.issue}`,
        text: "Dear user, ...",
      });
    });
  }
);
```

--------------------------------

TITLE: Set Event ID for Producer-Side Idempotency (TypeScript)
DESCRIPTION: This TypeScript example demonstrates how to set a unique `id` for an event when sending it to Inngest. This `id` acts as an idempotency key for 24 hours, preventing duplicate function triggers for the same event.

SOURCE: https://www.inngest.com/docs/guides/handling-idempotency

LANGUAGE: typescript
CODE:
```
const cartId = 'CGo5Q5ekAxilN92d27asEoDO';
await inngest.send({
  id: `checkout-completed-${cartId}`,
  name: 'cart/checkout.completed',
  data: {
    email: 'taylor@example.com',
    cartId: cartId
  }
})
```

--------------------------------

TITLE: Integrate Inngest with FastAPI
DESCRIPTION: Adds Inngest to a FastAPI app by creating an Inngest client, defining an Inngest function, and serving the Inngest endpoint. Logs events using the provided logger.

SOURCE: https://www.inngest.com/docs/reference/python/overview/quick-start

LANGUAGE: python
CODE:
```
import logging
from fastapi import FastAPI
import inngest
import inngest.fast_api

# Create an Inngest client
inngest_client = inngest.Inngest(
    app_id="fast_api_example",
    logger=logging.getLogger("uvicorn"),
)

# Create an Inngest function
@inngest_client.create_function(
    fn_id="my_function",
    # Event that triggers this function
    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def my_function(ctx: inngest.Context) -> str:
    ctx.logger.info(ctx.event)
    return "done"

app = FastAPI()

# Serve the Inngest endpoint
inngest.fast_api.serve(app, inngest_client, [my_function])
```

--------------------------------

TITLE: Install and Configure Sentry Middleware in TypeScript
DESCRIPTION: This snippet shows how to install the Sentry middleware package and configure it with Inngest. It demonstrates importing necessary modules from Sentry and Inngest, initializing Sentry, and then initializing Inngest with the Sentry middleware. This setup is essential for integrating Sentry's error tracking and tracing capabilities into your Inngest functions.

SOURCE: https://www.inngest.com/docs/features/middleware/sentry-middleware

LANGUAGE: typescript
CODE:
```
import * as Sentry from "@sentry/node";
import { Inngest } from "inngest";
import { sentryMiddleware } from "@inngest/middleware-sentry";

// Initialize Sentry as usual wherever is appropriate
Sentry.init(...);

const inngest = new Inngest({
  id: "my-app",
  middleware: [sentryMiddleware()],
});

```

--------------------------------

TITLE: Run Inngest Dev Server
DESCRIPTION: Command to start the Inngest CLI development server. This server provides a local, in-memory environment for testing Inngest functions and events.

SOURCE: https://www.inngest.com/docs/getting-started/nextjs-quick-start

LANGUAGE: bash
CODE:
```
npx inngest-cli@latest dev

```

--------------------------------

TITLE: Set Cancellation Timeout
DESCRIPTION: Specify the maximum time to wait for a cancelling event before the Inngest function is considered uncancelable. This example sets a timeout of 2 hours.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "cancelOn": [
    {
      "event": "some.event",
      "timeout": "2 hours"
    }
  ]
}
```

--------------------------------

TITLE: Pause Execution for a Given Time using step.sleep
DESCRIPTION: Pauses the execution of an Inngest function for a specified duration, accepting a string representing time (e.g., '2d' for two days). This method is useful for delaying actions within a workflow, such as sending a follow-up email after a user signs up.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "send-delayed-email" },
  { event: "app/user.signup" },
  async ({ event, step }) => {
    await step.sleep("wait-a-couple-of-days", "2d");
    // Do something else
  }
);
```

--------------------------------

TITLE: Connect to Inngest with TypeScript
DESCRIPTION: Example demonstrating how to establish a persistent connection to Inngest using the TypeScript SDK. It sets up an Inngest client and defines a function to handle 'user.created' events, then initiates the connection.

SOURCE: https://www.inngest.com/docs/setup/connect

LANGUAGE: typescript
CODE:
```
import { Inngest } from 'inngest'
import { connect } from 'inngest/connect';
import { ConnectionState } from 'inngest/components/connect/types';

const inngest = new Inngest({
  id: 'my-app'
});

const handleSignupFunction = inngest.createFunction(
  { id: 'handle-signup' },
  { event: 'user.created'}
  async ({ event, step }) => {
    console.log('Function called', event);
  }
);

(async () => {
  const connection = await connect({
    apps: [{ client: inngest, functions: [handleSignupFunction] }]
  });

  console.log('Worker: connected', connection);
})();

```

--------------------------------

TITLE: Test Inngest Endpoint via Curl (Bash)
DESCRIPTION: Sends a GET request to the deployed Inngest endpoint using `curl` to verify the deployment and Inngest integration. It checks the Inngest function count and authentication status.

SOURCE: https://www.inngest.com/docs/reference/python/guides/modal

LANGUAGE: bash
CODE:
```
$ curl https://test-fast-api-fastapi-app.modal.run/api/inngest

```

--------------------------------

TITLE: Prevent Retries with NonRetriableError in Inngest (TypeScript)
DESCRIPTION: Shows how to use `NonRetriableError` to prevent Inngest from retrying a function or step. This is ideal for errors caused by invalid input or situations where retries won't resolve the issue. It accepts an optional `cause` property to include the original error.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/errors

LANGUAGE: typescript
CODE:
```
import { NonRetriableError } from "inngest";

export default inngest.createFunction(
  { id: "mark-store-imported" },
  { event: "store/import.completed" },
  async ({ event }) => {
    try {
      const result = await database.updateStore(
        { id: event.data.storeId },
        { imported: true }
      );
      return result.ok === true;
    } catch (err) {
      // Passing the original error via `cause` enables you to view the error in function logs
      throw new NonRetriableError("Store not found", { cause: err });
    }
  }
);

```

--------------------------------

TITLE: Create Custom Logger Middleware for Inngest
DESCRIPTION: This snippet shows how to create a custom logger middleware for Inngest. It leverages the built-in logger middleware and allows for customization, including the creation of child loggers with metadata. It provides a ProxyLogger for enhanced logging capabilities within Inngest functions.

SOURCE: https://www.inngest.com/docs/reference/middleware/examples

LANGUAGE: typescript
CODE:
```
new InngestMiddleware({
  name: "Inngest: Logger",
  init({ client }) {
    return {
      onFunctionRun(arg) {
        const { ctx } = arg;
        const metadata = {
          runID: ctx.runId,
          eventName: ctx.event.name,
          functionName: arg.fn.name,
        };

        let providedLogger: Logger = client["logger"];
        // create a child logger if the provided logger has child logger implementation
        try {
          if ("child" in providedLogger) {
            type ChildLoggerFn = (
              metadata: Record<string, unknown>
            ) => Logger;
            providedLogger = (providedLogger.child as ChildLoggerFn)(metadata)
          }
        } catch (err) {
          console.error('failed to create "childLogger" with error: ', err);
          // no-op
        }
        const logger = new ProxyLogger(providedLogger);

        return {
          transformInput() {
            return {
              ctx: {
                /**
                 * The passed in logger from the user.
                 * Defaults to a console logger if not provided.
                 */
                logger,
              },
            };
          },
          beforeExecution() {
            logger.enable();
          },
          transformOutput({ result: { error } }) {
            if (error) {
              logger.error(error);
            }
          },
          async beforeResponse() {
            await logger.flush();
          },
        };
      },
    };
  },
})
```

--------------------------------

TITLE: Control Retry Timing with RetryAfterError in Inngest (TypeScript)
DESCRIPTION: Illustrates using `RetryAfterError` to specify a delay before the next retry attempt for a function or step. This is useful for handling rate limits or race conditions. The `retryAfter` parameter accepts milliseconds, a time string, or a Date object. It also supports an optional `cause` property.

SOURCE: https://www.inngest.com/docs/reference/typescript/functions/errors

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "send-welcome-sms" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const { success, retryAfter } = await twilio.messages.create({
      to: event.data.user.phoneNumber,
      body: "Welcome to our service!",
    });

    if (!success && retryAfter) {
      throw new RetryAfterError("Hit Twilio rate limit", retryAfter);
    }
  }
);

```

--------------------------------

TITLE: Preventing Retries with NonRetriableError
DESCRIPTION: Utilize `NonRetriableError` to immediately stop Inngest from retrying a function or step, suitable for non-recoverable errors like invalid input.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors

LANGUAGE: APIDOC
CODE:
```
## POST /api/inngest/non_retriable

### Description
This example demonstrates how to use `NonRetriableError` to prevent Inngest from retrying when a critical, non-recoverable error occurs, such as a store not being found.

### Method
POST

### Endpoint
/api/inngest/non_retriable

### Parameters

#### Request Body
- **event** (object) - Required - The Inngest event data, expected to have a `data.storeId` property.

### Request Example
```json
{
  "eventId": "evt_67890",
  "data": {
    "storeId": "store_xyz"
  }
}
```

### Response
#### Success Response (200)
- **result** (boolean) - Indicates if the operation was successful.

#### Response Example
```json
{
  "result": true
}
```

### Error Handling Example
```javascript
import { NonRetriableError, inngest } from 'inngest';

export default inngest.createFunction(
  { id: "mark-store-imported" },
  { event: "store/import.completed" },
  async ({ event }) => {
    try {
      const result = await database.updateStore(
        { id: event.data.storeId },
        { imported: true }
      );
      return result.ok === true;
    } catch (err) {
      // Passing the original error via `cause` enables you to view the error in function logs
      throw new NonRetriableError("Store not found", { cause: err });
    }
  }
);
```

### Parameters
#### Constructor for `NonRetriableError`
```javascript
new NonRetriableError(message: string, options?: { cause?: Error }): NonRetriableError
```
- **message** (string) - Required - The error message.
- **options** (object) - Optional - Configuration options.
  - **cause** (Error) - Optional - The original error that caused this `NonRetriableError`.
```

--------------------------------

TITLE: TypeScript: Inngest Dependency Injection Middleware
DESCRIPTION: Demonstrates how to set up the dependency injection middleware in Inngest using TypeScript. This allows you to inject dependencies like an OpenAI client into your Inngest functions.

SOURCE: https://www.inngest.com/docs/features/middleware/dependency-injection_guide=typescript

LANGUAGE: typescript
CODE:
```
import { dependencyInjectionMiddleware } from "inngest";
import OpenAI from 'openai';

const openai = new OpenAI();

const inngest = new Inngest({
  id: 'my-app',
  middleware: [
    dependencyInjectionMiddleware({ openai }),
  ],
});
```

--------------------------------

TITLE: Handle Resend Bounce Event with TypeScript
DESCRIPTION: This function handles a 'resend/email.bounced' event, marking the user's email as invalid in the database. It depends on a local database module.

SOURCE: https://www.inngest.com/docs/guides/resend-webhook-events

LANGUAGE: typescript
CODE:
```
import db from "./database";

const invalidateUserEmail = inngest.createFunction(
  { id: 'invalidate-user-email' },
  { event: 'resend/email.bounced' },
  async ({ event }) => {
    const email = event.data.to[0];
    const user = await db.users.byEmail(email);
    if (user) {
      user.email_status = "invalid";
      await db.users.update(user);
    }
  }
)
```

--------------------------------

TITLE: Send Delayed Onboarding Emails with TypeScript
DESCRIPTION: This function sends a welcome email and then, after a three-day delay using `step.sleep`, sends a follow-up email offering a free trial. It uses `step.run` to isolate email sending logic.

SOURCE: https://www.inngest.com/docs/guides/resend-webhook-events

LANGUAGE: typescript
CODE:
```
const sendOnboardingEmails = inngest.createFunction(
  { id: 'onboarding-emails' },
  { event: 'app/signup.completed' },
  async ({ event, step }) => { // ← step is available in the handler's arguments
    const { user } = event.data
	  const { email, first_name } = user

    await step.run('welcome-email', async () => {
      await sendEmail(email, "Welcome to ACME", (
        <div>
          <h1>Welcome to ACME, {firstName}</h1>
        </div>
      ));
    })

   // wait 3 days before second email
   await step.sleep('wait-3-days', '3 days')

   await step.run('trial-offer-email', async () => {
     await sendEmail(email, "Free ACME Pro trial", (
        <div>
          <h1>Hello {firstName}, try our Pro features for 30 days for free</h1>
        </div>
      ));
    })
  }
)
```

--------------------------------

TITLE: Prevent Retries with NonRetriableError
DESCRIPTION: Use `NonRetriableError` to instruct Inngest to stop retrying a function or step. This is ideal for errors caused by invalid input or predictable recurring issues.

SOURCE: https://www.inngest.com/docs/functions/retries

LANGUAGE: APIDOC
CODE:
```
## POST /api/functions/mark-store-imported

### Description
This function marks a store as imported after a successful operation. It uses `NonRetriableError` to prevent retries if the store is not found, optionally including the original error for debugging.

### Method
POST

### Endpoint
`/api/functions/mark-store-imported`

### Parameters
#### Path Parameters
- **message** (string) - Required - The error message.
- **options** (object) - Optional - An options object.
  - **cause** (Error) - Optional - The original error that triggered this `NonRetriableError`.

#### Event Payload
- **data.storeId** (string) - Required - The ID of the store to mark as imported.

### Request Example
```json
{
  "name": "store/import.completed",
  "data": {
    "storeId": "store-abc"
  }
}
```

### Response
#### Success Response (200)
Returns `true` if the store was successfully updated, otherwise throws a `NonRetriableError`.

#### Response Example
```json
true
```
```

--------------------------------

TITLE: Serialization of step.run() Return Values
DESCRIPTION: Explains that all data returned from `step.run()` is serialized into JSON. This is a necessary process for the SDK to communicate successfully with the Inngest service, ensuring data integrity across the platform. The example shows a returned object with an ObjectId and a Date, and its JSON representation.

SOURCE: https://www.inngest.com/docs/reference/functions/step-run

LANGUAGE: typescript
CODE:
```
const output = await step.run("create-user", () => {
  return { id: new ObjectId(), createdAt: new Date() };
});
/*
{
  "id": "647731d1759aa55be43b975d",
  "createdAt": "2023-05-31T11:39:18.097Z"
}
*/
```

--------------------------------

TITLE: Configure Inngest Client with Branch Environment (TypeScript)
DESCRIPTION: Demonstrates how to initialize the Inngest client, dynamically setting the environment using the 'env' option based on a process environment variable. This is useful for routing events and functions to the correct Inngest environment, especially in CI/CD or platform-specific deployments.

SOURCE: https://www.inngest.com/docs/platform/environments

LANGUAGE: typescript
CODE:
```
const inngest = new Inngest({
  id: "my-app",
  env: process.env.BRANCH,
});
// Alternatively, you can set the INNGEST_ENV environment variable in your app

// Pass the client to the serve handler to complete the setup
serve({ client: inngest, functions: [myFirstFunction, mySecondFunction] });

```

--------------------------------

TITLE: Execute Parallel Steps with ctx.group.parallel() in Python (Async)
DESCRIPTION: Shows how to run Inngest steps in parallel within an asynchronous Python function using `ctx.group.parallel()`. This method allows grouping multiple step executions that will run concurrently. It's designed for scenarios where you need to perform several independent operations efficiently.

SOURCE: https://www.inngest.com/docs/guides/step-parallelism

LANGUAGE: python
CODE:
```
@client.create_function(
  fn_id="my-fn",
  trigger=inngest.TriggerEvent(event="my-event"),
)
async def fn(ctx: inngest.Context) -> None:
  user_id = ctx.event.data["user_id"]

  (updated_user, sent_email) = await ctx.group.parallel(
    (
      lambda: step.run("update-user", update_user, user_id),
      lambda: step.run("send-email", send_email, user_id),
    )
  )


```

--------------------------------

TITLE: Inngest: Pause execution with waitForEvent
DESCRIPTION: Pauses the execution of an Inngest function until a specific event is received. It supports event matching, timeouts, and conditional execution based on event data. Dependencies include the Inngest SDK.

SOURCE: https://www.inngest.com/docs/learn/inngest-steps

LANGUAGE: javascript
CODE:
```
export default inngest.createFunction(
  { id: "send-onboarding-nudge-email" },
  { event: "app/account.created" },
  async ({ event, step }) => {
    const onboardingCompleted = await step.waitForEvent(
      "wait-for-onboarding-completion",
      { event: "app/onboarding.completed", timeout: "3d", if: "event.data.userId == async.data.userId" }
    );
    // Do something else
  }
);
```

--------------------------------

TITLE: Set Branch Environment for Netlify (TypeScript)
DESCRIPTION: Shows how to configure the Inngest client for platforms like Netlify that might expose branch information via a specific environment variable. This ensures Inngest functions and events are correctly associated with the corresponding branch environment.

SOURCE: https://www.inngest.com/docs/platform/environments

LANGUAGE: typescript
CODE:
```
const inngest = new Inngest({
  id: "my-app",
  env: process.env.BRANCH,
});

```

--------------------------------

TITLE: Prevent Retries with NonRetriableError in Inngest (TypeScript)
DESCRIPTION: Shows how to use `NonRetriableError` to stop Inngest from retrying a function or step. This is ideal for errors caused by invalid input or situations where retries won't resolve the issue. The `cause` option can be used to include the original error for better debugging.

SOURCE: https://www.inngest.com/docs/functions/retries

LANGUAGE: typescript
CODE:
```
import { NonRetriableError, inngest } from "inngest";

export default inngest.createFunction(
  { id: "mark-store-imported" },
  { event: "store/import.completed" },
  async ({ event }) => {
    try {
      const result = await database.updateStore(
        { id: event.data.storeId },
        { imported: true }
      );
      return result.ok === true;
    } catch (err) {
      // Passing the original error via `cause` enables you to view the error in function logs
      throw new NonRetriableError("Store not found", { cause: err });
    }
  }
);

// Parameters for NonRetriableError:
// new NonRetriableError(message: string, options?: { cause?: Error }): NonRetriableError
//   message: The error message (string, required).
//   options.cause: The original error that caused this non-retriable error (Error, optional).

```

--------------------------------

TITLE: AI Blog Post Generator with Event Matching (Inngest)
DESCRIPTION: This Inngest function generates blog post ideas using OpenAI, sends them to a user, and waits for the user to select one. It uses the 'if' condition in 'waitForEvent' to ensure the selected topic belongs to the generated batch, preventing race conditions. Dependencies include 'openai' for AI completions and 'pusher' for user communication.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "generate-blog-post-with-ai" },
  { event: "ai/post.generator.requested" },
  async ({ event, step }) => {
    // Generate a number of suggestions for topics with OpenAI
    const generatedTopics = await step.run("generate-topic-ideas", async () => {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: helpers.topicIdeaPromptWrapper(event.data.prompt),
        n: 3,
      });
      return {
        completionId: completion.data.id,
        topics: completion.data.choices,
      };
    });

    // Send the topics to the user via Websockets so they can select one
    // Also send the completion id so we can match that later
    await step.run("send-user-topics", () => {
      pusher.sendToUser(event.data.userId, "topics_generated", {
        sessionId: event.data.sessionId,
        completionId: generatedTopics.completionId,
        topics: generatedTopics.topics,
      });
    });

    // Wait up to 5 minutes for the user to select a topic
    // Ensuring the topic is from this batch of suggestions generated
    const topicSelected = await step.waitForEvent("wait-for-topic-selection", {
      event: "ai/post.topic.selected",
      timeout: "5m",
      // "async" is the "ai/post.topic.selected" event here:
      if: `async.data.completionId == "${generatedTopics.completionId}"`, 
    });

    // If the user selected a topic within 5 minutes, "topicSelected" will
    // be the event payload, otherwise it is null
    if (topicSelected) {
      // Now that we've confirmed the user selected their topic idea from
      // this batch of suggestions, let's generate a blog post
      await step.run("generate-blog-post-draft", async () => {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: helpers.blogPostPromptWrapper(topicSelected.data.prompt),
        });
        // Do something with the blog post draft like save it or something else...
        await blog.saveDraft(completion.data.choices[0]);
      });
    }
  }
);
```

--------------------------------

TITLE: Prevent Inngest Retries with NonRetriableError (TypeScript)
DESCRIPTION: Shows how to use `NonRetriableError` to stop Inngest from retrying a function or step. This is recommended for errors due to invalid input or issues unlikely to be resolved by a retry. It accepts an optional `cause` to preserve the original error details.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors

LANGUAGE: typescript
CODE:
```
import { NonRetriableError } from "inngest";

export default inngest.createFunction(
  { id: "mark-store-imported" },
  { event: "store/import.completed" },
  async ({ event }) => {
    try {
      const result = await database.updateStore(
        { id: event.data.storeId },
        { imported: true }
      );
      return result.ok === true;
    } catch (err) {
      // Passing the original error via `cause` enables you to view the error in function logs
      throw new NonRetriableError("Store not found", { cause: err });
    }
  }
);

// NonRetriableError constructor signature:
// new NonRetriableError(message: string, options?: { cause?: Error }): NonRetriableError

```

--------------------------------

TITLE: Wrap Vercel AI SDK's generateObject with Inngest and Type Casting
DESCRIPTION: Shows how to use `step.ai.wrap` with Vercel's `generateObject`, emphasizing the need for type casting due to complex TypeScript overloads. This ensures backward compatibility while allowing reruns in the dev server.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration

LANGUAGE: typescript
CODE:
```
import { generateObject as vercelGenerateObject } from "ai";
import { openai as vercelOpenAI } from "@ai-sdk/openai";

export const vercelWrapSchema = inngest.createFunction(
  { id: "vercel-wrap-generate-object" },
  { event: "vercel/wrap.generate.object" },
  async ({ event, step }) => {
    //
    // Calling generateObject directly is fine
    await vercelGenerateObject({
      model: vercelOpenAI("gpt-4o-mini"),
      schema: z.object({
        recipe: z.object({
          name: z.string(),
          ingredients: z.array(
            z.object({ name: z.string(), amount: z.string() }),
          ),
          steps: z.array(z.string()),
        }),
      }),
      prompt: "Generate a lasagna recipe.",
    });

    //
    // step.ai.wrap requires type casting
    await step.ai.wrap(
      "vercel-openai-generateObject",
      vercelGenerateObject,
      {
        model: vercelOpenAI("gpt-4o-mini"),
        schema: z.object({
          recipe: z.object({
            name: z.string(),
            ingredients: z.array(
              z.object({ name: z.string(), amount: z.string() }),
            ),
            steps: z.array(z.string()),
          }),
        }),
        prompt: "Generate a lasagna recipe.",
      } as any,
    );
  },
);

```

--------------------------------

TITLE: Pause Execution with step.sleep()
DESCRIPTION: The `step.sleep()` method pauses function execution for a specified duration, managed by Inngest without consuming compute. This is useful for introducing delays or waiting for a set time before proceeding. The maximum sleep duration is one year, with a seven-day limit for free tier plans.

SOURCE: https://www.inngest.com/docs/learn/inngest-steps

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "send-delayed-email" },
  { event: "app/user.signup" },
  async ({ event, step }) => {
    await step.sleep("wait-a-couple-of-days", "2d");
    // Do something else
  }
);

```

--------------------------------

TITLE: Value Expressions for Keys (CEL)
DESCRIPTION: Examples of value expressions used to define keys for concurrency, rate limiting, debounce, or idempotency in Inngest. These expressions can return any value.

SOURCE: https://www.inngest.com/docs/guides/writing-expressions

LANGUAGE: CEL
CODE:
```
// Use the user's id as a concurrency key
"event.data.id" // => "1234"

// Concatenate two strings together to create a unique key
`event.data.userId + "-" + event.type` // => "user_1234-signup"
```

--------------------------------

TITLE: Pause Until Specific Date with step.sleepUntil()
DESCRIPTION: The `step.sleepUntil()` method pauses function execution until a specified date and time. It accepts date strings compatible with the Date object (e.g., 'YYYY-MM-DD'). Like `step.sleep()`, Inngest handles the scheduling, and the maximum sleep duration is one year (seven days for free tier plans).

SOURCE: https://www.inngest.com/docs/learn/inngest-steps

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "send-scheduled-reminder" },
  { event: "app/reminder.scheduled" },
  async ({ event, step }) => {
    const date = new Date(event.data.remind_at);
    await step.sleepUntil("wait-for-the-date", date);
    // Do something else
  }
);

```

--------------------------------

TITLE: Handle Step Errors with Try/Catch in Inngest
DESCRIPTION: Demonstrates how to catch a `StepError` in Inngest and recover by using an alternative step. This functionality requires Inngest SDK version 3.12.0 or later. Prior versions may not handle errors correctly within try/catch blocks.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors

LANGUAGE: javascript
CODE:
```
inngest.createFunction(
  { id: "send-weather-forecast" },
  { event: "weather/forecast.requested" },
  async ({ event, step }) => {
    let data;

    try {
      data = await step.run('get-public-weather-data', async () => {
        return await fetch('https://api.weather.com/data');
      });
    } catch (err) {
      // err will be an instance of StepError
      // Handle the error by recovering with a different step
      data = await step.run('use-backup-weather-api', async () => {
        return await fetch('https://api.stormwaters.com/data');
      });
    }
    // ...
  }
);

```

--------------------------------

TITLE: serve(options) Parameters
DESCRIPTION: Detailed explanation of the parameters available for the serve() API handler.

SOURCE: https://www.inngest.com/docs/sdk/reference/serve

LANGUAGE: APIDOC
CODE:
```
## serve(options)

### Description
The `serve()` API handler is used to serve your application's functions via HTTP. This handler enables Inngest to remotely and securely read your functions' configuration and invoke your function code. This enables you to host your function code on any platform.

### Method
POST, GET, PUT

### Endpoint
`/api/inngest` (default, can be configured with `servePath`)

### Parameters
#### Request Body (for POST requests)
- **client** (Inngest client) - Required - An Inngest client instance.
- **functions** (InngestFunctions[]) - Required - An array of Inngest functions.
- **signingKey** (string) - Required - The Inngest Signing Key for your environment. Recommended to use `INNGEST_SIGNING_KEY` environment variable.
- **serveHost** (string) - Optional - The domain host of your application, including protocol (e.g., `https://myapp.com`). Inferred via HTTP headers at runtime.
- **servePath** (string) - Optional - The path where your `serve` handler is hosted. Default is `/api/inngest`. Inferred via HTTP headers at runtime.
- **streaming** ("allow" | "force" | false) - Optional - Enables streaming responses back to Inngest.
- **logLevel** ("fatal" | "error" | "warn" | "info" | "debug" | "silent") - Optional - The minimum level to log from the Inngest serve endpoint. Defaults to "info".
- **baseUrl** (string) - Optional - The URL used to communicate with Inngest. Defaults to `https://api.inngest.com/`.
- **fetch** (Fetch API compatible interface) - Optional - Override the default `fetch` implementation.
- **id** (string) - Optional - The ID to use to represent this application instead of the client's ID.

### Request Example (Serve Handler Configuration)
```typescript
import { serve } from "inngest/next"; // or your preferred framework
import { inngest } from "./client";
import {
  importProductImages,
  sendSignupEmail,
  summarizeText,
} from "./functions";

serve({
  client: inngest,
  functions: [sendSignupEmail, summarizeText, importProductImages],
  signingKey: "YOUR_SIGNING_KEY", // Recommended: Use environment variable INGTEST_SIGNING_KEY
  serveHost: "https://your-app.com",
  servePath: "/api/inngest",
  logLevel: "debug",
});
```

### Response
#### GET Request (Development Only)
- Renders a debug page displaying function metadata.

#### POST Request (Success Response - 200)
- **data** (object) - The result of the function invocation.

#### PUT Request (Success Response - 200)
- Indicates successful registration of functions with Inngest.
```

--------------------------------

TITLE: Make 3rd Party Library HTTP Requests Durable with Inngest fetch()
DESCRIPTION: Shows how to make HTTP requests from third-party libraries durable by passing Inngest's `fetch()` utility as a custom fetch handler. This ensures library requests are offloaded and retried automatically.

SOURCE: https://www.inngest.com/docs/examples/fetch

LANGUAGE: typescript
CODE:
```
import { fetch as inngestFetch } from 'inngest';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Pass the Inngest fetch utility to the AI SDK's model constructor:
const anthropic = createAnthropic({
  fetch: inngestFetch,
});

const weatherFunction = inngest.createFunction(
  { id: "weather-function" },
  { event: "weather/get" },
  async ({ step }) => {
    // This request is offloaded to the Inngest platform
    // and it also retries automatically if it fails!
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      prompt: `What's the weather in London?`,
    });
  }
)

```

--------------------------------

TITLE: Chunking Jobs with Promise.all() in Node.js for Parallel Processing
DESCRIPTION: This Node.js example shows how to process a list of items (e.g., text chunks) in parallel using `Promise.all()`. It maps over an array of chunks, initiating a 'summarize-chunk' step for each, and then aggregates the results using `Promise.all()`. A final step 'summarize-summaries' processes these aggregated results, demonstrating efficient parallel workload management.

SOURCE: https://www.inngest.com/docs/guides/step-parallelism

LANGUAGE: javascript
CODE:
```
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "signup-flow" });

export const fn = inngest.createFunction(
  { id: "summarize-text" },
  { event: "app/text.summarize" },
  async ({ event, step }) => {
    const chunks = splitTextIntoChunks(event.data.text);

    const summaries = await Promise.all(
      chunks.map((chunk) =>
        step.run("summarize-chunk", () => summarizeChunk(chunk))
      )
    );

    await step.run("summarize-summaries", () => summarizeSummaries(summaries));
  }
);


```

--------------------------------

TITLE: Dynamically Build Parallel Steps with functools.partial - Python
DESCRIPTION: Demonstrates dynamically constructing a tuple of parallel steps within a loop using `functools.partial`. This approach correctly handles loop variables, avoiding issues that arise with lambdas in such contexts.

SOURCE: https://www.inngest.com/docs/reference/python/steps/parallel

LANGUAGE: python
CODE:
```
@client.create_function(
    fn_id="my-function",
    trigger=inngest.TriggerEvent(event="my-event"),
)
async def fn(ctx: inngest.Context) -> None:
    parallel_steps = tuple[typing.Callable[[], typing.Awaitable[bool]]]()
    for user_id in ctx.event.data["user_ids"]:
        parallel_steps += tuple(
            [
                functools.partial(
                    ctx.step.run,
                    f"get-user-{user_id}",
                    functools.partial(update_user, user_id),
                )
            ]
        )

    updated_users = await ctx.group.parallel(parallel_steps)

```

--------------------------------

TITLE: step.sleep (v3 vs v2)
DESCRIPTION: Illustrates the change in `step.sleep`, which now requires a string ID as the first argument, followed by the duration.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
step.sleep("wait-before-poll", "1m");
```

LANGUAGE: typescript
CODE:
```
step.sleep("1m");
```

--------------------------------

TITLE: Conditionally Batch Events for Free Accounts using CEL
DESCRIPTION: Implement conditional event batching using a CEL expression, ensuring that only events associated with 'free' account types are batched.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "batchEvents": {
    "if": "'event.data.account_type == \"free\"'"
  }
}
```

--------------------------------

TITLE: Serve Inngest with ElysiaJS
DESCRIPTION: Example of integrating Inngest serving into an ElysiaJS application. It uses Elysia's `use` and `all` methods to handle Inngest API requests.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { Elysia } from "elysia";
import { serve } from "inngest/bun";
import { functions, inngest } from "./inngest";

const handler = serve({
  client: inngest,
  functions,
});

const inngestHandler = new Elysia().all("/api/inngest", ({ request }) =>
  handler(request)
);

// register the handler with Elysia
const app = new Elysia()
.use(inngestHandler)

```

--------------------------------

TITLE: Retrieve Event IDs from step.sendEvent (TypeScript)
DESCRIPTION: Shows how to capture the IDs of events sent using `step.sendEvent`. The returned `ids` array contains identifiers that can be used to track events in the Inngest dashboard or via the REST API. This usage requires `await` to ensure correct Promise handling.

SOURCE: https://www.inngest.com/docs/reference/functions/step-send-event

LANGUAGE: typescript
CODE:
```
const { ids } = await step.sendEvent([
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e024befa68763f5b500" }
  },
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e08f29fb563c972b1f7" }
  },
]);
/**
 * ids = [
 *   "01HQ8PTAESBZPBDS8JTRZZYY3S",
 *   "01HQ8PTFYYKDH1CP3C6PSTBZN5"
 * ]
 */

```

--------------------------------

TITLE: Advanced Middleware Input Mutation with Type Assertion
DESCRIPTION: Illustrates advanced techniques for mutating context within middleware, including using `const` assertions for literal types and `Omit` type assertions to prevent type overwrites when merging context data. This ensures type safety and precise data handling.

SOURCE: https://www.inngest.com/docs/reference/middleware/typescript

LANGUAGE: typescript
CODE:
```
// In middleware
transformInput() {
  return {
    ctx: {
      foo: "bar",
    } as const,
  };
}

// In a function
async ({ event, foo }) => {
  //             ^? (parameter) foo: "bar"
}
```

LANGUAGE: typescript
CODE:
```
async transformInput({ ctx }) {
  const event = await decrypt(ctx.event);

  const newCtx = {
    foo: "bar",
    event,
  };

  return {
    // Don't affect the `event` type
    ctx: newCtx as Omit<typeof newCtx, "event">
  };
}
```

--------------------------------

TITLE: Hono Framework Integration
DESCRIPTION: Integrates Inngest with the Hono framework, commonly deployed to Cloudflare Workers. Requires `Hono` from `hono` and the `serve` handler from `inngest/hono`.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { Hono } from "hono";
import { serve } from "inngest/hono";
import { functions, inngest } from "./inngest";

const app = new Hono();

app.on(
  ["GET", "PUT", "POST"],
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);

export default app;

```

--------------------------------

TITLE: Define Event Payload Types with Zod
DESCRIPTION: Defines event payload types using Zod for compile-time checking. Supports individual event definitions or a map of events. The `EventSchemas` class is used to register these schemas with the Inngest client.

SOURCE: https://www.inngest.com/docs/reference/client/create

LANGUAGE: typescript
CODE:
```
import { EventSchemas, Inngest, type LiteralZodEventSchema } from "inngest";
import { z } from "zod";

// Define each event individually
const productPurchasedEvent = z.object({
  name: z.literal("shop/product.purchased"),
  data: z.object({ productId: z.string() }),
});

// You can use satisfies to provide some autocomplete when writing the event
const productViewedEvent = z.object({
  name: z.literal("shop/product.viewed"),
  data: z.object({ productId: z.string() }),
}) satisfies LiteralZodEventSchema;

// Or all together in a single object
const eventsMap = {
  "app/account.created": {
    data: z.object({
      userId: z.string(),
    }),
  },
  "app/subscription.started": {
    data: z.object({
      userId: z.string(),
      planId: z.string(),
    }),
  },
};

export const inngest = new Inngest({
  schemas: new EventSchemas()
    .fromZod([productPurchasedEvent, productViewedEvent])
    .fromZod(eventsMap),
});
```

--------------------------------

TITLE: Perform Durable HTTP Requests with step.fetch()
DESCRIPTION: The `step.fetch()` API allows durable HTTP requests to be offloaded to the Inngest Platform. It accepts the same arguments as the native `fetch` API and ensures requests are handled reliably.

SOURCE: https://www.inngest.com/docs/examples/fetch

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

export const retrieveTextFile = inngest.createFunction(
  { id: "retrieveTextFile" },
  { event: "textFile/retrieve" },
  async ({ step }) => {
    // The fetching of the text file is offloaded to the Inngest Platform
    const response = await step.fetch(
      "https://example-files.online-convert.com/document/txt/example.txt"
    );

    // The Inngest function run is resumed when the HTTP request is complete
    await step.run("extract-text", async () => {
      const text = await response.text();
      const exampleOccurences = text.match(/example/g);
      return exampleOccurences?.length;
    });
  }
);

```

--------------------------------

TITLE: Wrap Anthropic SDK with Inngest
DESCRIPTION: Demonstrates how to use `step.ai.wrap` with the Anthropic SDK. It shows the correct way to bind the client method to preserve instance context for successful invocations, contrasting it with an incorrect approach.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration

LANGUAGE: typescript
CODE:
```
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

export const anthropicWrapGenerateText = inngest.createFunction(
  { id: "anthropic-wrap-generateText" },
  { event: "anthropic/wrap.generate.text" },
  async ({ event, step }) => {
    //
    // Will fail because anthropic client requires instance context
    // to be preserved across invocations.
    await step.ai.wrap(
      "using-anthropic",
      anthropic.messages.create,
      {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
      },
    );

    //
    // Will work beccause we bind to preserve instance context
    const createCompletion = anthropic.messages.create.bind(anthropic.messages);
    await step.ai.wrap(
      "using-anthropic",
      createCompletion,
      {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
      },
    );
  },
);

```

--------------------------------

TITLE: Wrap Vercel AI SDK's generateText with Inngest
DESCRIPTION: Illustrates using `step.ai.wrap` with Vercel's `ai` SDK for text generation. It explains how to ensure prompts are editable and steps rerunnable in the dev server by using JSON serializable arguments.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration

LANGUAGE: typescript
CODE:
```
import { generateText as vercelGenerateText } from "ai";
import { openai as vercelOpenAI } from "@ai-sdk/openai";

export const vercelWrapGenerateText = inngest.createFunction(
  { id: "vercel-wrap-generate-text" },
  { event: "vercel/wrap.generate.text" },
  async ({ event, step }) => {
    //
    // Will work but you will not be able to edit the prompt and rerun the step in the dev server.
    await step.ai.wrap(
      "vercel-openai-generateText",
      vercelGenerateText,
      {
        model: vercelOpenAI("gpt-4o-mini"),
        prompt: "Write a haiku about recursion in programming.",
      },
    );

    //
    // Will work and you will be able to edit the prompt and rerun the step in the dev server because
    // the arguments to step.ai.wrap are JSON serializable.
    const args = {
      model: "gpt-4o-mini",
      prompt: "Write a haiku about recursion in programming.",
    };

    const gen = ({ model, prompt }: { model: string; prompt: string }) =>
      vercelGenerateText({
        model: vercelOpenAI(model),
        prompt,
      });

    await step.ai.wrap("using-vercel-ai", gen, args);
  },
);

```

--------------------------------

TITLE: Anatomy of an Inngest Step
DESCRIPTION: Explains the anatomy of an Inngest Step, focusing on the importance of the `id` argument for memoization, retries, and system identification. It also clarifies that each step executes as a separate HTTP request and the need for `step.run()` for non-deterministic logic.

SOURCE: https://www.inngest.com/docs/learn/inngest-steps

LANGUAGE: APIDOC
CODE:
```
## Anatomy of an Inngest Step

The first argument of every Inngest step method is an `id`. Each step is treated as a discrete task which can be individually retried, debugged, or recovered. Inngest uses the ID to memoize step state across function versions.

```typescript
export default inngest.createFunction(
  { id: "import-product-images" },
  { event: "shop/product.imported" },
  async ({ event, step }) => {
    const uploadedImageURLs = await step.run(
      // step ID
      "copy-images-to-s3",
      // other arguments, in this case: a handler
      async () => {
        return copyAllImagesToS3(event.data.imageURLs);
    });
  }
);
```

The ID is also used to identify the function in the Inngest system.
Inngest's SDK also records a counter for each unique step ID. The counter increases every time the same step is called. This allows you to run the same step in a loop, without changing the ID.
Please note that each step is executed as **a separate HTTP request**. To ensure efficient and correct execution, place any non-deterministic logic (such as DB calls or API calls) within a `step.run()` call.
```

--------------------------------

TITLE: Reusing Event Types with GetEvents
DESCRIPTION: Demonstrates reusing event types with the `GetEvents` generic provided by the Inngest SDK. This ensures that Inngest-added properties like `ts` and `inngest/function.failed` are included.

SOURCE: https://www.inngest.com/docs/reference/client/create

LANGUAGE: typescript
CODE:
```
import { EventSchemas, Inngest, type GetEvents } from "inngest";

export const inngest = new Inngest({
  schemas: new EventSchemas().fromRecord<{ 
    "app/user.created": { data: { userId: string } }; 
  }>(),
});

type Events = GetEvents<typeof inngest>;
type AppUserCreated = Events["app/user.created"];
```

--------------------------------

TITLE: Inngest Search Query Examples
DESCRIPTION: Demonstrates how to construct search queries using CEL expressions for Inngest events. Supports filtering by event ID, name, timestamp, version, and data content. Queries can be combined using logical AND (&&) or OR (||) operators, or by separating them with newlines.

SOURCE: https://www.inngest.com/docs/platform/monitor/inspecting-events

LANGUAGE: CEL
CODE:
```
event.data.hello == "world"
```

LANGUAGE: CEL
CODE:
```
event.name != "billing"
```

LANGUAGE: CEL
CODE:
```
event.id == "evt_abc123"
&& event.data.user.id > 1000
```

--------------------------------

TITLE: Send Multiple Events with Event IDs (TypeScript)
DESCRIPTION: Demonstrates sending multiple events using the Inngest SDK in TypeScript. It shows how to retrieve the unique Event IDs assigned to each sent event, which can be used for later lookup.

SOURCE: https://www.inngest.com/docs/events

LANGUAGE: typescript
CODE:
```
const { ids } = await inngest.send([
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e024befa68763f5b500" }
  },
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e08f29fb563c972b1f7" }
  },
]);
/**
 * ids = [
 *   "01HQ8PTAESBZPBDS8JTRZZYY3S",
 *   "01HQ8PTFYYKDH1CP3C6PSTBZN5"
 * ]
 */
```

--------------------------------

TITLE: step.sleepUntil (v3 vs v2)
DESCRIPTION: Demonstrates the updated `step.sleepUntil` usage, which now requires a string ID as the first argument, followed by the date.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
step.sleepUntil("wait-for-user-birthday", specialDate);
```

LANGUAGE: typescript
CODE:
```
step.sleepUntil(specialDate);
```

--------------------------------

TITLE: Next.js: Enable Streaming Responses (Fluid Compute)
DESCRIPTION: Enables streaming responses for Next.js API routes hosted on Vercel Fluid Compute. This allows for longer execution durations by streaming responses back to Inngest.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...fns],
  streaming: "force",
});

```

--------------------------------

TITLE: Send Events API
DESCRIPTION: This section details the `inngest.send()` method for sending events to Inngest. It covers the structure of the event payload, including name, data, and optional user information, as well as parameters for idempotency and timestamps.

SOURCE: https://www.inngest.com/docs/reference/events/send

LANGUAGE: APIDOC
CODE:
```
## POST /events

### Description
Send events to Inngest. Functions with matching event triggers will be invoked.

### Method
POST

### Endpoint
/events

### Parameters
#### Request Body
- **eventPayload** (object | object[]) - Required - An event payload object or an array of event payload objects.
  - **name** (string) - Required - The event name. Recommended to use lowercase dot notation (e.g., `app/account.created`).
  - **data** (object) - Required - Any data to associate with the event. Will be serialized as JSON.
  - **user** (object) - Optional - User identifying data or attributes. This data is encrypted at rest.
    - **external_id** (string) - Optional - An external identifier for the user (e.g., their user ID in your system).
    - **id** (string) - Optional - A unique ID for idempotently triggering function runs. Only the first event with a duplicate ID triggers runs.
    - **ts** (number) - Optional - Timestamp in milliseconds for when the event occurred. Defaults to the time Inngest receives the event. Future timestamps schedule function runs.
    - **v** (string) - Optional - A version identifier for the event payload (e.g., `"2024-05-15.1"`).
- **options** (object) - Optional
  - **env** (string) - Optional - The environment to send the events to.

### Request Example
```typescript
// Send a single event
await inngest.send({
  name: "app/post.created",
  data: { postId: "01H08SEAXBJFJNGTTZ5TAWB0BD" }
});

// Send an array of events
await inngest.send([
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e024befa68763f5b500" }
  },
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e08f29fb563c972b1f7" }
  },
]);

// Send user data that will be encrypted at rest
await inngest.send({
  name: "app/account.created",
  data: { billingPlan: "pro" },
  user: {
    external_id: "6463da8211cdbbcb191dd7da",
    email: "test@example.com"
  }
});

// Specify the idempotency id, version, and timestamp
await inngest.send({
  id: "cart-checkout-completed-ed12c8bde",
  name: "storefront/cart.checkout.completed",
  data: { cartId: "ed12c8bde" },
  user: { external_id: "6463da8211cdbbcb191dd7da" },
  ts: 1684274328198,
  v: "2024-05-15.1"
});
```

### Response
#### Success Response (200)
- **ids** (string[]) - An array of Event IDs that were sent.

#### Response Example
```json
{
  "ids": [
    "01HQ8PTAESBZPBDS8JTRZZYY3S",
    "01HQ8PTFYYKDH1CP3C6PSTBZN5"
  ]
}
```
```

--------------------------------

TITLE: Tanstack Start API Route for Inngest
DESCRIPTION: Integrates the Inngest serve handler with Tanstack Start to handle API requests for Inngest. This setup defines GET, POST, and PUT methods for the /api/inngest route.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { createServerFileRoute } from '@tanstack/react-start/server'

import { serve } from "inngest/edge";
import { inngest, functions } from "../../inngest";

const handler = serve ({ client: inngest, functions });
    
export const ServerRoute = createServerFileRoute('/api/inngest').methods({
  GET: async ({ request }) => handler(request),
  POST: async ({ request }) => handler(request),
  PUT: async ({ request }) => handler(request)
})


```

--------------------------------

TITLE: Shopify Product Import Loop
DESCRIPTION: Illustrates importing products from Shopify using a loop that fetches products page by page. It emphasizes using `step.run` for the product fetching logic to ensure retries and correct execution order, especially when dealing with potentially large datasets.

SOURCE: https://www.inngest.com/docs/guides/working-with-loops

LANGUAGE: typescript
CODE:
```
export default inngest.createFunction(
  { id: "shopify-product-import"},
  { event: "shopify/import.requested" },
  async ({ event, step }) => {
    const allProducts = []
    let cursor = null
    let hasMore = true
    let pageNumber = 1

    // Use the event's "data" to pass key info like IDs
    // Note: in this example is deterministic across multiple requests
    // If the returned results must stay in the same order, wrap the db call in step.run()
    const session = await database.getShopifySession(event.data.storeId)

    while (hasMore) {
      const page = await step.run(`fetch-products-${pageNumber}`, async () => {
        return await shopify.rest.Product.all({
          session,
          since_id: cursor,
        })
      })
      // Combine all of the data into a single list
      allProducts.push(...page.products)
      if (page.products.length === 50) {
        cursor = page.products[49].id
        pageNumber++
      } else {
        hasMore = false
      }
    }

    // Now we have the entire list of products within allProducts!
  }
)

```

--------------------------------

TITLE: GetEvents: Typing Inngest Event Payloads
DESCRIPTION: GetEvents is a utility type to infer the event types handled by an Inngest client. It can optionally include internal Inngest events by passing `true` as a second generic argument.

SOURCE: https://www.inngest.com/docs/typescript

LANGUAGE: typescript
CODE:
```
import { type GetEvents } from "inngest";
import { inngest } from "@/inngest";

type Events = GetEvents<typeof inngest>;

type EventsWithInternal = GetEvents<typeof inngest, true>;

```

--------------------------------

TITLE: Custom Framework Serve Handler (v3)
DESCRIPTION: Provides an example of a v3 custom framework serve handler using native Request and Response objects. This handler focuses on parsing request details and transforming responses, simplifying the process compared to v2.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
export const serve = (options: ServeHandlerOptions) => {
  const handler = new InngestCommHandler({
    frameworkName,
    ...options,
    handler: (req: Request) => {
      return {
        body: () => req.json(),
        headers: (key) => req.headers.get(key),
        method: () => req.method,
        url: () => new URL(req.url, `https://${req.headers.get("host") || ""}`),
        transformResponse: ({ body, status, headers }) => {
          return new Response(body, { status, headers });
        },
      };
    },
  });

  return handler.createHandler();
};
```

--------------------------------

TITLE: Define Inngest Workflow Actions (TypeScript)
DESCRIPTION: Defines a list of available workflow actions using the `PublicEngineAction` type from `@inngest/workflow-kit`. Each action has a `kind`, `name`, and `description`, enabling users to build custom workflows by selecting and combining these actions.

SOURCE: https://www.inngest.com/docs/guides/user-defined-workflows

LANGUAGE: typescript
CODE:
```
import { type PublicEngineAction } from "@inngest/workflow-kit";

export const actions: PublicEngineAction[] = [
  {
    kind: "add_ToC",
    name: "Add a Table of Contents",
    description: "Add an AI-generated ToC",
  },
  {
    kind: "grammar_review",
    name: "Perform a grammar review",
    description: "Use OpenAI for grammar fixes",
  },
  {
    kind: "wait_for_approval",
    name: "Apply changes after approval",
    description: "Request approval for changes",
  },
  {
    kind: "apply_changes",
    name: "Apply changes",
    description: "Save the AI revisions",
  },
  {
    kind: "generate_linkedin_posts",
    name: "Generate LinkedIn posts",
    description: "Generate LinkedIn posts",
  },
  {
    kind: "generate_tweet_posts",
    name: "Generate Twitter posts",
    description: "Generate Twitter posts",
  },
];

```

--------------------------------

TITLE: Send Events with TypeScript SDK
DESCRIPTION: Demonstrates how to send single events, arrays of events, and events with user data using the Inngest TypeScript SDK. User data is encrypted at rest.

SOURCE: https://www.inngest.com/docs/reference/events/send

LANGUAGE: typescript
CODE:
```
import { inngest } from "./client";

await inngest.send({
  name: "app/account.created",
  data: {
    accountId: "645e9f6794e10937e9bdc201",
    billingPlan: "pro",
  },
  user: {
    external_id: "645ea000129f1c40109ca7ad",
    email: "taylor@example.com",
  }
})
```

LANGUAGE: typescript
CODE:
```
// Send a single event
await inngest.send({
  name: "app/post.created",
  data: { postId: "01H08SEAXBJFJNGTTZ5TAWB0BD" }
});

// Send an array of events
await inngest.send([
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e024befa68763f5b500" }
  },
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e08f29fb563c972b1f7" }
  },
]);

// Send user data that will be encrypted at rest
await inngest.send({
  name: "app/account.created",
  data: { billingPlan: "pro" },
  user: {
    external_id: "6463da8211cdbbcb191dd7da",
    email: "test@example.com"
  }
});

// Specify the idempotency id, version, and timestamp
await inngest.send({
  // Use an id specific to the event type & payload
  id: "cart-checkout-completed-ed12c8bde",
  name: "storefront/cart.checkout.completed",
  data: { cartId: "ed12c8bde" },
  user: { external_id: "6463da8211cdbbcb191dd7da" },
  ts: 1684274328198,
  v: "2024-05-15.1"
});
```

--------------------------------

TITLE: Inngest v2 Inferring Event Types
DESCRIPTION: Illustrates how to infer event types from an Inngest instance in v2 using the GetEvents utility type. This is useful for creating reusable logic and understanding the final shape of event data.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
import { Inngest, type GetEvents } from "inngest";

const inngest = new Inngest({ name: "My App" });
type Events = GetEvents<typeof inngest>;

```

--------------------------------

TITLE: Send Welcome and Trial Offer Emails with Delay (TypeScript)
DESCRIPTION: This snippet demonstrates how to send a welcome email and then, after a delay, send a trial offer email. It uses Inngest's `step.run()` to encapsulate individual tasks, enabling automatic retries on error, and `step.sleep()` to introduce a three-day delay between sending the emails. This ensures reliable execution of sequential asynchronous operations.

SOURCE: https://www.inngest.com/docs/guides/clerk-webhook-events

LANGUAGE: typescript
CODE:
```
const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email' },
  { event: 'clerk/user.created' },
  async ({ event, step }) => {
    const { user } = event.data;
    const { first_name } = user;
    const email = user.email_addresses.find(e =>
      e.id === user.primary_email_address_id
    ).email;

    // Wrapping each distinct task in step.run() ensures that each
    // will be retried automatically on error and will not be re-run
    await step.run('welcome-email', async () => {
      await emails.sendWelcomeEmail({ email, first_name })
    });

    // wait 3 days before second email
    await step.sleep('wait-3-days', '3 days');

    await step.run('trial-offer-email', async () => {
      await emails.sendTrialOfferEmail({ email, first_name })
    });
  }
)

```

--------------------------------

TITLE: Configure Encryption Middleware with Fallback Keys (TypeScript)
DESCRIPTION: Demonstrates how to configure the encryption middleware to support multiple decryption keys, which is essential for key rotation. This allows older events encrypted with previous keys to still be successfully decrypted while new events are encrypted with the latest key.

SOURCE: https://www.inngest.com/docs/features/middleware/encryption-middleware

LANGUAGE: typescript
CODE:
```
// start out with the current key
encryptionMiddleware({
  key: process.env.MY_ENCRYPTION_KEY,
});

// deploy all services with the new key as a decryption fallback
encryptionMiddleware({
  key: process.env.MY_ENCRYPTION_KEY,
  fallbackDecryptionKeys: ["new"],
});

// deploy all services using the new key for encryption
encryptionMiddleware({
  key: process.env.MY_ENCRYPTION_KEY_V2,
  fallbackDecryptionKeys: ["current"],
});

// once you are sure all data using the "current" key has passed, phase it out
encryptionMiddleware({
  key: process.env.MY_ENCRYPTION_KEY_V2,
});

```

--------------------------------

TITLE: Debounce by Account and Email using CEL
DESCRIPTION: This example demonstrates debouncing events based on a combination of account ID and user email, utilizing CEL for complex key expression generation.

SOURCE: https://www.inngest.com/docs/reference/functions/create

LANGUAGE: json
CODE:
```
{
  "debounce": {
    "key": "'event.data.account_id + "-" + event.user.email'"
  }
}
```

--------------------------------

TITLE: Inngest v2 Event Schema Typing with EventSchemas
DESCRIPTION: Demonstrates the v2 approach to event schema typing using the new EventSchemas class and its fromRecord method, contrasting it with the v1 method. The v2 approach reduces duplication and provides a guided experience.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
// ❌ Invalid in v2
type Events = {
  "app/user.created": {
    name: "app/user.created";
    data: { id: string };
  };
  "app/user.deleted": {
    name: "app/user.deleted";
    data: { id: string };
  };
};

new Inngest<Events>();

```

LANGUAGE: typescript
CODE:
```
import { Inngest, EventSchemas } from "inngest";
//                ⬆️ New "EventSchemas" class

// ✅ Valid in v2 - `fromRecord()`
type Events = {
  "app/user.created": {
    data: { id: string };
  };
  "app/user.deleted": {
    data: { id: string };
  };
};

new Inngest({
  schemas: new EventSchemas().fromRecord<Events>(),
});

```

--------------------------------

TITLE: Define Frontend Workflow Actions with PublicEngineAction
DESCRIPTION: Defines a list of workflow actions intended for the frontend, specifying their kind, name, and description. This separation prevents leaking backend implementation details.

SOURCE: https://www.inngest.com/docs/reference/workflow-kit/actions

LANGUAGE: typescript
CODE:
```
import { type PublicEngineAction } from "@inngest/workflow-kit";

export const actionsDefinition: PublicEngineAction[] = [
  {
    kind: "grammar_review",
    name: "Perform a grammar review",
    description: "Use OpenAI for grammar fixes",
  },
];
```

--------------------------------

TITLE: Environment-Specific Inngest Clients
DESCRIPTION: Illustrates setting up separate Inngest clients for different environments, like Node.js (with middleware) and Edge (without). This is useful for managing environment-specific dependencies.

SOURCE: https://www.inngest.com/docs/reference/client/create

LANGUAGE: typescript
CODE:
```
// inngest/client.ts
import { Inngest } from "inngest";
import { nodeMiddleware } from "some-node-middleware";

export const inngest = new Inngest({
  id: "my-app",
  middleware: [nodeMiddleware],
});

// inngest/edgeClient.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "my-app-edge",
});
```

--------------------------------

TITLE: Enable Streaming Responses with Express
DESCRIPTION: Demonstrates how to enable streaming responses from an Express server to Inngest for potentially longer timeouts. This is achieved by setting the `streaming: "force"` option in the `serve` handler.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
const handler = serve({
  client: inngest,
  functions: [...fns],
  streaming: "force",
});

```

--------------------------------

TITLE: Send Multiple Events (TypeScript)
DESCRIPTION: Send multiple events in a single `send` call for efficiency. You can send an array of event objects, each with a `name` and `data` property. This is useful for batching events from arrays of data.

SOURCE: https://www.inngest.com/docs/events

LANGUAGE: typescript
CODE:
```
await inngest.send([
  { name: "storefront/cart.checkout.completed", data: { ... } },
  { name: "storefront/coupon.used", data: { ... } },
  { name: "storefront/loyalty.program.joined", data: { ... } },
])
```

LANGUAGE: typescript
CODE:
```
// This function call might return 10s or 100s of items, so we can use map
// to transform the items into event payloads then pass that array to send:
const importedItems = await api.fetchAllItems();
const events = importedItems.map((item) => ({
  name: "storefront/item.imported",
  data: {
    ...item,
  }
}));
await inngest.send(events);
```

--------------------------------

TITLE: Conditional Hook Registration - TypeScript
DESCRIPTION: Shows how to conditionally register hooks based on event data. In this example, a `beforeExecution` hook is only registered if the incoming event name is `app/user.created`.

SOURCE: https://www.inngest.com/docs/features/middleware/create

LANGUAGE: typescript
CODE:
```
import { InngestMiddleware } from "inngest";

new InngestMiddleware({
  name: "Example Middleware",
  async init() {
    return {
      onFunctionRun({ ctx, fn, steps }) {
        // Register a hook only if this event is the trigger
        if (ctx.event.name === "app/user.created") {
          return {
            beforeExecution() {
              console.log("Function executing with user created event");
            },
          };
        }

        // Register no hooks if the trigger was not `app/user.created`
        return {};
      },
    };
  },
});

```

--------------------------------

TITLE: Step Options Type Definition
DESCRIPTION: Defines the `StepOptionsOrId` type, which can be a string for the step ID or an object containing an 'id' and an optional 'name'. This is used for all step tools.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
type StepOptionsOrId =
  | string
  | {
      id: string;
      name?: string;
    };
```

--------------------------------

TITLE: Defining Event Payload Types
DESCRIPTION: Shows how to define event payload types using Zod for compile-time validation and type safety within the Inngest client.

SOURCE: https://www.inngest.com/docs/reference/client/create

LANGUAGE: APIDOC
CODE:
```
## Defining Event Payload Types

Leverage TypeScript or Zod to define your event payload types. Passing types to the Inngest client provides full typing for events when using `inngest.send()` and `inngest.createFunction()`, catching issues at compile time.

**Method 1: Define individual events with Zod**

```typescript
import { EventSchemas, Inngest, type LiteralZodEventSchema } from "inngest";
import { z } from "zod";

// Define each event individually
const productPurchasedEvent = z.object({
  name: z.literal("shop/product.purchased"),
  data: z.object({ productId: z.string() }),
});

// Use satisfies for autocomplete
const productViewedEvent = z.object({
  name: z.literal("shop/product.viewed"),
  data: z.object({ productId: z.string() }),
}) satisfies LiteralZodEventSchema;

export const inngest = new Inngest({
  schemas: new EventSchemas()
    .fromZod([productPurchasedEvent, productViewedEvent]),
});
```

**Method 2: Define events in a map with Zod**

```typescript
import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";

const eventsMap = {
  "app/account.created": {
    data: z.object({
      userId: z.string(),
    }),
  },
  "app/subscription.started": {
    data: z.object({
      userId: z.string(),
      planId: z.string(),
    }),
  },
};

export const inngest = new Inngest({
  schemas: new EventSchemas().fromZod(eventsMap),
});
```

### Reusing event types (v2.0.0+)

Use the `GetEvents<>` generic to access final event types from an Inngest client. This is recommended over reusing event types directly, as Inngest adds internal properties like `ts` and `inngest/function.failed`.

```typescript
import { EventSchemas, Inngest, type GetEvents } from "inngest";

export const inngest = new Inngest({
  schemas: new EventSchemas().fromRecord<{ 
    "app/user.created": { data: { userId: string } }; 
  }>(),
});

type Events = GetEvents<typeof inngest>;
type AppUserCreated = Events["app/user.created"];
```
```

--------------------------------

TITLE: SvelteKit API Route for Inngest
DESCRIPTION: Sets up the Inngest serve handler for a SvelteKit API route located at /api/inngest. This configuration allows Inngest to communicate with the SvelteKit application.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: typescript
CODE:
```
import { functions, inngest } from '$lib/inngest';
import { serve } from 'inngest/sveltekit';

const inngestServe = serve ({ client: inngest, functions });
export const GET = inngestServe.GET;
export const POST = inngestServe.POST;
export const PUT = inngestServe.PUT;

```

--------------------------------

TITLE: Basic Event Filtering in SQL
DESCRIPTION: This SQL query counts events matching a specific name and filters based on a JSON field within the event data and a timestamp. It demonstrates basic filtering and JSON extraction using `simpleJSONExtractString`.

SOURCE: https://www.inngest.com/docs/platform/monitor/insights

LANGUAGE: sql
CODE:
```
SELECT count(*)
FROM events
WHERE name = 'inngest/function.failed'
AND simpleJSONExtractString(data, 'function_id') = 'generate-report'
AND ts > toUnixTimestamp(addHours(now(), -1)) * 1000;
```

--------------------------------

TITLE: Koa Framework Integration
DESCRIPTION: Integrates Inngest with the Koa framework. Requires `serve` from `inngest/koa`, `Koa` from `koa`, and `bodyParser` from `koa-bodyparser`.

SOURCE: https://www.inngest.com/docs/learn/serving-inngest-functions

LANGUAGE: javascript
CODE:
```
import { serve } from "inngest/koa";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { functions, inngest } from "./inngest";

const app = new Koa();
app.use(bodyParser()); // make sure we're parsing incoming JSON

const handler = serve({
  client: inngest,
  functions,
});

app.use((ctx) => {
  if (ctx.request.path === "/api/inngest") {
    return handler(ctx);
  }
});

```

--------------------------------

TITLE: Retrieve Event IDs after Sending
DESCRIPTION: Shows how to retrieve the unique IDs of events after they have been sent using the Inngest SDK. These IDs can be used for tracking and referencing events.

SOURCE: https://www.inngest.com/docs/reference/events/send

LANGUAGE: typescript
CODE:
```
const { ids } = await inngest.send([
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e024befa68763f5b500" }
  },
  {
    name: "app/invoice.created",
    data: { invoiceId: "645e9e08f29fb563c972b1f7" }
  },
]);
/**
 * ids = [
 *   "01HQ8PTAESBZPBDS8JTRZZYY3S",
 *   "01HQ8PTFYYKDH1CP3CSTBZN5"
 * ]
 */
```

--------------------------------

TITLE: Implement Simple Rollbacks for Steps (TypeScript)
DESCRIPTION: This example shows how to add specific rollback logic to a step. If the 'create-row' step fails, the 'rollback-row-creation' step is executed to undo the changes.

SOURCE: https://www.inngest.com/docs/features/inngest-functions/error-retries/rollbacks

LANGUAGE: typescript
CODE:
```
inngest.createFunction(
  { id: "add-data" },
  { event: "app/row.data.added" },
  async ({ event, step }) => {
    // ignore the error - this step is fine if it fails
    await step
      .run("non-critical-step", () => {
        return updateMetric();
      })
      .catch();

    // Add a rollback to a step
    await step
      .run("create-row", async () => {
        const row = await createRow(event.data.rowId);
        await addDetail(event.data.entry);
      })
      .catch((err) =>
        step.run("rollback-row-creation", async () => {
          await removeRow(event.data.rowId);
        }),
      );
  },
);

```

--------------------------------

TITLE: useInngestSubscription() API Reference
DESCRIPTION: Reference for the `useInngestSubscription` React hook, detailing its parameters, return values, and usage.

SOURCE: https://www.inngest.com/docs/features/realtime/react-hooks

LANGUAGE: APIDOC
CODE:
```
## `useInngestSubscription()` API Reference

### Description
Provides a fully typed experience for subscribing to Inngest Realtime channels using a subscription token fetched from the server.

### Method
React Hook

### Parameters
#### Hook Parameters
- **`enabled`** (boolean) - Optional - Whether or not the hook will subscribe.
- **`bufferInterval`** (number) - Optional - If set and above `0`, the outputs will only update every `n` milliseconds. This helps with very busy streams that could overwhelm a UI.
- **`token`** (`Realtime.Subscribe.Token`) - Optional - The token to be used for subscribing.
- **`refreshToken`** (() => Promise<`Realtime.Subscribe.Token`>) - Optional - A function that will be called if no `token` is available, or if the hook has been re-`enabled` and the previous `token` has expired.

**Note:** A `token` or `refreshToken` parameter is required.

### Return Value
- **`data`** (Array<`Realtime.Message`>) - All messages received on the subscription in chronological order.
- **`latestData`** (`Realtime.Message`) - A shortcut to the last message received on the subscription. Useful for streams where each message is the latest state of an entity.
- **`freshData`** (Array<`Realtime.Message`>) - If `bufferInterval` is active, this will be the last batch of messages released from the buffer. If `bufferInterval` is inactive, this is always the latest message.
- **`error`** (Error | null) - If truthy, this indicates an error with the subscription.
- **`state`** (`InngestSubscriptionState`) - The current state of the subscription, one of `"closed"`, `"error"`, `"refresh_token"`, `"connecting"`, `"active"`, or `"closing"`.
- **`clear`** (() => void) - A function to clear all accumulated message data from the internal state. This includes `data`, `freshData`, and `latestData` arrays. Does not affect the connection or error state.
```

--------------------------------

TITLE: Inngest v2 Standardized Event Sending
DESCRIPTION: Compares the event sending methods in Inngest v1 and v2, highlighting the simplification to a single standard signature in v2. This resolves previous complexities with autocomplete and batch sending.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
// ❌ Invalid in v2
inngest.send("app/user.created", { data: { userId: "123" } });
inngest.send("app/user.created", [
  { data: { userId: "123" } },
  { data: { userId: "456" } },
]);

// ✅ Valid in v1 and v2
inngest.send({ name: "app/user.created", data: { userId: "123" } });
inngest.send([
  { name: "app/user.created", data: { userId: "123" } },
  { name: "app/user.created", data: { userId: "456" } },
]);

```

--------------------------------

TITLE: Handling step.run() Promises with await and then
DESCRIPTION: Shows how to manage the Promises returned by `step.run()`. This includes using the `await` keyword to pause execution until the step completes, and using `.then()` for more complex asynchronous flows. It also demonstrates running multiple steps in parallel using `Promise.all`.

SOURCE: https://www.inngest.com/docs/reference/functions/step-run

LANGUAGE: typescript
CODE:
```
// Use the "await" keyword to wait for the promise to fulfil
await step.run("create-user", () => {/* ... */});
const user = await step.run("create-user", () => {/* ... */});

// Use `then` (or similar)
step.run("create-user", () => {/* ... */})
  .then((user) => {
    // do something else
  });

// Use with a Promise helper function to run in parallel
Promise.all([
  step.run("create-subscription", () => {/* ... */}),
  step.run("add-to-crm", () => {/* ... */}),
  step.run("send-welcome-email", () => {/* ... */}),
]);
```

--------------------------------

TITLE: step.sendEvent (v3 vs v2)
DESCRIPTION: Shows the updated `step.sendEvent` usage, requiring an ID as the first argument. The 'name' property within the options object remains for the event.

SOURCE: https://www.inngest.com/docs/sdk/migration

LANGUAGE: typescript
CODE:
```
step.sendEvent("broadcast-user-creation", {
  name: "app/user.created",
  data: {
    /* ... */
  },
});
```

LANGUAGE: typescript
CODE:
```
step.sendEvent({
  name: "app/user.created",
  data: {
    /* ... */
  },
});
```