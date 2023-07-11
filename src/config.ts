import CyclicDb from '@cyclic.sh/dynamodb';

const db = CyclicDb(process.env.CYCLIC_DB);
const configKey = process.env.NODE_ENV === 'test' ? 'config:test' : 'config';
const config = db.collection(configKey);

type ChatConfig = { restrictedToAdmins: boolean };

export const getConfigForGroup = async (
  chatId: number
): Promise<ChatConfig | null> => {
  try {
    const record = await config.get(`${chatId}`);
    return record ? record.props.value : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const setConfigForGroup = async (
  chatId: number,
  newConfig: ChatConfig
) => {
  try {
    return await config.set(`${chatId}`, { value: newConfig });
  } catch (e) {
    console.error(e);
  }
};
