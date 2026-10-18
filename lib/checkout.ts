/**
 * Whop checkout links for ReplyPilot payments.
 *
 * The user creates these manually in the Whop dashboard
 * (Developer → API Keys path was abandoned after 3 rejected keys).
 * When a new link arrives, paste it here and redeploy.
 */

export const WHOP_CHECKOUT = {
  /**
   * ReplyPilot Build — Deposit: one-time $125 (50% upfront).
   * ⚠️ VERIFY BEFORE ENABLING: the user first created this plan as
   * RECURRING $125/month by mistake and was guided (2026-10-08 ~11:25 PKT)
   * to switch the top dropdown to ONE-TIME. Confirm in the Whop dashboard
   * that the plan shows "$125 one-time" (not "$125.00 / month") before
   * wiring this link into the site — otherwise buyers get charged monthly.
   */
  deposit:
    "https://whop.com/replypilot-site-ea3d/replypilot-build-deposit-cf",
  /** ReplyPilot Build — Go-Live: one-time $124 (50% on approval) */
  goLive:
    "https://whop.com/replypilot-site-ea3d/replypilot-build-go-live-01",
  /** ReplyPilot Care Plan: recurring $99/month */
  carePlan:
    "https://whop.com/replypilot-site-ea3d/replypilot-care-plan-a8",
} as const;

export type CheckoutKey = keyof typeof WHOP_CHECKOUT;

/** True when the link is filled in and safe to render. */
export function hasCheckout(key: CheckoutKey): boolean {
  return WHOP_CHECKOUT[key].length > 0;
}
