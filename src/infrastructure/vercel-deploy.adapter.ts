export const vercelDeployAdapter = {
  redeployFrontend: async (): Promise<void> => {
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL?.trim()
    if (!deployHookUrl) throw new Error("VERCEL_DEPLOY_HOOK_URL is required")

    const response = await fetch(deployHookUrl, { method: "POST" })
    if (!response.ok) {
      throw new Error(`Vercel deploy hook returned ${response.status}`)
    }
  },
}
