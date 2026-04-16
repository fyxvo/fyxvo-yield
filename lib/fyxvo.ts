import { createFyxvoClient } from "@fyxvo/sdk";

const FYXVO_RPC_URL = "https://rpc.fyxvo.com";
const SOLANA_MAINNET_PUBLIC_RPC = "https://api.mainnet-beta.solana.com";

let fyxvoClient: ReturnType<typeof createFyxvoClient> | null = null;

function buildFyxvoClient() {
  const apiKey = process.env.FYXVO_API_KEY ?? process.env.NEXT_PUBLIC_FYXVO_API_KEY;
  if (!apiKey) return null;
  if (!fyxvoClient) {
    fyxvoClient = createFyxvoClient({
      apiKey,
      baseUrl: FYXVO_RPC_URL,
      timeoutMs: 20_000,
    });
  }
  return fyxvoClient;
}

async function publicRpc<TResult>(method: string, params?: unknown): Promise<TResult> {
  const response = await fetch(SOLANA_MAINNET_PUBLIC_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Public RPC ${method} failed: ${response.status}`);
  }

  const data = (await response.json()) as { result: TResult; error?: { message: string } };

  if (data.error) {
    throw new Error(`${method} error: ${data.error.message}`);
  }

  return data.result;
}

export async function fyxvoRpc<TResult, TParams = unknown>(
  method: string,
  params?: TParams,
) {
  const client = buildFyxvoClient();

  if (client) {
    const response = await client.rpc<TResult, TParams>({ method, params });
    if ("error" in response) {
      throw new Error(`${method} failed: ${response.error.message}`);
    }
    return response.result;
  }

  return publicRpc<TResult>(method, params);
}
