import axios from 'axios';
import { Gender } from './types';

type GenderizeResponse = {
  name: string;
  gender: Gender;
  probability: number;
  count: number;
};

// Gets the gender of a name using https://genderize.io/
export async function getGender(name: string): Promise<Gender> {
  const url = `https://api.genderize.io/?name=${name}`;

  const response = await axios.get(url);
  const data: GenderizeResponse = response.data;

  return data.gender;
}
