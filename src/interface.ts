import { DateTime, DateTimeFormatOptions, Duration } from "luxon";
import { BirthdayData, BirthdayListData } from "./types";
import { daysToBirthday } from "./utils";

export function formatDate(date: string): string {
  const dateJS = new Date(date);

  const options: DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  return dateJS.toLocaleDateString("pt-PT", { ...options });
}

export function getAge(date: string): number {
  return DateTime.fromISO(date).diffNow("years").years * -1;
}

export function birthdayLine(record: BirthdayListData): string {
  const days = daysToBirthday(record.date);
  return `\`${formatDate(record.date)}\` — ${record.name} — ${
    days ? (days > 1 ? `${days} dias` : `${days} dia`) : "hoje 🎉"
  }`;
}

export function ageLine(record: BirthdayListData): string {
  const age = getAge(record.date);
  return `\`${formatDate(record.date)}\` — ${record.name}, ${Math.floor(age)}`;
}

export function nextBirthday(record: BirthdayData): string {
  const age = getAge(record.date);
  const diff = daysToBirthday(record.date);

  const differenceToBirthday = DateTime.now()
    .startOf("day")
    .setLocale("pt-PT")
    .plus({ days: diff })
    .toRelative();

  let name = record.name;

  if (record.tgId) {
    name = `[${name}](tg://user?id=${record.tgId})`;
  }

  const nextAge = Math.floor(age) + (diff === 0 ? 0 : 1);

  const daysToBirthdayStr = diff > 0 ? differenceToBirthday : "hoje 🎉";

  return `Próximo aniversariante — *${name}*, faz *${nextAge}* anos \\(${daysToBirthdayStr}\\)`;
}
