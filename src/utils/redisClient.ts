import {
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
  createClient,
} from "@redis/client";
import { Request } from "express";
import objectHash from "object-hash";
import {
  RequestWithUserandFile,
  NextFunction,
  Response,
} from "../types/RequestWithuser";

let redisClient:
  | RedisClientType<RedisModules, RedisFunctions, RedisScripts>
  | undefined;

async function initialsedRedisClient() {
  try {
    redisClient = createClient();
    await redisClient.connect();
    console.log("redis connected successfully");
  } catch (error) {
    console.error(`Redis connection failed with error:`);
    console.error(error);
  }
}

function generateCacheKey(req: RequestWithUserandFile, method: string = "GET") {
  let type = method.toUpperCase();
  const reqDatatoHash = {
    query: req.query,
    body: req.body,
    params: req.params,
    userID: req.userID,
    url: req.originalUrl,
  };
  return `${req.originalUrl}/${objectHash.sha1(reqDatatoHash)}`;
}

export { initialsedRedisClient, generateCacheKey, redisClient };
