import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CDEK_API_URL = "https://api.cdek.ru/v2";

type CdekTokenResponse = {
  access_token?: string;
};

type CdekApiPoint = {
  code?: string;
  name?: string;
  location?: {
    address?: string;
    address_full?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
};

export async function GET(request: Request) {
  const clientId = process.env.CDEK_CLIENT_ID;
  const clientSecret = process.env.CDEK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Интеграция СДЭК не настроена." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country") ?? "BY";

  if (!["BY", "RU"].includes(countryCode)) {
    return NextResponse.json(
      { error: "Неподдерживаемая страна доставки." },
      { status: 400 },
    );
  }

  try {
    const tokenResponse = await fetch(`${CDEK_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      console.error("CDEK: ошибка авторизации", tokenResponse.status);

      return NextResponse.json(
        { error: "Не удалось подключиться к СДЭК." },
        { status: 502 },
      );
    }

    const tokenData = (await tokenResponse.json()) as CdekTokenResponse;

    if (!tokenData.access_token) {
      console.error("CDEK: access_token отсутствует в ответе");

      return NextResponse.json(
        { error: "Не удалось подключиться к СДЭК." },
        { status: 502 },
      );
    }

    const params = new URLSearchParams({
      country_code: countryCode,
      type: "PVZ",
    });

    const pointsResponse = await fetch(
      `${CDEK_API_URL}/deliverypoints?${params}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!pointsResponse.ok) {
      console.error("CDEK: ошибка загрузки ПВЗ", pointsResponse.status);

      return NextResponse.json(
        { error: "Не удалось загрузить пункты выдачи." },
        { status: 502 },
      );
    }

    const data: unknown = await pointsResponse.json();

    if (!Array.isArray(data)) {
      console.error("CDEK: неожиданный формат списка ПВЗ");

      return NextResponse.json(
        { error: "СДЭК вернул некорректный ответ." },
        { status: 502 },
      );
    }

    const points = (data as CdekApiPoint[])
      .map((point) => {
        const location = point.location;

        const address =
          location?.address_full ||
          [location?.city, location?.address].filter(Boolean).join(", ");

        if (
          !point.code ||
          !address ||
          typeof location?.latitude !== "number" ||
          typeof location?.longitude !== "number" ||
          !Number.isFinite(location.latitude) ||
          !Number.isFinite(location.longitude)
        ) {
          return null;
        }

        return {
          code: point.code,
          name: point.name ?? "",
          address,
          latitude: location.latitude,
          longitude: location.longitude,
        };
      })
      .filter((point) => point !== null);

    return NextResponse.json({ points });
  } catch (error) {
    console.error("CDEK: ошибка запроса", error);

    return NextResponse.json(
      { error: "Сервис СДЭК временно недоступен." },
      { status: 502 },
    );
  }
}