import { create } from "zustand";

interface DeactiveTeacherState {
  isOpen: boolean;
  teacherId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeactiveTeacher = create<DeactiveTeacherState>((set) => ({
  isOpen: false,
  teacherId: "",
  onOpen: (id: string) => set({ isOpen: true, teacherId: id }),
  onClose: () => set({ isOpen: false, teacherId: "" }),
}));

interface ActiveTeacherState {
  isOpen: boolean;
  teacherId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useActiveTeacher = create<ActiveTeacherState>((set) => ({
  isOpen: false,
  teacherId: "",
  onOpen: (id: string) => set({ isOpen: true, teacherId: id }),
  onClose: () => set({ isOpen: false, teacherId: "" }),
}));

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
