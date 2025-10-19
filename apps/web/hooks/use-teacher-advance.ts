import { create } from "zustand";

interface AdvanceStatusState {
  isOpen: boolean;
  advanceId: string;
  status: string;
  onOpen: (id: string, status: string) => void;
  onClose: () => void;
}

export const useAdvanceStatus = create<AdvanceStatusState>((set) => ({
  isOpen: false,
  advanceId: "",
  status: "",
  onOpen: (id: string, status: string) =>
    set({ isOpen: true, advanceId: id, status }),
  onClose: () => set({ isOpen: false, advanceId: "", status: "" }),
}));
