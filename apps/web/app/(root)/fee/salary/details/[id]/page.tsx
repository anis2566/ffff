import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { SalaryPaymentDetialsView } from "@/modules/salary-payment/ui/view/salary-payment-details-view";

export const metadata: Metadata = {
  title: "Salary Payment Details",
  description: "Salary payment details",
};

interface Props {
  params: Promise<{ id: string }>;
}

const SalaryPayment = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.salaryPayment.getOne.queryOptions({ id }));

  return (
    <ContentLayout>
      <HydrateClient>
        <SalaryPaymentDetialsView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default SalaryPayment;
