import { RequestHandler } from 'express';

export const requireKey: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;

  if (auth !== `Bearer ${process.env.SECRET_ADMIN_KEY}`) {
    res.status(403).json({ error: 'Authorization needed' });
  } else {
    next();
  }
};
