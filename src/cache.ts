import { createClient } from 'redis';

const cacheKey = process.env.NODE_ENV === 'test' ? 'cache:test' : 'cache';

export const get = async (k: string): Promise<string | null> => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  let record = null;

  try {
    record = await client.get(k);
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

  try {
    await client.set(k, v);
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
