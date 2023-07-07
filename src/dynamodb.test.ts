process.env.CYCLIC_DB_COLLECTION = `${process.env.CYCLIC_DB_COLLECTION}:test`;

import {
  addRecord,
  getRecords,
  getRecordByDate,
  removeRecord,
  clearDB,
  getRecord,
} from "./dynamodb";

const chatId = 12345;

const record = { name: "Rui", date: "1984-12-26", chatId };
const record2 = { name: "Ricardo", date: "1980-07-01", chatId };
const dbRecord = {
  $index: ["date", "chatId"],
  collection: process.env.CYCLIC_DB_COLLECTION,
  key: `${chatId}:Rui:1984-12-26`,
  props: {
    chatId,
    date: "1984-12-26",
  },
};

console.log(
  ` * Using collection '${process.env.CYCLIC_DB_COLLECTION}' for tests`
);

describe("DynamoDB tests", () => {
  beforeEach(async () => {
    return await clearDB();
  });

  it("adds a record successfully", async () => {
    const birthday = await addRecord(record);
    expect(birthday).toEqual(dbRecord);

    const allBirthdays = await getRecords(chatId);

    expect(allBirthdays.length).toEqual(1);
    expect(allBirthdays[0].name).toEqual(record.name);
    expect(allBirthdays[0].date).toEqual(record.date);
  });

  it("removes a record successfully", async () => {
    const birthday = await addRecord(record);
    expect(birthday).toEqual(dbRecord);

    let allBirthdays = await getRecords(chatId);

    expect(allBirthdays.length).toEqual(1);

    await removeRecord(record);

    allBirthdays = await getRecords(chatId);

    expect(allBirthdays.length).toEqual(0);
  });

  it("works with multiple records", async () => {
    await addRecord(record);
    await addRecord(record2);
    await addRecord(record2); // upserts fine
    expect((await getRecords(chatId)).length).toEqual(2);

    await removeRecord(record);

    expect((await getRecords(chatId)).length).toEqual(1);
  });

  it("gets a record", async () => {
    await addRecord(record);
    await addRecord(record2);
    expect(
      await getRecord({ name: record.name, date: record.date, chatId })
    ).toMatchObject({ name: record.name, date: record.date, chatId });
  });

  it("finds a record by date", async () => {
    await addRecord(record);
    await addRecord(record2);

    expect(await getRecordByDate(record2.date, chatId)).toEqual([record2]);
  });

  it("returns empty array on no match", async () => {
    await addRecord(record);
    expect(await getRecordByDate(record2.date, chatId)).toEqual([]);
  });

  it("is multitenant", async () => {
    const newChatId = 54321;
    await addRecord(record);
    await addRecord(record2);
    await addRecord({ ...record2, chatId: newChatId });

    expect((await getRecords(chatId)).length).toEqual(2);
    expect((await getRecords(newChatId)).length).toEqual(1);

    expect(await getRecordByDate(record2.date, chatId)).toEqual([record2]);
    expect(await getRecordByDate(record2.date, newChatId)).toEqual([
      { ...record2, chatId: newChatId },
    ]);

    await removeRecord(record2);

    expect((await getRecords(chatId)).length).toEqual(1);
    expect((await getRecords(newChatId)).length).toEqual(1);

    await removeRecord({ ...record2, chatId: newChatId });

    expect((await getRecords(chatId)).length).toEqual(1);
    expect((await getRecords(newChatId)).length).toEqual(0);

    expect(await getRecordByDate(record.date, chatId)).toEqual([record]);
    expect(await getRecordByDate(record.date, newChatId)).toEqual([]);
  });
});
