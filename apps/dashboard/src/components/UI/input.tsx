import { cn } from "@/utils";
import { cva } from "class-variance-authority";
import type { Input } from "./types";
import { forwardRef } from "react";

const inputVariants = cva(
  [
    "w-full",
    "outline-none border border-gray-3 rounded-md",
    "hover:border-black focus:border-black",
    "transition-all duration-300 ease-in-out",
  ],
  {
    variants: {
      size: {
        small: "px-2 py-1",
        base: "px-4 py-3",
        lg: "px-8 py-4",
      },
      fontSize: {
        xs: "text-body-xs leading-body-xs",
        sm: "text-body-sm leading-body-sm",
        base: "text-body-base leading-body-base",
        lg: "text-body-lg leading-body-lg",
      },
    },
    defaultVariants: {
      size: "base",
      fontSize: "base",
    },
  },
);

const InputText = forwardRef<
  HTMLInputElement,
  Input.TextProps<typeof inputVariants>
>((props: Input.TextProps<typeof inputVariants>, ref) => {
  return (
    <>
      {props.label && props.id && (
        <label
          htmlFor={props.id}
          className={cn("block", "text-heading-4 leading-heading-4 text-black")}
        >
          {props.label}{" "}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        type={props.type || "text"}
        className={inputVariants({
          className: props.className,
          ...props.variants,
        })}
        placeholder={props.placeholder}
        name={props.name}
        id={props.id}
        required={props.required}
        value={props.value}
        onChange={props.onChange}
        title={props.title}
        disabled={props.disabled}
        ref={ref}
      />
    </>
  );
});

const InputCheckbox = forwardRef<
  HTMLInputElement,
  Input.CheckboxProps<typeof inputVariants>
>((props: Input.CheckboxProps<typeof inputVariants>, ref) => {
  return (
    <div className={cn(props.className)}>
      <div className={cn("input-checkbox__container", "inline-block mr-2")}>
        <input
          type="checkbox"
          className={cn("input-checkbox__input")}
          name={props.name}
          id={props.id}
          required={props.required}
          checked={props.checked}
          onChange={props.onChange}
          title={props.title}
          disabled={props.disabled}
          ref={ref}
        />

        <label
          htmlFor={props.id}
          className={cn(
            "input-checkbox__label",
            "!h-6 !w-6",
            inputVariants({
              size: null,
            }),
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("input-checkbox__checkmark", "text-white")}
          >
            <polyline points="21 5 9 18 4 13"></polyline>
          </svg>
        </label>
      </div>

      {props.label && (
        <label
          htmlFor={props.id}
          className={cn("inline-block", "cursor-pointer")}
        >
          {props.label}{" "}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
    </div>
  );
});

const InputComponent = () => null;

// Input compound components
InputComponent.Text = InputText;
InputComponent.Checkbox = InputCheckbox;

export default InputComponent;
