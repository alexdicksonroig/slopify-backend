const cookieName = "slopify_admin_session"
const cookieAttributes = `Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`

class AdminSessionAdapter {
  readonly maxAgeSeconds = 7 * 24 * 60 * 60

  createCookie(token: string): string {
    return `${cookieName}=${token}; Max-Age=${this.maxAgeSeconds}; ${cookieAttributes}`
  }

  clearCookie(): string {
    return `${cookieName}=; Max-Age=0; ${cookieAttributes}`
  }

  readToken(cookieHeader: string | undefined): string | undefined {
    return cookieHeader
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1)
  }
}

export const adminSessionAdapter = new AdminSessionAdapter()
