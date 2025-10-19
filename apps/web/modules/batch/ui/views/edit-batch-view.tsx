import { EditBatchForm } from "../form/edit-batch-form";

interface EditBatchViewProps {
  id: string;
}

export const EditBatchView = ({ id }: EditBatchViewProps) => {
  return <EditBatchForm id={id} />;
};
