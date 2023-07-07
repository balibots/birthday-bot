export type Gender = 'male' | 'female' | null;

export interface BirthdayData {
  name: string;
  date: string;
  tgId?: number; // telegram id
  chatId: number;
  gender: Gender;
}

export interface BirthdayListData {
  name: string;
  date: string;
  chatId: number;
}
