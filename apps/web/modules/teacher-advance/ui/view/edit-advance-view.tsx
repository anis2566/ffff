import { EditAdvanceForm } from "../form/edit-advance-form";

interface EditAdvanceViewProps {
  id: string;
}

export const EditAdvanceView = ({ id }: EditAdvanceViewProps) => {
  return <EditAdvanceForm id={id} />;
};
