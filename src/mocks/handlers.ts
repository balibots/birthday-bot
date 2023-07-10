import { rest } from 'msw';
import { Gender } from '../types';

export const handlers = [
  rest.get('https://api.genderize.io/', (req, res, ctx) => {
    const params = req.url.searchParams;
    const name = params.get('name') as string;

    const translation: Record<string, Gender> = {
      bernardo: 'male',
      maria: 'female',
      francisca: 'female',
      amelinha: 'female',
      asdfasdf: null,
    };

    const probability: Record<string, number> = {
      bernardo: 1,
      maria: 0.99,
      francisca: 0.71,
      amelinha: 0.69,
      asdfasdf: 0,
    };

    return res(
      ctx.json({
        name,
        gender: translation[name],
        probability: probability[name],
      })
    );
  }),
];
