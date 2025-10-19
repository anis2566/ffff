import { EditDocumentForm } from "../form/edit-document-form";

interface EditDocumentViewProps {
  id: string;
}

export default function EditDocumentView({ id }: EditDocumentViewProps) {
  return <EditDocumentForm id={id} />;
}
