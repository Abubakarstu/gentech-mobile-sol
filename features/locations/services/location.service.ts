import "server-only";

import { getActiveLocationTree as getActiveLocationTreeRecord } from "../repositories/location.repository";

export async function getActiveLocationTree() {
  try {
    return await getActiveLocationTreeRecord();
  } catch (error) {
    console.warn(
      "[locations] Could not load the active location directory.",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export type LocationTree = Awaited<ReturnType<typeof getActiveLocationTree>>;
