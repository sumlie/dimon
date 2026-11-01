"use client";

import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup as MapPopup,
  TileLayer,
  useMap,
} from "react-leaflet";

export type CdekPoint = {
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type CdekCountry = "BY" | "RU";

type CdekMapProps = {
  country: CdekCountry;
  onChoose: (point: CdekPoint) => void;
};

const COUNTRY_CENTERS: Record<CdekCountry, [number, number]> = {
  BY: [53.9, 27.56],
  RU: [55.75, 37.62],
};

function ChangeMapCenter({ country }: { country: CdekCountry }) {
  const map = useMap();

  useEffect(() => {
    map.setView(COUNTRY_CENTERS[country], 6);
  }, [country, map]);

  return null;
}

export default function CdekWidget({
  country,
  onChoose,
}: CdekMapProps) {
  const [points, setPoints] = useState<CdekPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPoints() {
      setLoading(true);
      setError(null);
      setPoints([]);

      try {
        const params = new URLSearchParams({ country });

        const response = await fetch(`/api/cdek/points?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = (await response.json()) as {
          points?: CdekPoint[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            data.error ?? "Не удалось загрузить пункты СДЭК.",
          );
        }

        if (!controller.signal.aborted) {
          setPoints(data.points ?? []);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Не удалось загрузить пункты СДЭК.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPoints();

    return () => controller.abort();
  }, [country]);

  return (
    <div>
      {loading && (
        <p className="mb-3 font-sans text-sm lowercase text-black/50">
          загружаем пункты выдачи...
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 border-l-2 border-red-600 pl-3 font-sans text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {!loading && !error && points.length === 0 && (
        <p className="mb-3 font-sans text-sm text-black/50">
          пункты выдачи не найдены
        </p>
      )}

      <div className="relative z-0 h-[350px] overflow-hidden border border-black/20 sm:h-[450px]">
        <MapContainer
          center={COUNTRY_CENTERS[country]}
          zoom={6}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <ChangeMapCenter country={country} />

          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {points.map((point) => (
            <CircleMarker
              key={point.code}
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
                  {point.name && (
                    <p className="font-bold">{point.name}</p>
                  )}

                  <p className="mt-1">{point.address}</p>

                  <button
                    type="button"
                    onClick={() => onChoose(point)}
                    className="mt-3 w-full bg-black px-3 py-2 text-sm text-white"
                  >
                    выбрать пункт
                  </button>
                </div>
              </MapPopup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}