import { EditSalaryPaymentForm } from "../form/edit-salary-payment-form"

interface EditSalaryPaymentProps {
    id: string
}

export const EditSalaryPaymentView = ({ id }: EditSalaryPaymentProps) => {
    return <EditSalaryPaymentForm id={id} />
}