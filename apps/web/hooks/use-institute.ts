import { create } from "zustand";

interface CreateInstituteState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateInstitute = create<CreateInstituteState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditInstituteState {
  isOpen: boolean;
  instituteId: string;
  type: string;
  name: string;
  onOpen: (instituteId: string, type: string, name: string) => void;
  onClose: () => void;
}

export const useEditInstitute = create<EditInstituteState>((set) => ({
  isOpen: false,
  instituteId: "",
  type: "",
  name: "",
  onOpen: (id: string, type: string, name: string) =>
    set({ isOpen: true, instituteId: id, type, name }),
  onClose: () => set({ isOpen: false, instituteId: "", type: "", name: "" }),
}));

interface DeleteInstituteState {
  isOpen: boolean;
  instituteId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteInstitute = create<DeleteInstituteState>((set) => ({
  isOpen: false,
  instituteId: "",
  onOpen: (id: string) => set({ isOpen: true, instituteId: id }),
  onClose: () => set({ isOpen: false, instituteId: "" }),
}));
