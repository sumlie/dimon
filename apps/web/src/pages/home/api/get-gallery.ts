const PAYLOAD_URL = process.env.PAYLOAD_URL ?? "http://localhost:3001";

type PayloadMedia = {
  id: string | number;
  url?: string | null;
  mimeType?: string | null;
};

type PayloadMediaResponse = {
  docs: PayloadMedia[];
};

export async function fetchGalleryPhotos(): Promise<string[]> {
  const folderId = process.env.GALLERY_FOLDER_ID;

  if (!folderId) {
    throw new Error("GALLERY_FOLDER_ID is not configured");
  }

  const params = new URLSearchParams({
    "where[_h_folders][equals]": folderId,
    "where[mimeType][contains]": "image/",
    depth: "0",
    limit: "100",
    sort: "-createdAt",
  });

  const res = await fetch(`${PAYLOAD_URL}/api/media?${params}`, {
    next: {
      revalidate: 300,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch gallery photos: ${res.status} ${res.statusText}`,
    );
  }

  const data = (await res.json()) as PayloadMediaResponse;

  return data.docs
    .map((photo) => {
      if (!photo.url) return null;

      try {
        const url = new URL(photo.url, PAYLOAD_URL);
        const payloadOrigin = new URL(PAYLOAD_URL).origin;

        // Медиа Payload загружается через текущий домен сайта.
        if (
          url.origin === payloadOrigin &&
          url.pathname.startsWith("/api/media/")
        ) {
          return `${url.pathname}${url.search}`;
        }

        // Внешние ссылки оставляем как есть.
        return url.toString();
      } catch {
        return null;
      }
    })
    .filter((url): url is string => url !== null);
}