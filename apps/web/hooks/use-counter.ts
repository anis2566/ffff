import { create } from "zustand";

interface CreateCounterState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateCounter = create<CreateCounterState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditCounterState {
  isOpen: boolean;
  counterId: string;
  type: string;
  value: string;
  onOpen: (counterId: string, type: string, value: string) => void;
  onClose: () => void;
}

export const useEditCounter = create<EditCounterState>((set) => ({
  isOpen: false,
  counterId: "",
  type: "",
  value: "",
  onOpen: (id: string, type: string, value: string) =>
    set({ isOpen: true, counterId: id, type, value }),
  onClose: () => set({ isOpen: false, counterId: "", type: "", value: "" }),
}));

interface DeleteCounterState {
  isOpen: boolean;
  counterId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteCounter = create<DeleteCounterState>((set) => ({
  isOpen: false,
  counterId: "",
  onOpen: (id: string) => set({ isOpen: true, counterId: id }),
  onClose: () => set({ isOpen: false, counterId: "" }),
}));
