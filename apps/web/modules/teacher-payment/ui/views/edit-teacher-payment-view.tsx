import { EditTeacherPaymentFormView } from "../form/edit-teacher-payment-form";

interface EditTeacherPaymentViewProps {
  id: string;
}

export const EditTeacherPaymentView = ({ id }: EditTeacherPaymentViewProps) => {
  return <EditTeacherPaymentFormView id={id} />;
};
