import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewHousePaymentView } from "@/modules/house-payment/ui/views/new-house-payment-view";

export const metadata: Metadata = {
  title: "New House Payment",
  description: "Form to create a new house payment",
};

const NewHousePayment = () => {
  return (
    <ContentLayout>
        <NewHousePaymentView />
    </ContentLayout>
  );
};

export default NewHousePayment;
