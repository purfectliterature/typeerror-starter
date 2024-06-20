"use server";

import prisma from "@/lib/prisma";
import { polytransactable } from "./transactions";
import { revalidatePath } from "next/cache";

export const createUser = polytransactable(
  (tx) => async (name: string, email: string) => {
    const user = await tx.user.create({ data: { name, email } });
    await tx.log.create({ data: { message: `User ${user.id} created` } });
    revalidatePath("/");
    return user;
  }
);

export const duplicateUser = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id } });
    return await createUser.via(tx)(user.name, user.email);
  });
};

export const deleteUser = async (id: number) => {
  const user = await prisma.user.delete({ where: { id } });
  revalidatePath("/");
  return user;
};
