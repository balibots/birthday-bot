import CyclicDb from '@cyclic.sh/dynamodb';

const db = CyclicDb(process.env.CYCLIC_DB);
const cache = db.collection('cache');

export const get = async (k: string): Promise<string | null> => {
  try {
    const record = await cache.get(k);
    return record ? record.props.value : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};
export const set = async (k: string, v: string) => {
  try {
    return await cache.set(k, { value: v });
  } catch (e) {
    console.error(e);
  }
};

export const clearCache = async () => {
  try {
    for (let record of (await cache.list()).results) {
      await record.delete();
    }
  } catch (e) {
    console.error(e);
  }
};
