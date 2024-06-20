import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

type AsyncFunctionType<TArgs extends any[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;

type Operation<TArgs extends any[], TReturn> = (
  tx: Tx
) => AsyncFunctionType<TArgs, TReturn>;

export type Transactable<TFunc extends AsyncFunctionType<any, any>> = TFunc & {
  via: (tx: Tx) => TFunc;
};

export const transactable = <TArgs extends any[], TReturn>(
  operation: Operation<TArgs, TReturn>
): Transactable<AsyncFunctionType<TArgs, TReturn>> => {
  const instant = (...args: TArgs) =>
    prisma.$transaction((tx) => operation(tx)(...args));

  return Object.assign(instant, { via: operation });
};
