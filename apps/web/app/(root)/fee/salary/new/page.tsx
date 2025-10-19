import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewSalaryView } from "@/modules/fee/ui/view/new-salary-view";

export const metadata: Metadata = {
  title: "Income | New Salary",
  description: "Make a new salary payment",
};

const NewSalary = async () => {
  return (
    <ContentLayout>
      <NewSalaryView />
    </ContentLayout>
  );
};

export default NewSalary;
