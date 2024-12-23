"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { Container } from "@/components/layout/Container/Container";
import { createIncident } from "@/services/incident/createIncident";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import IncidentForm from "@/components/form/IncidentForm";
import { useCallback } from "react";

const formSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;
type FormErrors = Record<string, { message?: string }>;

export default function SignalIncident() {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: 40.34,
      longitude: -73.23,
      description: "",
    },
  });

  const onError = useCallback(
    (errors: FormErrors) => {
      Object.values(errors).forEach((error) => {
        if (error.message) {
          toast({
            variant: "destructive",
            title: "Form submission failed",
            description: error.message,
          });
        }
      });
    },
    [toast]
  );

  const { mutate, status } = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      toast({
        description: "Your incident has been reported successfully.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
      mutate({
          latitude: values.latitude,
          longitude: values.longitude,
          description: values.description,
      });
  };

  return (
    <Container className="p-4 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Report an Incident</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to report a new incident.
          </p>
        </div>
        <IncidentForm
          form={form}
          onSubmit={onSubmit}
          onError={onError}
          isLoading={status === 'pending'}
        />
      </div>
      <Toaster />
    </Container>
  );
}
