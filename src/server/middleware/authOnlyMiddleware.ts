import { TRPCError } from '@trpc/server';
import { middleware } from '../trpc';
import { currentSessionProcedure } from './currentSessionMiddleware';

const authOnlyMiddleware = middleware(async ({ ctx, next }) => {
  const { session } = ctx;

  if (!session?.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User Not logged in',
    });
  }

  return next();
});

export const authOnlyProcedure =
  currentSessionProcedure.use(authOnlyMiddleware);
