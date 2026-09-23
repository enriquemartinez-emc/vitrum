export type SignInFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
