;(() => {
  const loginUrl = () =>
    `/admin/login?next=${encodeURIComponent(location.pathname + location.search)}`

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (...args) => {
    const response = await originalFetch(...args)
    if (response.status === 401) location.href = loginUrl()
    return response
  }

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("[data-logout]")
    if (!link) return
    event.preventDefault()
    await originalFetch("/auth/logout", { method: "POST" })
    location.href = "/admin/login"
  })
})()
