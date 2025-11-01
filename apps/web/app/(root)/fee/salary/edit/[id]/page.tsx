import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditSalaryPaymentView } from "@/modules/salary-payment/ui/view/edit-salary-payment-view";

export const metadata: Metadata = {
  title: "Edit Salary Payment",
  description: "Form to edit an existing salary payment",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditSalaryPayment = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.salaryPayment.getOne.queryOptions({ id }));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditSalaryPaymentView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditSalaryPayment;
