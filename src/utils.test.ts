import { BirthdayListEntry } from './types';
import {
  daysToBirthday,
  getAge,
  sanitizeName,
  sortAbsoluteDate,
  sortClosestDate,
} from './utils';

const records: BirthdayListEntry[] = [
  { name: 'Rui', date: '1984-12-26', gender: 'male', chatId: 0 },
  { name: 'Ricardo', date: '1980-07-01', gender: 'male', chatId: 0 },
  { name: 'Ines', date: '1986-06-11', gender: 'female', chatId: 0 },
  { name: 'Carlota', date: '2023-05-09', gender: 'female', chatId: 0 },
  { name: 'Francisca', date: '2020-06-16', gender: 'female', chatId: 0 },
  { name: 'Xavier', date: '2018-08-20', gender: 'male', chatId: 0 },
];

describe('getAge()', () => {
  it('calculates age correctly', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-10-12'));

    expect(getAge('1984-12-26')).toEqual(39);
    expect(getAge('1980-07-01')).toEqual(44);
    expect(getAge('1980-11-12')).toEqual(43);
  });
});

describe('daysToBirthday()', () => {
  it('calculates days to birthday correctly', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-06-12'));

    expect(daysToBirthday('1999-06-12')).toEqual(0);
    expect(daysToBirthday('1999-06-13')).toEqual(1);
    expect(daysToBirthday('1999-06-14')).toEqual(2);
    expect(daysToBirthday('1999-06-11')).toEqual(364);
  });
});

describe('sortClosestDate()', () => {
  it('sorts records by closest date', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-06-12'));

    const sorted = records.sort(sortClosestDate);
    expect(sorted[0].name).toEqual('Francisca');
    expect(sorted[1].name).toEqual('Ricardo');
    expect(sorted[2].name).toEqual('Xavier');
    expect(sorted[3].name).toEqual('Rui');
    expect(sorted[4].name).toEqual('Carlota');
    expect(sorted[5].name).toEqual('Ines');
  });

  it('sorts records by absolute date', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-06-12'));

    const sorted = records.sort(sortAbsoluteDate);
    expect(sorted[0].name).toEqual('Ricardo');
    expect(sorted[5].name).toEqual('Carlota');
  });
});

describe('sanitizeName()', () => {
  it('upcases the first letter', () => {
    expect(sanitizeName('ricardo')).toEqual('Ricardo');
    expect(sanitizeName('RICARDO')).toEqual('Ricardo');
  });

  it('works with names with spaces', () => {
    const name = 'ricardo costa';
    expect(sanitizeName(name)).toEqual('Ricardo Costa');
  });

  it('removes extra spaces', () => {
    expect(sanitizeName('ricardo  costa')).toEqual('Ricardo Costa');
    expect(sanitizeName('ricardo   costa')).toEqual('Ricardo Costa');
    expect(sanitizeName(' ricardo ')).toEqual('Ricardo');
    expect(sanitizeName('    ricardo   costa     ')).toEqual('Ricardo Costa');
  });

  it('works with names with hyphens', () => {
    const name = 'ricardo-costa';
    expect(sanitizeName(name)).toEqual('Ricardo-Costa');
  });

  it('works with names with apostrophes', () => {
    const name = "ricardo o'costa";
    expect(sanitizeName(name)).toEqual("Ricardo O'Costa");
  });

  it('works with names with accents', () => {
    const name = 'avó mãe';
    expect(sanitizeName('avó mãe')).toEqual('Avó Mãe');
    expect(sanitizeName('Óscar')).toEqual('Óscar');
    expect(sanitizeName('vovÔ DÓnÃld')).toEqual('Vovô Dónãld');
  });
});
