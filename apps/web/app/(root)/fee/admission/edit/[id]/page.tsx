import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditAdmissionPaymentForm } from "@/modules/admission-payment/ui/form/edit-admission-payment-form";

export const metadata: Metadata = {
  title: "Edit Admission Payment",
  description: "Form to edit an existing admission payment",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditAdmissionPayment = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.admissionPayment.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditAdmissionPaymentForm id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditAdmissionPayment;
