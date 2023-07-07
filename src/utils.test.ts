import { BirthdayListData } from "./types";
import { daysToBirthday, sortAbsoluteDate, sortClosestDate } from "./utils";

const records: BirthdayListData[] = [
  { name: "Rui", date: "1984-12-26", chatId: 0 },
  { name: "Ricardo", date: "1980-07-01", chatId: 0 },
  { name: "Ines", date: "1986-06-11", chatId: 0 },
  { name: "Carlota", date: "2023-05-09", chatId: 0 },
  { name: "Francisca", date: "2020-06-16", chatId: 0 },
  { name: "Xavier", date: "2018-08-20", chatId: 0 },
];

describe("utils tests", () => {
  it("sorts records by closest date", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-06-12"));

    const sorted = records.sort(sortClosestDate);
    expect(sorted[0].name).toEqual("Francisca");
    expect(sorted[1].name).toEqual("Ricardo");
    expect(sorted[2].name).toEqual("Xavier");
    expect(sorted[3].name).toEqual("Rui");
    expect(sorted[4].name).toEqual("Carlota");
    expect(sorted[5].name).toEqual("Ines");
  });

  it("sorts records by absolute date", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-06-12"));

    const sorted = records.sort(sortAbsoluteDate);
    expect(sorted[0].name).toEqual("Ricardo");
    expect(sorted[5].name).toEqual("Carlota");
  });

  it("calculates days to birthday", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-06-12"));

    expect(daysToBirthday("1999-06-12")).toEqual(0);
    expect(daysToBirthday("1999-06-13")).toEqual(1);
    expect(daysToBirthday("1999-06-14")).toEqual(2);
    expect(daysToBirthday("1999-06-11")).toEqual(364);
  });
});
