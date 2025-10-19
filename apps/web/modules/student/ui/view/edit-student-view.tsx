import { EditStudentFormView } from "../form/edit-student-form";

interface EditStudentViewProps {
  id: string;
}

export const EditStudentView = ({ id }: EditStudentViewProps) => {
  return <EditStudentFormView id={id} />;
};
