// Lightweight wrapper around @vapi-ai/web to avoid hard crashes if SDK/env are missing.
// Exposes a small controller API used by the TakeInterview route.

export type VapiController = {
  start: (handlers: {
    onPartial: (text: string) => void;
    onFinal: (text: string) => void;
    onStatus?: (status: string) => void;
    onError?: (err: unknown) => void;
  }) => Promise<void>;
  stop: () => Promise<void>;
};

export async function createVapiClient(): Promise<VapiController | null> {
  const pubKey = import.meta.env.VITE_VAPI_PUBLIC_KEY as string | undefined;
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID as string | undefined;
  if (!pubKey || !assistantId) return null;

  try {
    const mod = await import("@vapi-ai/web");
    const Vapi = (mod as any).default ?? (mod as any);
    const vapi = new Vapi(pubKey);

    let started = false;

    const start: VapiController["start"] = async ({ onPartial, onFinal, onStatus, onError }) => {
      if (started) return;
      started = true;
      try {
        // Common event names used by Vapi SDKs; guarded to avoid crashes if they differ
        if (typeof vapi.on === "function") {
          try {
            vapi.on("transcript.partial", (e: any) => onPartial?.(String(e?.text ?? e ?? "")));
            vapi.on("transcript.final", (e: any) => onFinal?.(String(e?.text ?? e ?? "")));
            vapi.on("call.started", () => onStatus?.("call.started"));
            vapi.on("call.ended", () => onStatus?.("call.ended"));
            vapi.on("ready", () => onStatus?.("ready"));
            vapi.on("status", (s: any) => onStatus?.(String(s)));
            vapi.on("error", (err: any) => onError?.(err));
          } catch {}
        }
        // Try multiple start signatures used by different SDK versions
        if (typeof vapi.start === "function") {
          try {
            await vapi.start({ assistantId });
          } catch {
            try {
              await vapi.start(assistantId);
            } catch {
              try {
                await vapi.start();
              } catch (e) {
                throw e;
              }
            }
          }
        } else if (typeof vapi.connect === "function") {
          try {
            await vapi.connect({ assistantId });
          } catch {
            await vapi.connect(assistantId);
          }
        } else if (typeof vapi.startCall === "function") {
          await vapi.startCall({ assistantId });
        } else if (typeof vapi.init === "function") {
          await vapi.init({ assistantId });
        } else {
          onStatus?.("no-start-method");
          throw new Error("Vapi client has no known start method");
        }
      } catch (err) {
        onError?.(err);
      }
    };

    const stop: VapiController["stop"] = async () => {
      if (!started) return;
      try {
        if (typeof vapi.stop === "function") await vapi.stop();
        else if (typeof vapi.disconnect === "function") await vapi.disconnect();
        else if (typeof vapi.end === "function") await vapi.end();
        else if (typeof vapi.hangup === "function") await vapi.hangup();
      } finally {
        started = false;
      }
    };

    return { start, stop };
  } catch {
    return null;
  }
}
