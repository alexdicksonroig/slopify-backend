import assert from "node:assert/strict"
import { test } from "node:test"
import Fastify from "fastify"
import fastifyJwt from "@fastify/jwt"
import { adminAuth, adminCookie, signSession } from "./helpers/admin-session"
import adminAdapter from "../src/plugins/admin.adapter"
import swaggerAdapter from "../src/plugins/swagger.adapter"
import userRouter from "../src/verticals/user/infrastructure/api/user-http.router"
import orderRouter from "../src/verticals/order/infrastructure/api/order-http.router"
import { orderHandler } from "../src/verticals/order/infrastructure/api/order-http.handler"
import { userRepository } from "../src/verticals/user/infrastructure/persistence/user.repository"
import { passwordAdapter } from "../src/verticals/user/infrastructure/password.adapter"
import { User } from "../src/verticals/user/domain/user.entity"

test("password hashes verify only the original password", async () => {
  const hash = await passwordAdapter.hash("correct horse battery")
  assert.equal(await passwordAdapter.verify("correct horse battery", hash), true)
  assert.equal(await passwordAdapter.verify("wrong password", hash), false)
  assert.equal(await passwordAdapter.verify("correct horse battery", undefined), false)
})

test("login sets an HttpOnly session cookie only for valid credentials", async () => {
  const app = Fastify()
  const user = new User(7, "admin@example.com", await passwordAdapter.hash("correct horse battery"))
  const originalFindByEmail = userRepository.findByEmail
  userRepository.findByEmail = async (email) => (email === user.email ? user : null)
  try {
    await app.register(adminAuth)
    await app.register(userRouter)
    const logIn = (email: string, password: string) =>
      app.inject({ method: "POST", url: "/auth/login", payload: { email, password } })

    const ok = await logIn(" Admin@Example.com ", "correct horse battery")
    assert.equal(ok.statusCode, 204)
    const cookie = String(ok.headers["set-cookie"])
    const token = cookie.split(";")[0].split("=")[1]
    assert.equal(app.jwt.verify<{ sub: string }>(token).sub, "7")
    assert.match(
      cookie,
      /^slopify_admin_session=[^;]+; Max-Age=\d+; Path=\/; HttpOnly; SameSite=Strict/,
    )

    assert.equal((await logIn(user.email, "wrong password")).statusCode, 401)
    assert.equal((await logIn("nobody@example.com", "correct horse battery")).statusCode, 401)
    assert.equal((await logIn(user.email, "")).statusCode, 400)

    const loggedOut = await app.inject({ method: "POST", url: "/auth/logout" })
    assert.equal(loggedOut.statusCode, 204)
    assert.match(String(loggedOut.headers["set-cookie"]), /^slopify_admin_session=; Max-Age=0;/)
  } finally {
    userRepository.findByEmail = originalFindByEmail
    await app.close()
  }
})

test("protected API routes reject missing, forged, and expired sessions", async () => {
  const app = Fastify()
  const originalList = orderHandler.list
  orderHandler.list = async () => []
  try {
    await app.register(adminAuth)
    await app.register(orderRouter)
    const list = (cookie?: string) =>
      app.inject({ url: "/orders", headers: cookie ? { cookie } : {} })

    assert.equal((await list(adminCookie)).statusCode, 200)
    assert.equal((await list(`other=1; ${adminCookie}`)).statusCode, 200)
    assert.equal((await list()).statusCode, 401)
    assert.equal((await list("slopify_admin_session=garbage")).statusCode, 401)
    const otherApp = Fastify()
    await otherApp.register(fastifyJwt, { secret: "another-secret" })
    await otherApp.ready()
    const forged = otherApp.jwt.sign({ sub: "1" })
    assert.equal((await list(`slopify_admin_session=${forged}`)).statusCode, 401)
    const expired = signSession({ exp: Math.floor(Date.now() / 1000) - 60 })
    assert.equal((await list(`slopify_admin_session=${expired}`)).statusCode, 401)
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url")
    const unsigned = `${encode({ alg: "none", typ: "JWT" })}.${encode({ sub: "1" })}.`
    assert.equal((await list(`slopify_admin_session=${unsigned}`)).statusCode, 401)
    await otherApp.close()
  } finally {
    orderHandler.list = originalList
    await app.close()
  }
})

test("admin pages redirect to login and admin actions require a session", async () => {
  const app = Fastify()
  try {
    await app.register(adminAuth)
    await app.register(adminAdapter)

    const page = await app.inject("/admin/orders?status=paid")
    assert.equal(page.statusCode, 302)
    assert.equal(page.headers.location, "/admin/login?next=%2Fadmin%2Forders%3Fstatus%3Dpaid")
    assert.equal((await app.inject("/admin/")).statusCode, 302)
    assert.equal((await app.inject("/admin/index.html")).statusCode, 404)

    const login = await app.inject("/admin/login")
    assert.equal(login.statusCode, 200)
    assert.match(login.body, /<title>Log in/)
    const loginWhileLoggedIn = await app.inject({
      url: "/admin/login",
      headers: { cookie: adminCookie },
    })
    assert.equal(loginWhileLoggedIn.headers.location, "/admin/")

    const authed = await app.inject({ url: "/admin/orders", headers: { cookie: adminCookie } })
    assert.equal(authed.statusCode, 200)
    assert.match(authed.body, /<title>Orders/)

    assert.equal((await app.inject({ method: "POST", url: "/admin/deploy" })).statusCode, 401)
  } finally {
    await app.close()
  }
})

test("API documentation, including the raw spec, requires a session", async () => {
  const app = Fastify()
  try {
    await app.register(adminAuth)
    await app.register(swaggerAdapter)

    for (const url of ["/documentation", "/documentation/json", "/documentation/yaml"]) {
      const anonymous = await app.inject(url)
      assert.equal(anonymous.statusCode, 302, url)
      assert.equal(anonymous.headers.location, `/admin/login?next=${encodeURIComponent(url)}`)
    }

    const spec = await app.inject({ url: "/documentation/json", headers: { cookie: adminCookie } })
    assert.equal(spec.statusCode, 200)
    assert.equal(spec.json().info.title, "Slopify API")
  } finally {
    await app.close()
  }
})
