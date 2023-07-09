import { clearCache, get, set } from './cache';
import { getGender } from './genderize';

describe('getGender', () => {
  beforeEach(async () => {
    await clearCache();
  });

  it('gets the right gender for females', async () => {
    const result = await getGender('francisca');
    expect(result).toEqual('female');
  });

  it('gets the right gender for males', async () => {
    const result = await getGender('bernardo');
    expect(result).toEqual('male');
  });

  it('returns null for unknown names', async () => {
    const result = await getGender('asdfasdf');
    expect(result).toBeNull();
  });

  it('caches results', async () => {
    let result = await getGender('bernardo');
    expect(result).toEqual('male');

    expect(await get(`name:bernardo`)).toEqual('male');

    result = await getGender('bernardo');
    expect(result).toEqual('male');

    await set('name:bernardo', 'female');

    result = await getGender('bernardo');
    expect(result).toEqual('female');
  });
});
