/* eslint-disable @typescript-eslint/no-unused-vars */
import type { VariantProps } from "class-variance-authority";
import type { ClassValue } from "class-variance-authority/types";

export namespace Input {
  interface BaseProps {
    name?: string;
    id?: string;
    type?: React.HTMLInputTypeAttribute;
    className?: ClassValue;
    title?: string;
    disabled?: boolean;
  }

  interface TextProps<Variants> extends BaseProps {
    /**
     * if you declare property `label`, you need to declare `id`
     */
    label?: string;
    required?: boolean;
    placeholder?: string;
    value?: string;
    variants?: VariantProps<Variants>;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  }

  type CheckboxProps<Variants> = Omit<
    TextProps<typeof Variants>,
    "type" | "variants" | "placeholder" | "value"
  > & {
    checked?: boolean;
  };
}

export type ButtonProps<Variants> = Omit<Input.BaseProps, "type"> & {
  type: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onChange?: React.FormEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  variants?: VariantProps<Variants>;
  isLoading?: boolean;
};
