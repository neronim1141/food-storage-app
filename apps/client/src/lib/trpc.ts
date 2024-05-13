import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@app/api/src/server';

export const trpc = createTRPCReact<AppRouter>();