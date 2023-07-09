import { set, get, disconnect, connect, clearCache } from './cache';

describe('Cache tests tests', () => {
  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearCache();
  });

  afterAll(async () => {
    await disconnect();
  });

  it.only('works', async () => {
    const key = 'ricardo';
    const value = 'male';

    await set(key, value);

    expect(await get(key)).toEqual(value);
    expect(await get('lol')).toBeNull();
  });
});
