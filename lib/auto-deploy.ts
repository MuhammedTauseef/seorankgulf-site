/**
 * Trigger a Vercel redeploy after admin publishes content.
 * Called after successful blog/video publish so new content goes live automatically.
 * 
 * The deploy hook URL must be set as VERCEL_DEPLOY_HOOK_URL env var.
 * Failures are logged but never block the publish response.
 */
export async function triggerAutoDeploy(source: string): Promise<void> {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) {
    console.warn(`[auto-deploy] VERCEL_DEPLOY_HOOK_URL not set, skipping deploy for ${source}`);
    return;
  }
  
  try {
    const res = await fetch(hookUrl, { method: "POST" });
    console.log(`[auto-deploy] Deploy triggered for ${source}: HTTP ${res.status}`);
  } catch (err) {
    console.error(`[auto-deploy] Failed to trigger deploy for ${source}:`, err);
    // Don't throw — publish already succeeded, deploy is best-effort
  }
}
