export type GeocodeResult = {
  placeName: string;
  longitude: number;
  latitude: number;
};

type NominatimResult = {
  display_name: string;
  lon: string;
  lat: string;
};

export const geocodeAddress = async (query: string): Promise<GeocodeResult> => {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    throw new Error('Nhập địa chỉ trước khi tìm tọa độ');
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'vn');
  url.searchParams.set('accept-language', 'vi');

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không geocode được địa chỉ từ OpenStreetMap');
  }

  const data = (await response.json()) as NominatimResult[];
  const place = data[0];
  if (!place) {
    throw new Error('Không tìm thấy địa chỉ trên OpenStreetMap');
  }

  return {
    placeName: place.display_name,
    longitude: Number(place.lon),
    latitude: Number(place.lat),
  };
};
