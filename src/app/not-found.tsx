import { Heading } from "@/components";
import { cn } from "@/utils";

export default function NotFound() {
  return (
    <div
      className={cn(
        "container flex h-[80vh] flex-col items-center justify-center sm:mt-20",
      )}
    >
      <div className="overflow-hidden pt-1">
        <Heading.h1
          initial={{
            translateY: 50,
          }}
          animate={{
            translateY: 0,
          }}
        >
          Not found
        </Heading.h1>
      </div>
    </div>
  );
}
