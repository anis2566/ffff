import { CreateAdmissionFeeModal } from "@/modules/admission-fee/ui/modal/create-admission-fee-modal";
import { DeleteAdmisssionFeeModal } from "@/modules/admission-fee/ui/modal/delete-admission-fee-modal";
import { EditAdmissionFeeModal } from "@/modules/admission-fee/ui/modal/edit-admission-fee-modal";
import { DeleteAttendanceModal } from "@/modules/attendance/ui/modal/delete-attendance-modal";
import { AddClassBatchModal } from "@/modules/batch/ui/modal/add-class-batch-modal";
import { AddClassesBatchModal } from "@/modules/batch/ui/modal/add-classes-batch-modal";
import { DeleteBatchClassModal } from "@/modules/batch/ui/modal/delete-batch-class-modal";
import { DeleteBatchModal } from "@/modules/batch/ui/modal/delete-batch-modal";
import { RemoveFromBatchModal } from "@/modules/batch/ui/modal/remove-from-batch-modal";
import { CreateClassModal } from "@/modules/class/ui/modal/create-class-modal";
import { DeleteClassModal } from "@/modules/class/ui/modal/delete-class-modal";
import { EditClassModal } from "@/modules/class/ui/modal/edit-class-modal";
import { CreateCounterModal } from "@/modules/counter/ui/modal/create-counter-modal";
import { DeleteCounterModal } from "@/modules/counter/ui/modal/delete-counter-modal";
import { EditCounterModal } from "@/modules/counter/ui/modal/edit-counter-modal";
import { CreateCategoryModal } from "@/modules/exam-category/ui/modal/create-category-modal";
import { DeleteCategoryModal } from "@/modules/exam-category/ui/modal/delete-category-modal";
import { EditCategoryModal } from "@/modules/exam-category/ui/modal/edit-category-modal";
import { DeleteResultModal } from "@/modules/exam-result/ui/modal/delete-result-modal";
import { ToggleResultStatusModal } from "@/modules/exam-result/ui/modal/toggle-status-modal";
import { DeleteDocumentModal } from "@/modules/exam/ui/modal/delete-document-modal";
import { DeleteExamModal } from "@/modules/exam/ui/modal/delete-exam-modal";
import { PushToDocumentModal } from "@/modules/exam/ui/modal/push-to-document-modal";
import { PushToPrintModal } from "@/modules/exam/ui/modal/push-to-print-modal";
import { ToggleFinishedModal } from "@/modules/exam/ui/modal/toggle-finished-modal";
import { ToggleReceivedModal } from "@/modules/exam/ui/modal/toggle-received-modal";
import { TransactionModal } from "@/modules/salary-payment/ui/transaction-modal";
import { DeleteHomeworkModal } from "@/modules/homework/ui/modal/delete-homework-modal";
import { CreateHouseModal } from "@/modules/house/ui/modal/create-house-modal";
import { DeleteHouseModal } from "@/modules/house/ui/modal/delete-house-modal";
import { EditHouseModal } from "@/modules/house/ui/modal/edit-house-modal";
import { CreateInstituteModal } from "@/modules/institute/ui/modal/create-institute-modal";
import { DeleteInstituteModal } from "@/modules/institute/ui/modal/delete-institute-modal";
import { EditInstituteModal } from "@/modules/institute/ui/modal/edit-institute-modal";
import { CreateIncomeModal } from "@/modules/other-payment/ui/modal/create-other-payment-modal";
import { EditIncomeModal } from "@/modules/other-payment/ui/modal/edit-other-payment-modal";
import { CreatePermissionModal } from "@/modules/permission/ui/modal/create-permission-modal";
import { EditPermissionModal } from "@/modules/permission/ui/modal/edit-permission-modal";
import { CreateRoleModal } from "@/modules/role/ui/modal/create-role-modal";
import { DeleteRoleModal } from "@/modules/role/ui/modal/delete-role-modal";
import { EditRoleModal } from "@/modules/role/ui/modal/edit-role-modal";
import { CreateRoomModal } from "@/modules/room/ui/modal/create-room-modal";
import { DeleteRoomModal } from "@/modules/room/ui/modal/delete-room-modal";
import { EditRoomModal } from "@/modules/room/ui/modal/edit-room-modal";
import { CreateSalaryFeeModal } from "@/modules/salary-fee/ui/modal/create-salary-fee-modal";
import { DeleteSalaryFeeModal } from "@/modules/salary-fee/ui/modal/delete-salary-fee-modal";
import { EditSalaryFeeModal } from "@/modules/salary-fee/ui/modal/edit-salary-fee-modal";
import { BatchTransferModal } from "@/modules/student/ui/modal/batch-transfer-modal";
import { DeleteStudentModal } from "@/modules/student/ui/modal/delete-student-modal";
import { MarkAsAbsentModal } from "@/modules/student/ui/modal/mark-as-absent-modal";
import { MarkAsPresentModal } from "@/modules/student/ui/modal/mark-as-present-modal";
import { CreateSubjectModal } from "@/modules/subject/ui/modal/create-subject-modal";
import { DeleteSubjectModal } from "@/modules/subject/ui/modal/delete-subject-modal";
import { EditSubjectModal } from "@/modules/subject/ui/modal/edit-subject-modal";
import { DeletePrintTaskModal } from "@/modules/task/ui/modal/delete-print-task-modal";
import { TogglePrntTaskStatusModal } from "@/modules/task/ui/modal/toggle-status-modal";
import { AdvanceStatusModal } from "@/modules/teacher-advance/ui/modal/advance-status-modal";
import { DeleteTeacherPaymentModal } from "@/modules/teacher-payment/ui/modal/delete-teacher-payment-modal";
import { TeacherPaymentStatusModal } from "@/modules/teacher-payment/ui/modal/payment-status-modal";
import { ActiveTeacherModal } from "@/modules/teacher/ui/modal/active-teacher-modal";
import { DeactiveTeacherModal } from "@/modules/teacher/ui/modal/deactive-teacher-modal";
import { DeleteTeacherModal } from "@/modules/teacher/ui/modal/delete-teacher-modal";
import { ChangeRoleModal } from "@/modules/user/ui/modal/change-role-modal";
import { DeleteUserModal } from "@/modules/user/ui/modal/delete-user-modal";

export const ModalProvider = () => {
  return (
    <>
      <CreateClassModal />
      <EditClassModal />
      <DeleteClassModal />
      <CreateSubjectModal />
      <EditSubjectModal />
      <DeleteSubjectModal />
      <CreateCounterModal />
      <EditCounterModal />
      <DeleteCounterModal />
      <CreateAdmissionFeeModal />
      <EditAdmissionFeeModal />
      <DeleteAdmisssionFeeModal />
      <CreateSalaryFeeModal />
      <EditSalaryFeeModal />
      <DeleteSalaryFeeModal />
      <CreateInstituteModal />
      <EditInstituteModal />
      <DeleteInstituteModal />
      <DeleteTeacherModal />
      <DeleteHouseModal />
      <DeleteRoomModal />
      <DeleteBatchModal />
      <RemoveFromBatchModal />
      <TransactionModal />
      <AddClassBatchModal />
      <AddClassesBatchModal />
      <DeleteBatchClassModal />
      <DeleteStudentModal />
      <AdvanceStatusModal />
      <DeleteTeacherPaymentModal />
      <TeacherPaymentStatusModal />
      <DeleteAttendanceModal />
      <DeleteHomeworkModal />
      <CreateCategoryModal />
      <EditCategoryModal />
      <DeleteCategoryModal />
      <DeleteExamModal />
      <DeleteResultModal />
      <BatchTransferModal />
      <MarkAsAbsentModal />
      <MarkAsPresentModal />
      <DeleteDocumentModal />
      <ToggleReceivedModal />
      <ToggleFinishedModal />
      <PushToDocumentModal />
      <PushToPrintModal />
      <TogglePrntTaskStatusModal />
      <DeletePrintTaskModal />
      <CreateRoleModal />
      <EditRoleModal />
      <DeleteRoleModal />
      <CreatePermissionModal />
      <EditPermissionModal />
      <ChangeRoleModal />
      <DeleteUserModal />
      <CreateHouseModal />
      <EditHouseModal />
      <CreateRoomModal />
      <EditRoomModal />
      <EditCounterModal />
      <ToggleResultStatusModal />
      <DeactiveTeacherModal />
      <ActiveTeacherModal />
      <CreateIncomeModal />
      <EditIncomeModal />
    </>
  );
};
