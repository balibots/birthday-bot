import { getRedisClient } from './redis';

const CACHE_KEY = process.env.NODE_ENV === 'test' ? 'cache:test' : 'cache';

const buildKey = (k: string) => `${CACHE_KEY}:${k}`;

export const get = async (k: string): Promise<string | null> => {
  const client = await getRedisClient();
  let record = null;
  const key = buildKey(k);

  try {
    record = await client.get(key);
  } catch (e) {
    console.error(e);
  }

  return record;
};

export const set = async (k: string, v: string) => {
  const client = await getRedisClient();
  const key = buildKey(k);

  try {
    await client.set(key, v);
  } catch (e) {
    console.error(e);
  }
};

export const clearCache = async () => {
  const client = await getRedisClient();

  await client.flushAll();
};
