import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SignInForm } from "../form/sign-in-form";

export const SignInView = () => {
  return (
    <CardWrapper className="max-w-[600px]">
      <Header
        title="Sign In"
        description="Welcome back! Please sign in to your account."
      />
      <SignInForm />
      <Footer type="signIn" />
    </CardWrapper>
  );
};
