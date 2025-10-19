import { EditExamForm } from "../form/edit-exam-form"

interface EditExamViewProps {
    id: string
}

export const EditExamView = ({ id }: EditExamViewProps) => {
    return <EditExamForm id={id} />
}