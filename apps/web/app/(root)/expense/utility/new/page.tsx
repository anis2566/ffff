import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewUtilityPaymentView } from "@/modules/utility-payment/ui/views/new-utility-payment-view";

export const metadata: Metadata = {
  title: "New Utility Payment",
  description: "Form to create a new utility payment",
};

const NewUtilityPayment = () => {
  return (
    <ContentLayout>
      <NewUtilityPaymentView />
    </ContentLayout>
  );
};

export default NewUtilityPayment;
