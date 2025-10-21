import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import {
  FieldSeparator,
  Field,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field";

interface FooterProps {
  type: "signIn" | "signUp";
}

export const Footer = ({ type }: FooterProps) => {
  return (
    <FieldGroup>
      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-2">
        Or continue with
      </FieldSeparator>
      <Field className="grid grid-cols-2 gap-4">
        <Button variant="outline" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          <span className="sr-only">Continue with Google</span>
        </Button>
        <Button variant="outline" type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="bi bi-facebook"
            viewBox="0 0 16 16"
          >
            <path d="M8.051 8.634H6.615V16H4.077V8.634H2.5V6.29h1.577V4.672c0-1.31.623-3.356 3.356-3.356l2.462.01v2.74h-1.79c-.293 0-.71.147-.71.778v1.446h2.5l-.293 2.344H8.051Z" />
          </svg>
          <span className="sr-only">Continue with Meta</span>
        </Button>
      </Field>
      <FieldDescription className="text-center">
        {type === "signUp"
          ? "Already have an account? "
          : "Don't have an account? "}
        <Link href={type === "signUp" ? "/auth/sign-in" : "/auth/sign-up"}>
          {type === "signUp" ? "Sign In" : "Sign Up"}
        </Link>
      </FieldDescription>
    </FieldGroup>
  );
};
