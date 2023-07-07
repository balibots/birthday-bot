import { DateTime, Interval } from "luxon";
import { BirthdayListData } from "./types";

export const sortClosestDate = (a: BirthdayListData, b: BirthdayListData) => {
  const dt = DateTime.now().startOf("day");

  let dateA = DateTime.fromISO(a.date).set({ year: dt.year });
  if (dt > dateA) dateA = dateA.set({ year: dt.year + 1 });

  let dateB = DateTime.fromISO(b.date).set({ year: dt.year });
  if (dt > dateB) dateB = dateB.set({ year: dt.year + 1 });

  const ia = Interval.fromDateTimes(dt, dateA);
  const ib = Interval.fromDateTimes(dt, dateB);
  return ia.length() - ib.length();
};

export const sortAbsoluteDate = (a: BirthdayListData, b: BirthdayListData) => {
  let dateA = DateTime.fromISO(a.date);
  let dateB = DateTime.fromISO(b.date);
  return dateA > dateB ? 1 : -1;
};

export const daysToBirthday = (strdate: string) => {
  const dt = DateTime.now().startOf("day");

  let bdate = DateTime.fromISO(strdate).set({ year: dt.year });
  if (dt > bdate) bdate = bdate.set({ year: dt.year + 1 });

  return Math.ceil(Interval.fromDateTimes(dt, bdate).length("days"));
};
