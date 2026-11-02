"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup as MapPopup,
  TileLayer,
  useMap,
} from "react-leaflet";

type Country = "BY" | "RU";

export type CdekPoint = {
  // В OpenStreetMap официального кода ПВЗ может не быть.
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

type CdekWidgetProps = {
  country: Country;
  onChoose: (point: CdekPoint) => void;
};

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type MapPoint = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

const COUNTRY_CENTERS: Record<Country, [number, number]> = {
  BY: [53.9, 27.56],
  RU: [55.75, 37.62],
};

// Публичный Overpass-сервер VK Maps.
// Это внешний сервис, поэтому временные ошибки возможны.
const OVERPASS_URL =
  "https://overpass.private.coffee/api/interpreter";

const MIN_ZOOM = 12;

function formatAddress(tags: Record<string, string>): string {
  const city =
    tags["addr:city"] ||
    tags["addr:town"] ||
    tags["addr:village"] ||
    "";

  const street = tags["addr:street"] || "";
  const house = tags["addr:housenumber"] || "";

  const streetAddress = [street, house]
    .filter(Boolean)
    .join(", ");

  return [city, streetAddress]
    .filter(Boolean)
    .join(", ");
}

function PointsLayer({
  onChoose,
}: {
  onChoose: CdekWidgetProps["onChoose"];
}) {
  const map = useMap();
  const abortRef = useRef<AbortController | null>(null);

  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const loadPoints = async () => {
    if (map.getZoom() < MIN_ZOOM) {
      setMessage(
        "Приблизь карту к своему городу, чтобы найти пункты.",
      );
      return;
    }

    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    let timedOut = false;

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    const bounds = map.getBounds();

    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    // Координаты берутся из Leaflet, а не из пользовательского ввода.
    const bbox = [south, west, north, east]
      .map((value) => value.toFixed(6))
      .join(",");

    const query = `
      [out:json][timeout:25];
      (
        nwr["office"="logistics"]["name"~"сдэк|сдек|cdek",i](${bbox});
        nwr["office"="logistics"]["operator"~"сдэк|сдек|cdek",i](${bbox});
        nwr["amenity"="parcel_locker"]["operator"~"сдэк|сдек|cdek",i](${bbox});
        nwr["shop"="parcel_pickup"]["brand"~"сдэк|сдек|cdek",i](${bbox});
      );
      out center tags;
    `;

    setLoading(true);
    setMessage(null);
    setPoints([]);

    try {
      const response = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams({
          data: query,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const details = await response.text();

        console.warn("Ошибка Overpass API:", {
          status: response.status,
          statusText: response.statusText,
          details: details.slice(0, 1000),
        });

        throw new Error(
          `Не удалось загрузить пункты: HTTP ${response.status}`,
        );
      }
      const data: unknown = await response.json();

      if (
        !data ||
        typeof data !== "object" ||
        !("elements" in data) ||
        !Array.isArray(data.elements)
      ) {
        throw new Error("Не удалось прочитать ответ карты.");
      }

      const nextPoints: MapPoint[] = [];

      for (const rawElement of data.elements) {
        const element = rawElement as OsmElement;
        const tags = element.tags ?? {};

        const latitude =
          element.type === "node"
            ? element.lat
            : element.center?.lat;

        const longitude =
          element.type === "node"
            ? element.lon
            : element.center?.lon;

        if (
          typeof latitude !== "number" ||
          !Number.isFinite(latitude) ||
          typeof longitude !== "number" ||
          !Number.isFinite(longitude)
        ) {
          continue;
        }

        nextPoints.push({
          id: `${element.type}-${element.id}`,
          name: tags.name || "СДЭК",
          address: formatAddress(tags),
          latitude,
          longitude,
        });
      }

      if (controller.signal.aborted) return;

      setPoints(nextPoints);

      if (nextPoints.length === 0) {
        setMessage(
          "На этом участке карты пункты не найдены. Попробуй переместить карту или введи адрес вручную.",
        );
      }
    } catch (error) {
      if (timedOut) {
        setMessage(
          "Карта не ответила вовремя. Попробуй ещё раз или введи адрес вручную.",
        );
        return;
      }

      // Запрос отменён при закрытии карты или новом поиске.
      if (controller.signal.aborted) return;

      console.warn("OpenStreetMap points error:", error);

      setMessage(
        "Не удалось загрузить пункты. Попробуй ещё раз или введи адрес вручную.",
      );
    } finally {
      window.clearTimeout(timeoutId);

      // Не отключаем загрузку более нового запроса.
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control m-3">
          <button
            type="button"
            onClick={() => void loadPoints()}
            disabled={loading}
            className="border border-black bg-white px-3 py-2 font-sans text-xs font-bold lowercase text-black transition-colors hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "загружаем..." : "показать пункты"}
          </button>
        </div>
      </div>

      {message && (
        <div className="leaflet-bottom leaflet-left">
          <div className="leaflet-control m-3 max-w-64 border border-black/20 bg-white px-3 py-2 font-sans text-xs leading-relaxed text-black">
            {message}
          </div>
        </div>
      )}

      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.latitude, point.longitude]}
          radius={6}
          pathOptions={{
            color: "#000000",
            fillColor: "#dc2626",
            fillOpacity: 1,
            weight: 1,
          }}
        >
          <MapPopup>
            <div className="min-w-40 font-sans">
              <p className="font-bold">{point.name}</p>

              <p className="mt-1">
                {point.address ||
                  "Адрес не указан в OpenStreetMap"}
              </p>

              {point.address ? (
                <button
                  type="button"
                  onClick={() => {
                    onChoose({
                      // Не выдаём идентификатор OSM за код СДЭК.
                      code: "",
                      name: point.name,
                      address: point.address,
                      latitude: point.latitude,
                      longitude: point.longitude,
                    });

                    map.closePopup();
                  }}
                  className="mt-3 w-full bg-black px-3 py-2 text-sm text-white"
                >
                  выбрать пункт
                </button>
              ) : (
                <p className="mt-2 text-xs text-black/60">
                  Укажи адрес этого пункта вручную.
                </p>
              )}
            </div>
          </MapPopup>
        </CircleMarker>
      ))}
    </>
  );
}

export default function CdekWidget({
  country,
  onChoose,
}: CdekWidgetProps) {
  return (
    <div>
      <p className="mb-3 font-sans text-xs leading-relaxed text-black/50">
        приблизь карту к своему городу и нажми «показать пункты».
        данные могут быть неполными — проверь адрес перед выбором.
      </p>

      <div className="relative z-0 h-[350px] overflow-hidden border border-black/20 sm:h-[450px]">
        <MapContainer
          key={country}
          center={COUNTRY_CENTERS[country]}
          zoom={6}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <PointsLayer onChoose={onChoose} />
        </MapContainer>
      </div>

      <p className="mt-2 font-sans text-xs leading-relaxed text-black/40">
        если нужного пункта нет на карте, введи его адрес вручную
        ниже.
      </p>
    </div>
  );
}