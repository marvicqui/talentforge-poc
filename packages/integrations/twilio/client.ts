import Twilio from "twilio";

export type WhatsAppSendResult = {
  status: "sent" | "simulated";
  sid: string | null;
  to: string;
  from: string;
  body: string;
  error?: string;
};

function parseVerifiedNumbers(): Set<string> {
  const raw = process.env.TWILIO_SANDBOX_VERIFIED_NUMBERS ?? "";
  return new Set(
    raw
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean),
  );
}

function normalize(to: string): string {
  // accept "+E.164" or "whatsapp:+E.164" → return plain "+E.164" for the set,
  // and "whatsapp:+E.164" for the actual Twilio call.
  return to.startsWith("whatsapp:") ? to.slice("whatsapp:".length) : to;
}

export type SendWhatsAppOptions = {
  to: string; // E.164 like "+5219211234567" (or with "whatsapp:" prefix)
  body: string; // <= 1024 chars
};

export async function sendWhatsAppMessage(
  opts: SendWhatsAppOptions,
): Promise<WhatsAppSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WA_FROM ?? "whatsapp:+14155238886";

  const verified = parseVerifiedNumbers();
  const e164 = normalize(opts.to);
  const isVerified = verified.has(e164);

  // If creds are missing OR number not verified → simulate.
  if (!accountSid || !authToken || !isVerified) {
    return {
      status: "simulated",
      sid: null,
      to: e164,
      from,
      body: opts.body,
    };
  }

  const client = Twilio(accountSid, authToken);
  try {
    const msg = await client.messages.create({
      from,
      to: `whatsapp:${e164}`,
      body: opts.body,
    });
    return {
      status: "sent",
      sid: msg.sid,
      to: e164,
      from,
      body: opts.body,
    };
  } catch (err: unknown) {
    return {
      status: "simulated",
      sid: null,
      to: e164,
      from,
      body: opts.body,
      error: err instanceof Error ? err.message : "Unknown Twilio error",
    };
  }
}
