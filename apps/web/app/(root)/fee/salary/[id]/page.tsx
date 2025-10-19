import { Metadata } from "next";
import { prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { SalaryPaymentView } from "@/modules/fee/ui/view/salary-payment-view";

export const metadata: Metadata = {
  title: "Salary Payment",
  description: "Make a new salary payment",
};

interface Props {
  params: Promise<{ id: string }>;
}

const SalaryPayment = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.salaryPayment.getOne.queryOptions({ id }));

  return (
    <ContentLayout>
      <SalaryPaymentView id={id} />
    </ContentLayout>
  );
};

export default SalaryPayment;
