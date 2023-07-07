export interface BirthdayData {
  name: string;
  date: string;
  tgId?: number;
  chatId: number;
  pronoun: "a" | "o";
}

export interface BirthdayListData {
  name: string;
  date: string;
  chatId: number;
}
