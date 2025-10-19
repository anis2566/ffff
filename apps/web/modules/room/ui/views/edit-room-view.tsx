import { EditRoomForm } from "../form/edit-room-form";

interface EditRoomViewProps {
  id: string;
}

export const EditRoomView = ({ id }: EditRoomViewProps) => {
  return <EditRoomForm id={id} />;
};
