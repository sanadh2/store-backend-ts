import {
  NextFunction,
  RequestWithUserandFile,
  Response,
} from "../types/RequestWithuser";
import { generateCacheKey, redisClient } from "../utils/redisClient";

function setCache(options: { EX: number } = { EX: 3600 }) {
  return async (
    req: RequestWithUserandFile,
    res: Response,
    next: NextFunction
  ) => {
    if (redisClient?.isOpen) {
      const key = generateCacheKey(req, req.method);

      const cachedValue = await redisClient.get(key);

      if (cachedValue) {
        const parsedvalue = JSON.parse(cachedValue);
        return res.status(200).json(JSON.parse(parsedvalue));
      } else {
        const oldSend = res.send;
        res.send = function (data: any) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            redisClient
              ?.set(key, JSON.stringify(data), { ...options })
              .catch((err) => {
                console.error("Failed to cache response:", err);
              });
          }
          return oldSend.call(this, data);
        };
        next();
      }
    } else {
      next();
    }
  };
}

function invalidateCacheMiddleware(
  req: RequestWithUserandFile,
  res: Response,
  next: NextFunction
) {
  // Invalidate the cache for the cache key
  const key = generateCacheKey(req);
  redisClient?.del(key);
  next();
}

export { setCache, invalidateCacheMiddleware };
export default { setCache, invalidateCacheMiddleware };
