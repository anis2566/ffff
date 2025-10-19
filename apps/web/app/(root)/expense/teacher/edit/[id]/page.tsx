import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditTeacherPaymentView } from "@/modules/teacher-payment/ui/views/edit-teacher-payment-view";

export const metadata: Metadata = {
  title: "Edit Teacher Payment",
  description: "Form to edit an existing teacher payment",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditTeacherPayment = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.teacherPayment.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditTeacherPaymentView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditTeacherPayment;
