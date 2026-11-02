const PAYLOAD_URL =
  process.env.PAYLOAD_URL ?? "http://localhost:3001";

export type ContentPage = {
  id: string | number;
  title: string;
  slug: string;
  content: string;
};

type PayloadResponse = {
  docs: ContentPage[];
};

export async function getContentPage(
  slug: string,
): Promise<ContentPage | null> {
  const params = new URLSearchParams({
    "where[slug][equals]": slug,
    "where[status][equals]": "published",
    limit: "1",
    depth: "0",
  });

  const response = await fetch(
    `${PAYLOAD_URL}/api/pages?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Не удалось загрузить страницу: ${response.status}`,
    );
  }

  const data = (await response.json()) as PayloadResponse;

  return data.docs[0] ?? null;
}