import { createFileRoute } from "@tanstack/react-router";
import { Atlas } from "@/components/atlas/Atlas";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Atlas,
});
