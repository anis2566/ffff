"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/auth/client";
import { Send } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { FormInput } from "@workspace/ui/shared/form-input";
import { FormPasswordInput } from "@workspace/ui/shared/form-password-input";
import { ButtonState, LoadingButton } from "@workspace/ui/shared/loadign-button";

import { Form } from "@workspace/ui/components/form";

import { SignInSchema, SignInSchemaType } from "@workspace/utils/schemas";

export const SignInForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  
  const router = useRouter();

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInSchemaType) => {
    try {
      setButtonState("loading");
      setErrorText("");

      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        console.error("Sign in error:", result.error);
        setErrorText(result.error.message || "Invalid email or password");
        setButtonState("error");
        return;
      }

      setButtonState("success");
      
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);

    } catch (error: any) {
      console.error("Sign in exception:", error);
      setErrorText(error?.message || "Something went wrong");
      setButtonState("error");
    }
  };

  const isPending = buttonState === "loading";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          form={form}
          name="email"
          label="Email"
          type="email"
          disabled={isPending}
        />

        <FormPasswordInput
          form={form}
          name="password"
          label="Password"
          disabled={isPending}
        />

        <LoadingButton
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          loadingText="Signing in..."
          successText="Signed in!"
          errorText={errorText || "Failed"}
          state={buttonState}
          onStateChange={setButtonState}
          className="w-full rounded-full mb-2"
          icon={Send}
          disabled={isPending}
        >
          Sign In
        </LoadingButton>
      </form>
    </Form>
  );
};