import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

import { SignUpForm } from "../form/sign-up-form";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

export const SignUpView = () => {
  return (
    <CardWrapper className="max-w-[600px]">
      <Header
        title="Sign Up"
        description="Create your account to get started."
      />
      <SignUpForm />
      <Footer type="signUp" />
    </CardWrapper>
  );
};
