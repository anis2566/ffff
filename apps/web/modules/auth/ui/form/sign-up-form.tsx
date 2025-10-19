"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/auth/client";
import { useState } from "react";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { FormInput } from "@workspace/ui/shared/form-input";
import { FormPasswordInput } from "@workspace/ui/shared/form-password-input";
import {
  LoadingButton,
  ButtonState,
} from "@workspace/ui/shared/loadign-button";

import { Form } from "@workspace/ui/components/form";

import { SignUpSchema, SignUpSchemaType } from "@workspace/utils/schemas";

export const SignUpForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const router = useRouter();

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpSchemaType) => {
    try {
      setButtonState("loading");
      setErrorText("");

      const result = await authClient.signUp.email({
        name: data.name,
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
          name="name"
          label="Name"
          type="text"
          disabled={isPending}
        />

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
          loadingText="Signing up..."
          successText="Signed up!"
          errorText={errorText || "Failed"}
          state={buttonState}
          onStateChange={setButtonState}
          className="w-full rounded-full mb-2"
          icon={Send}
        >
          Sign up
        </LoadingButton>
      </form>
    </Form>
  );
};
