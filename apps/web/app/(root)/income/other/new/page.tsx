import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewOtherPaymentView } from "@/modules/other-payment/ui/views/new-other-payment-view";

export const metadata: Metadata = {
  title: "New Payment",
  description: "Form to create a new payment",
};

const NewOtherPayment = () => {
  return (
    <ContentLayout>
      <NewOtherPaymentView />
    </ContentLayout>
  );
};

export default NewOtherPayment;
