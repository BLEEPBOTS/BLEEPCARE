import { jwtVerify, createRemoteJWKSet } from "jose";
async function validateToken(token) {
  try {
    const JWKS = createRemoteJWKSet(
      new URL(process.env.FRONTEND_URL + "/api/auth/secure/jwks.json"),
    );
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.FRONTEND_URL, // Should match the JWT issuer, which is the BASE_URL
      audience: process.env.FRONTEND_URL, // Should match the JWT audience, which is the BASE_URL by default
    });
    return payload;
  } catch (error) {
    console.error("Token validation failed:", error);
    throw error;
  }
}

export const checkJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(301).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = await validateToken(token);
    req.auth = payload;
  } catch (e) {
    res.status(301).json({ message: "Unauthorized!" });
  }
  next();
};
