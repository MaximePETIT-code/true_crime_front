"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import EventActivity from "../eventActivity/EventActivity";
import MapView from "../mapView/MapView";
import { fetchCrimes } from "@/services/crimes/fetchCrimes";
import type { Viewport, Crime } from "@/types/crimes";
import { useAuth } from "@/providers/AuthProvider";
import { Marker } from "react-map-gl";
import Pin from "../mapView/Pin";
import { useDateRange } from "@/providers/DateRangeProvider";
import { format } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";

export default function MapContainer({
  selectedDate,
  setSelectedDate,
  dates,
  className,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dates: { startDate: string; endDate: string };
  className: string;
}) {
  const { user } = useAuth();
  // const { dates } = useDateRange();
  // const [selectedDate, setSelectedDate] = useState<Date>(
  //   new Date(dates.endDate)
  // );

  const [viewport, setViewport] = useState<Viewport>({
    longitude: -73.955242,
    latitude: 40.72061,
    zoom: 12,
  });

  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
  const [hoveredCrime, setHoveredCrime] = useState<Crime | null>(null);

  const [debouncedViewport, setDebouncedViewport] = useState(viewport);
  const previousPinsRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedViewport(viewport);
    }, 1000);
    return () => clearTimeout(handler);
  }, [viewport]);

  useEffect(() => {
    if (selectedCrime) {
      setViewport({
        ...viewport,
        longitude: selectedCrime.longitude,
        latitude: selectedCrime.latitude,
        zoom: 15,
      });
    }
  }, [selectedCrime]);

  const {
    data: crimes,
    isFetching,
  } = useQuery({
    queryKey: [
      "crimes",
      debouncedViewport.longitude,
      debouncedViewport.latitude,
      selectedDate.toISOString(),
    ],
    queryFn: () =>
      fetchCrimes(
        {
          longitude: debouncedViewport.longitude,
          lattitude: debouncedViewport.latitude,
          zoom: debouncedViewport.zoom,
          rangeStartDate: format(selectedDate, "yyyy-MM-dd"),
          rangeEndDate: format(selectedDate, "yyyy-MM-dd"),
        },
        user?.token
      ),
    enabled:
      !!user?.token &&
      selectedDate >= new Date(dates.startDate) &&
      selectedDate <= new Date(dates.endDate),
    initialData: { crimes: [] },
  });

  const previousData = useRef(crimes);

  useEffect(() => {
    if (!isFetching) {
      previousData.current = crimes;
    }
  }, [crimes, isFetching]);

  const pins = useMemo(() => {
    const currentData = isFetching ? previousData.current : crimes;
    const markers = currentData?.crimes?.map((crime) => (
      <Marker
        key={`marker-${crime.id}`}
        longitude={crime.longitude}
        latitude={crime.latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setSelectedCrime(crime);
        }}
      >
        <Pin
          active={
            crime.id === selectedCrime?.id || crime.id === hoveredCrime?.id
          }
        />
      </Marker>
    ));

    if (!markers) {
      return previousPinsRef.current;
    }

    previousPinsRef.current = markers;
    return markers;
  }, [crimes, hoveredCrime, selectedCrime]);

  return (
    <>
      <MapView
        className={className}
        viewport={viewport}
        setViewport={setViewport}
        pins={pins}
        crimes={crimes}
        selectedCrime={selectedCrime}
        hoveredCrime={hoveredCrime}
        onCrimeSelect={setSelectedCrime}
        onCrimeHover={setHoveredCrime}
      />
      <EventActivity
        crimes={crimes}
        selectedCrime={selectedCrime}
        hoveredCrime={hoveredCrime}
        onCrimeSelect={setSelectedCrime}
        onCrimeHover={setHoveredCrime}
      />
    </>
  );
}
