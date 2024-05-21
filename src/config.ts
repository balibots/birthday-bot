import { getRedisClient } from './redis';

const CONFIG_KEY = process.env.NODE_ENV === 'test' ? 'config:test' : 'config';

export type ChatConfig = {
  // in redis, this is a number (0/1)
  restrictedToAdmins: boolean;
  masterId: number;
  notificationHour: number;
};

const buildKey = (chatId: number) => `${CONFIG_KEY}:${chatId}`;

export const getConfigForGroup = async (
  chatId: number
): Promise<ChatConfig | null> => {
  const client = await getRedisClient();
  const key = buildKey(chatId);

  try {
    let record = (await client.hGetAll(key)) as any;
    // redis doesnt represent booleans so we're converting it back and from a number
    if (record)
      record.restrictedToAdmins = Boolean(parseInt(record.restrictedToAdmins));
    return record;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const setConfigForGroup = async (
  chatId: number,
  newConfig: Partial<ChatConfig>
) => {
  const client = await getRedisClient();
  const key = buildKey(chatId);

  try {
    const currentConfig = await getConfigForGroup(chatId);
    let merged = { ...(currentConfig || {}), ...newConfig } as any;
    merged.restrictedToAdmins = merged.restrictedToAdmins ? 1 : 0;
    await client.hSet(key, merged);
  } catch (e) {
    console.error(e);
  }
};

export const clearConfigForGroup = async (chatId: number) => {
  const client = await getRedisClient();
  const key = buildKey(chatId);
  await client.del(key);
};
