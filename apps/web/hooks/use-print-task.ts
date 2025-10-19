import { create } from "zustand";

interface DeletePrintTaskState {
  isOpen: boolean;
  taskId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeletePrintTask = create<DeletePrintTaskState>((set) => ({
  isOpen: false,
  taskId: "",
  onOpen: (id: string) => set({ isOpen: true, taskId: id }),
  onClose: () => set({ isOpen: false, taskId: "" }),
}));

interface TogglePrintTaskState {
  isOpen: boolean;
  taskId: string;
  status: string;
  onOpen: (id: string, status: string) => void;
  onClose: () => void;
}

export const useTogglePrintTask = create<TogglePrintTaskState>((set) => ({
  isOpen: false,
  taskId: "",
  status: "",
  onOpen: (id: string, status: string) =>
    set({ isOpen: true, taskId: id, status: status }),
  onClose: () => set({ isOpen: false, taskId: "", status: "" }),
}));
