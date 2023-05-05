import Session from '../models/Session';
import { middleware, publicProcedure } from '../trpc';

const currentSessionMiddleware = middleware(async ({ ctx, next }) => {
  const token = ctx.req.cookies?.token;

  if (!token) {
    return next();
  }

  const session = await Session.findOne({ token }).populate('userId').lean();
  if (!session?.userId) {
    return next();
  }

  return next({ ctx: { session } });
});

export const currentSessionProcedure = publicProcedure.use(
  currentSessionMiddleware,
);
