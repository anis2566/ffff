import { create } from "zustand";

interface DeleteStudentAttendanceState {
  isOpen: boolean;
  attendanceId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteStudentAttendance = create<DeleteStudentAttendanceState>(
  (set) => ({
    isOpen: false,
    attendanceId: "",
    onOpen: (id: string) => set({ isOpen: true, attendanceId: id }),
    onClose: () => set({ isOpen: false, attendanceId: "" }),
  })
);
