// import jwt from "jsonwebtoken";

// export function verifyTokenForMiddleware(token: string): string | null {
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//       userId: string;
//     };
//     return decoded.userId;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// }

import { jwtVerify } from "jose";

export async function verifyTokenForMiddleware(
  token: string
): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    console.error(error);
    return null;
  }
}
