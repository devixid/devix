import { cva } from "class-variance-authority";
import { ButtonProps } from "./types";

const buttonVariants = cva(
  ["rounded-md", "disabled:cursor-not-allowed disabled:opacity-50"],
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
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default ButtonComponent;
