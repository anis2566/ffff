import { create } from "zustand";

interface DeleteResultState {
  isOpen: boolean;
  resultId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteResult = create<DeleteResultState>((set) => ({
  isOpen: false,
  resultId: "",
  onOpen: (id: string) => set({ isOpen: true, resultId: id }),
  onClose: () => set({ isOpen: false, resultId: "" }),
}));

interface ToggleStatusState {
  isOpen: boolean;
  resultId: string;
  status: string;
  onOpen: (id: string, status: string) => void;
  onClose: () => void;
}

export const useToggleResultStatus = create<ToggleStatusState>((set) => ({
  isOpen: false,
  resultId: "",
  status: "",
  onOpen: (id: string, status: string) =>
    set({ isOpen: true, resultId: id, status: status }),
  onClose: () => set({ isOpen: false, resultId: "", status: "" }),
}));
