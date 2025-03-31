export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      passwordResetRequired?: boolean
    }
  }
}