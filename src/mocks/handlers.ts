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
      asdfasdf: null,
    };

    return res(ctx.json({ name, gender: translation[name] }));
  }),
];
