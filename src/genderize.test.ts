import { clearCache, get, set } from './cache';
import { getGender } from './genderize';

describe.skip('getGender', () => {
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

  it('returns null for names with low probability', async () => {
    const result = await getGender('amelinha');
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    const result = await getGender('asdfasdf');
    expect(result).toBeNull();
  });

  it('returns null on empty name', async () => {
    const result = await getGender('');
    expect(result).toBeNull();
  });

  it('returns the right gender for names with spaces', async () => {
    const result = await getGender('bernardo silva');
    expect(result).toEqual('male');
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

  it('caches results correctly for names with spaces', async () => {
    const result = await getGender('bernardo raposo');
    expect(result).toEqual('male');
    expect(await get(`name:bernardo`)).toEqual('male');
  });
});
