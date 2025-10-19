import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewTeacherPaymentView } from "@/modules/teacher-payment/ui/views/new-teacher-payment-view";

export const metadata: Metadata = {
  title: "New Teacher Payment",
  description: "Form to create a new teacher payment",
};

const NewTeacherPayment = () => {
  return (
    <ContentLayout>
      <NewTeacherPaymentView />
    </ContentLayout>
  );
};

export default NewTeacherPayment;
