import { createClient } from 'redis';

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: 'redis-10562.c1.eu-west-1-3.ec2.cloud.redislabs.com',
    port: 10562,
  },
});

export const connect = async () => {
  try {
    await client.connect();
  } catch (e) {
    console.error(e);
  }
};
export const get = async (k: string): Promise<string | null> => {
  try {
    return await client.get(k);
  } catch (e) {
    console.error(e);
    return null;
  }
};
export const set = async (k: string, v: string) => {
  try {
    return await client.set(k, v);
  } catch (e) {
    console.error(e);
  }
};

export const disconnect = async () => {
  try {
    await client.disconnect();
  } catch (e) {
    console.error(e);
  }
};

export const clearCache = async () => {
  try {
    await client.flushDb();
  } catch (e) {
    console.error(e);
  }
};
