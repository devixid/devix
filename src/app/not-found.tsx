import { Heading } from "@/components";
import { cn } from "@/utils";

export default function NotFound() {
  return (
    <div
      className={cn(
        "container flex h-[80vh] flex-col items-center justify-center sm:mt-20",
      )}
    >
      <Heading as="h1">Not found</Heading>
    </div>
  );
}
