import Stripe from "stripe";

export function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || "";
}

export function stripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
}

export function stripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "";
}

export function stripeConfigured() {
  return Boolean(stripeSecretKey() && stripePublishableKey());
}

export function getStripe() {
  const key = stripeSecretKey();
  if (!key) return null;
  return new Stripe(key);
}

export function siteOrigin(request: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const header = request.headers.get("origin");
  if (header) return header.replace(/\/$/, "");
  const host = request.headers.get("host");
  if (host) {
    const proto = host.includes("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}
