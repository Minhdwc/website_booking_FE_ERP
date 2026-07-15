'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type VenueLocationMapProps = {
  longitude: number;
  latitude: number;
};

const osmStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

export const VenueLocationMap = ({ longitude, latitude }: VenueLocationMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: osmStyle,
      center: [longitude, latitude],
      zoom: 15,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const marker = new maplibregl.Marker({ color: '#e11d48' })
      .setLngLat([longitude, latitude])
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    map.on('load', () => {
      map.resize();
    });

    return () => {
      resizeObserver.disconnect();
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    marker.setLngLat([longitude, latitude]);
    map.flyTo({ center: [longitude, latitude], zoom: 15 });
  }, [longitude, latitude]);

  return <div ref={containerRef} className="h-full w-full" />;
};
