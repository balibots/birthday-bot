import CyclicDb from "@cyclic.sh/dynamodb";
import { BirthdayData, BirthdayListData } from "./types";
const db = CyclicDb(process.env.CYCLIC_DB);

const birthdays = db.collection(process.env.CYCLIC_DB_COLLECTION);

type AddRemoveArg = Pick<BirthdayData, "name" | "date"> & { chatId: number };

export async function addRecord({ name, date, chatId }: AddRemoveArg) {
  const k = `${chatId}:${name}:${date}`;
  const birthday = await birthdays.set(
    k,
    {
      date,
      chatId,
    },
    {
      $index: ["date", "chatId"],
    }
  );

  return birthday;
}

export async function removeRecord({ name, date, chatId }: AddRemoveArg) {
  const k = `${chatId}:${name}:${date}`;
  const record = await birthdays.get(k);
  if (record) {
    return await record.delete();
  } else {
    throw new Error("404");
  }
}

export async function clearDB() {
  for (let b of (await birthdays.list()).results) {
    await b.delete();
  }
}

const parseList = (dbList: { results: any[] }): BirthdayListData[] =>
  dbList.results.reduce((acc, el) => {
    const [chatId, name, date] = el.key.split(":");
    acc.push({ name, date, chatId: parseInt(chatId) });
    return acc;
  }, []);

const parseRecord = (dbRecord: any): BirthdayData => {
  const [chatId, name, date] = dbRecord.key.split(":");
  return {
    name,
    date,
    chatId: parseInt(chatId),
    pronoun: "a", // TODO
  };
};

export async function getRecord({
  name,
  date,
  chatId,
}: AddRemoveArg): Promise<BirthdayData | undefined> {
  const k = `${chatId}:${name}:${date}`;
  return parseRecord(await birthdays.get(k));
}

export async function getRecords(chatId: number): Promise<BirthdayListData[]> {
  return parseList(await birthdays.index("chatId").find(chatId));
}

export async function getRecordByDate(
  date: string,
  chatId: number
): Promise<BirthdayListData[]> {
  return parseList(await birthdays.filter({ date, chatId }));
}
