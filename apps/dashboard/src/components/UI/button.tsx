import { cn } from "@/utils";
import { cva } from "class-variance-authority";
import { LoaderCircleIcon } from "lucide-react";
import { ButtonProps } from "./types";

const buttonVariants = cva(
  ["rounded-md", "transition-all duration-200 ease-in-out"],
  {
    variants: {
      variant: {
        default: ["bg-black text-white", "hover:bg-gray focus:bg-gray"],
      },
      size: {
        base: "px-4 py-3",
        lg: "px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "base",
    },
  },
);

const ButtonComponent = (props: ButtonProps<typeof buttonVariants>) => {
  return (
    <button
      title={props.title}
      name={props.name}
      id={props.id}
      type={props.type || "button"}
      className={buttonVariants({
        className: props.className,
        ...props.variants,
      })}
      disabled={props.disabled || props.isLoading}
    >
      {props.isLoading ? (
        <LoaderCircleIcon
          className={cn("animate-spin", "h-5 w-5", "inline-block mx-auto")}
        />
      ) : (
        <>{props.children}</>
      )}
    </button>
  );
};

export default ButtonComponent;
