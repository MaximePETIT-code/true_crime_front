import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { FieldValues, UseFormReturn, FieldErrors, Path, PathValue } from "react-hook-form";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { config } from "@/lib/config";

interface Field<V> {
  label: string;
  type: string;
  id: string;
  placeholder: string;
  name: Path<V>;
}

interface IncidentFormProps<V extends FieldValues> {
  form: UseFormReturn<V>;
  onSubmit: (values: V) => void;
  onError: (errors: FieldErrors<V>) => void;
  isLoading: boolean;
}

const NYC_BOUNDS = {
  north: 40.917577,
  south: 40.477399,
  east: -73.700272,
  west: -74.25909,
};

export default function IncidentForm<V extends FieldValues>({
  form,
  onSubmit,
  onError,
  isLoading,
}: IncidentFormProps<V>) {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: config.googleMaps,
    libraries: ["places"],
  });

  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      if (lat && lng) {
        // Check if coordinates are within NYC bounds
        if (
          lat >= NYC_BOUNDS.south &&
          lat <= NYC_BOUNDS.north &&
          lng >= NYC_BOUNDS.west &&
          lng <= NYC_BOUNDS.east
        ) {
          form.setValue("latitude" as Path<V>, lat as PathValue<V, Path<V>>);
          form.setValue("longitude" as Path<V>, lng as PathValue<V, Path<V>>);
        } else {
          form.setError("address" as Path<V>, {
            type: "manual",
            message: "Address must be within New York City",
          });
        }
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        {isLoaded ? (
          <Autocomplete
            onLoad={setAutocomplete}
            onPlaceChanged={onPlaceSelected}
            bounds={
              new google.maps.LatLngBounds(
                { lat: NYC_BOUNDS.south, lng: NYC_BOUNDS.west },
                { lat: NYC_BOUNDS.north, lng: NYC_BOUNDS.east }
              )
            }
            restrictions={{ country: "us" }}
          >
            <Input
              id="address"
              type="text"
              placeholder="Enter a location in NYC"
              className="w-full"
            />
          </Autocomplete>
        ) : (
          <Input disabled placeholder="Loading..." />
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe what happened"
          className="min-h-[100px]"
          {...form.register("description" as Path<V>)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
}
