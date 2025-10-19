import { EditHouseForm } from "../form/edit-house-form";

interface EditHouseViewProps {
  id: string;
}

export const EditHouseView = ({ id }: EditHouseViewProps) => {
  return <EditHouseForm id={id} />;
};
