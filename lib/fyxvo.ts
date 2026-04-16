import { createFyxvoClient } from "@fyxvo/sdk";

const FYXVO_RPC_URL = "https://rpc.fyxvo.com";

let client: ReturnType<typeof createFyxvoClient> | null = null;

function getApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_FYXVO_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_FYXVO_API_KEY. Add it to .env.local to enable Fyxvo-backed Solana RPC reads.",
    );
  }

  return apiKey;
}

export function getFyxvoClient() {
  if (!client) {
    client = createFyxvoClient({
      apiKey: getApiKey(),
      baseUrl: FYXVO_RPC_URL,
      timeoutMs: 20_000,
    });
  }

  return client;
}

export async function fyxvoRpc<TResult, TParams = unknown>(
  method: string,
  params?: TParams,
) {
  const response = await getFyxvoClient().rpc<TResult, TParams>({
    method,
    params,
  });

  if ("error" in response) {
    throw new Error(`${method} failed: ${response.error.message}`);
  }

  return response.result;
}
