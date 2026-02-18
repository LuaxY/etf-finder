import * as Sentry from "@sentry/bun";
import { Elysia, t } from "elysia";

export const subscribeRoutes = new Elysia({ prefix: "/api" }).post(
  "/subscribe",
  async ({ body, error }) => {
    try {
      const res = await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.email,
          source: "etf-finder",
        }),
      });

      if (res.ok || res.status === 409) {
        return { success: true };
      }

      const text = await res.text();
      console.error("Loops API error:", res.status, text);
      Sentry.captureException(new Error("Loops API error"), {
        extra: { status: res.status, body: text },
      });
      return error(500, { message: "Failed to subscribe" });
    } catch (e) {
      console.error("Subscribe error:", e);
      Sentry.captureException(e, { extra: { email: body.email } });
      return error(500, {
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  },
  {
    body: t.Object({ email: t.String({ format: "email" }) }),
  }
);
