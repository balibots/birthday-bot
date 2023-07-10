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
  const firstName = name.split(/[\s-]/)[0];

  try {
    const cached = (await get(`name:${firstName}`)) as Gender;

    if (cached) {
      if (cached === 'male' || cached === 'female') {
        return cached;
      } else if (cached === 'null') {
        return null;
      }
    }

    const url = `https://api.genderize.io/?name=${firstName}`;

    const response = await axios.get(url);
    const data: GenderizeResponse = response.data;

    if (data.probability >= 0.7) {
      await set(`name:${firstName}`, data.gender || 'null');
      return data.gender;
    } else {
      await set(`name:${firstName}`, 'null');
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}
