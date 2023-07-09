import CyclicDb from '@cyclic.sh/dynamodb';

const db = CyclicDb(process.env.CYCLIC_DB);
const cacheKey = process.env.NODE_ENV === 'test' ? 'cache:test' : 'cache';
const cache = db.collection(cacheKey);

export const get = async (k: string): Promise<string | null> => {
  try {
    const record = await cache.get(k);
    return record ? record.props.value : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getNamespace = async (ns: string) => {
  try {
    return await cache.filter({ ns });
  } catch (e) {
    console.error(e);
  }
};

export const set = async (k: string, v: string) => {
  try {
    const ns = k.split(':')[0];
    return await cache.set(k, { value: v, ns });
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
