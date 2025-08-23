import jwt from "jsonwebtoken"

export function verifyTokenForMiddleware(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch (error) {
    return null
  }
}
