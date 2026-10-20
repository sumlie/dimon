import { trpc } from "@/shared/api/trpc";

export async function getSubscriberCount(): Promise<number | null> {
  try {
    return await trpc.subscribers.count.query();
  } catch (e) {
    console.error("subscribers fetch failed", e);
    return null;
  }
}
