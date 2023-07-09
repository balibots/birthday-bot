import axios from 'axios';
import { Gender } from './types';
import { set, get } from './cache';

type GenderizeResponse = {
  name: string;
  gender: Gender;
  probability: number;
  count: number;
};

// Gets the gender of a name using https://genderize.io/
export async function getGender(name: string): Promise<Gender> {
  const cached = await get(`name:${name}`);

  if (cached) {
    if (cached === 'male' || cached === 'female') {
      return cached;
    } else if (cached === 'null') {
      return null;
    }
  }

  const url = `https://api.genderize.io/?name=${name}`;

  const response = await axios.get(url);
  const data: GenderizeResponse = response.data;

  await set(`name:${name}`, data.gender ? data.gender : 'null');

  // TODO if probability is < say 70% I'd save null and have some gender neutral messages for these cases

  return data.gender;
}
