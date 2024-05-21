import { createClient } from 'redis';

const CACHE_KEY = process.env.NODE_ENV === 'test' ? 'cache:test' : 'cache';

const buildKey = (k: string) => `${CACHE_KEY}:${k}`;

export const get = async (k: string): Promise<string | null> => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  let record = null;

  const key = buildKey(k);

  try {
    record = await client.get(key);
  } catch (e) {
    console.error(e);
  }

  await client.disconnect();
  return record;
};

export const set = async (k: string, v: string) => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  const key = buildKey(k);

  try {
    await client.set(key, v);
    await client.disconnect();
  } catch (e) {
    console.error(e);
  }
};

export const clearCache = async () => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  await client.flushAll();
  await client.disconnect();
};
