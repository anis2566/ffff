import { create } from "zustand";

interface DeleteHomeworkState {
  isOpen: boolean;
  homeworkId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteHomework = create<DeleteHomeworkState>((set) => ({
  isOpen: false,
  homeworkId: "",
  onOpen: (id: string) => set({ isOpen: true, homeworkId: id }),
  onClose: () => set({ isOpen: false, homeworkId: "" }),
}));
