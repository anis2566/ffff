import { create } from "zustand";

interface DeleteTeacherState {
  isOpen: boolean;
  teacherId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteTeacher = create<DeleteTeacherState>((set) => ({
  isOpen: false,
  teacherId: "",
  onOpen: (id: string) => set({ isOpen: true, teacherId: id }),
  onClose: () => set({ isOpen: false, teacherId: "" }),
}));
