import { EditTeacherForm } from "../form/edit-teacher-form";

interface EditTeacherViewProps {
  id: string;
}

export const EditTeacherView = ({ id }: EditTeacherViewProps) => {
  return <EditTeacherForm id={id} />;
};
