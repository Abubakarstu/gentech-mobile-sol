import "server-only";

import { prisma } from "@/lib/prisma";

export async function getActiveLocationTree() {
  return prisma.country.findMany({
    where: { isActive: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      code: true,
      cities: {
        where: { isActive: true },
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          areas: {
            where: { isActive: true },
            orderBy: [{ position: "asc" }, { name: "asc" }],
            select: { id: true, name: true },
          },
        },
      },
    },
  });
}
