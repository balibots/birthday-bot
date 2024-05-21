import {
  createClient as createClientRedis,
  RedisClientType,
} from '@redis/client';

let client: RedisClientType<any, any, any>;

export async function getRedisClient() {
  if (client) return client;

  client = await createClientRedis({ url: process.env.REDIS_URL })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  return client;
}

export async function disconnectClient() {
  return client && client.isOpen && client.disconnect();
}
