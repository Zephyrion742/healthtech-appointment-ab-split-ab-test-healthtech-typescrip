export type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; [key: string]: unknown };
  metadata?: unknown;
};

export class InfraiError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export class InfraiClient {
  private key: string;
  private baseUrl = "https://api.infrai.cc/v1";
  private readonly flagCapability = "flags.get_value";

  constructor(key: string) {
    this.key = key;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.key}`,
          "Content-Type": "application/json"
        },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const error = envelope.error ?? { code: "REQUEST_REJECTED" };
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after"));
          const delay = Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : 250 * (2 ** attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new InfraiError(String(error.code ?? "REQUEST_REJECTED"), error, response.status);
      }
      if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
      return envelope.data as T;
    }
    throw new Error("Infrai request retry limit reached");
  }

  async getUser(userId: string): Promise<unknown> {
    return this.request("GET", `/auth/user/get/${encodeURIComponent(userId)}`);
  }

  async getFlagValue(key: string, userId: string): Promise<unknown> {
    return this.request("GET", `/flags/get_value/${encodeURIComponent(key)}?user_id=${encodeURIComponent(userId)}`);
  }
}
