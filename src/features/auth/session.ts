export const SESSION_COOKIE = "vitrum_session"

// Demo only: a fixed token, not a signed session. Anyone who reads this file
// can forge it, so replace it with real auth before exposing the app.
export const DEMO_SESSION_TOKEN = "vitrum-demo-session"

export function isSignedIn(cookieValue: string | undefined): boolean {
  return cookieValue === DEMO_SESSION_TOKEN
}
