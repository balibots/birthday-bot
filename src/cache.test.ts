import { set, get, clearCache } from './cache';

describe('Cache tests tests', () => {
  beforeEach(async () => {
    await clearCache();
  });

  it.only('works', async () => {
    const key = 'ricardo';
    const value = 'male';

    await set(key, value);

    expect(await get(key)).toEqual(value);
    expect(await get('lol')).toBeNull();
  });

  it.only('deals ok with spaces', async () => {
    const key = 'chatId:Grupo sem reccoes';
    const value = '-1234';

    await set(key, value);

    expect(await get(key)).toEqual(value);
  });
});
