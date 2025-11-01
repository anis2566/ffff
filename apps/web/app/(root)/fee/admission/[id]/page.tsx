import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { EditAdmissionPaymentView } from "@/modules/admission-payment/ui/view/edit-admission-payment-view";

export const metadata: Metadata = {
  title: "Update Fee",
  description: "Form to edit an existing admission fee",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditFee = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.admissionPayment.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditAdmissionPaymentView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditFee;
