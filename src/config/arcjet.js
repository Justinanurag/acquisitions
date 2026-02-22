import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";
import logger from "./logger.js";

// Arcjet client configuration
export const aj = arcjet({
  key: process.env.ARCJET_KEY, 
  rules: [
    // Shield protects your app from common attacks (e.g. SQL injection)
    shield({ mode: "LIVE" }),

    // Bot detection
    // detectBot({
    //   mode: "LIVE", // Use "DRY_RUN" to log only
    //   allow: [
    //     "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc.
    //     // Add other allowed categories as needed
    //   ],
    // }),

    // Token bucket rate limit
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 3, // Every 10 seconds
      capacity: 3, // Max 10 tokens
    }),
  ],
});

// Express middleware that protects every request with Arcjet
export async function arcjetMiddleware(req, res, next) {
  // If Arcjet is not configured, skip
  if (!process.env.ARCJET_KEY) {
    return next();
  }

  try {
    // @arcjet/next expects a standard Web Fetch Request, not an Express req
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const request = new Request(url, {
      method: req.method,
      headers: {
        ...req.headers,
        // Help Arcjet identify the client consistently for IP-based rate limits
        "x-forwarded-for": req.ip,
      },
    });

    const decision = await aj.protect(request, { requested: 1 });
    logger.info("Arcjet decision", decision);

    if (decision.isDenied()) {
      if (decision.reason?.isRateLimit?.()) {
        return res.status(429).json({
          error: "Too Many Requests",
          reason: decision.reason,
        });
      }

      if (decision.reason?.isBot?.()) {
        return res.status(403).json({
          error: "No bots allowed",
          reason: decision.reason,
        });
      }

      return res.status(403).json({
        error: "Forbidden",
        reason: decision.reason,
      });
    }

    return next();
  } catch (error) {
    logger.error("Arcjet middleware error", error);
    return next();
  }
}