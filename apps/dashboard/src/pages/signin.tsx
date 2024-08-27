import { Button, Input } from "@/components/UI";
import { authState } from "@/features/auth";
import { store } from "@/routes/__root";
import { cn } from "@/utils";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { type SubmitHandler, useForm } from "react-hook-form";

import DevixLogo from "@/assets/devix-logo.svg";

type FormState = {
  usernameOrEmail: string;
  password: string;
  isRemember: boolean;
};

const SignInPage = () => {
  const navigate = useNavigate({ from: "/signin" });

  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, register, watch } = useForm<FormState>({
    defaultValues: {
      usernameOrEmail: "",
      password: "",
      isRemember: false,
    },
  });

  const onSubmit: SubmitHandler<FormState> = (data) => {
    console.log(data);
    setIsLoading(true);

    setTimeout(() => {
      store.set(authState, (state) => ({
        ...state,
        isAuthenticated: true,
      }));

      navigate({ to: "/dashboard", replace: true }).then(() => {
        setIsLoading(false);
      });
    }, 2500);

    // TODO: Add sign in API call
  };

  return (
    <>
      <Helmet>
        <title>Devix.id - Sign In</title>
      </Helmet>

      <div className={cn("w-full", "flex flex-row items-center")}>
        <div
          className={cn(
            "hidden lg:flex flex-1 items-center justify-center",
            "h-screen bg-black",
          )}
        >
          <DevixLogo className={cn("w-32 h-32")} />
        </div>

        <div
          className={cn(
            "flex flex-col gap-8 flex-1 items-center justify-center",
            "h-screen",
          )}
        >
          <h1>Sign In.</h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn("w-full max-w-[350px]", "p-4")}
          >
            <div className="mb-2">
              <Input.Text
                {...register("usernameOrEmail")}
                id="input-email"
                label="Username / Email Address"
                placeholder="Enter your username or email address"
                title="Enter your username or email address"
                disabled={isLoading}
                required
              />
            </div>

            <div className="mb-4">
              <Input.Text
                {...register("password")}
                type="password"
                id="input-password"
                label="Password"
                placeholder="Enter your password"
                title="Enter your password"
                disabled={isLoading}
                required
              />
            </div>

            <div className={cn("mb-4", "flex flex-row items-center gap-2")}>
              <Input.Checkbox
                {...register("isRemember")}
                id="input-checkbox"
                label="Remember me"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className={cn("w-full")}
              disabled={
                watch("password").length === 0 ||
                watch("usernameOrEmail").length === 0
              }
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
