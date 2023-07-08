import { getGender } from './genderize';

describe('getGender', () => {
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
});
