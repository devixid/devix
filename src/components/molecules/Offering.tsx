import { Text } from "@/components/atoms";
import { cn } from "@/utils";

export default function Offering() {
  return (
    <div
      className="mx-auto flex size-full flex-col items-start gap-y-10 bg-black text-white md:items-start md:p-10"
      id="scrollDown"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-y-10 bg-black p-10 text-white md:items-start">
        <Text.span
          className={cn(
            "mb-10 mt-28 max-w-5xl text-center text-[40px] font-light leading-tight md:text-left md:text-6xl",
          )}
          resetStyle
        >
          We understand that every business has different needs.
        </Text.span>
        <Text.span
          className={cn(
            "mx-auto mb-10 max-w-5xl text-center text-[40px] font-light leading-tight md:mx-0 md:text-left md:text-6xl",
          )}
          resetStyle
        >
          Therefore,
        </Text.span>
        <Text.span
          className={cn(
            "max-w-5xl text-center text-[40px] font-light leading-tight md:mx-0 md:text-left md:text-6xl",
          )}
          resetStyle
        >
          we offer website creation that can be tailored to your needs.
        </Text.span>
      </div>
    </div>
  );
}
