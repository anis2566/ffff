import { create } from "zustand";

interface CreateClassState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateClass = create<CreateClassState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditClassState {
  isOpen: boolean;
  classId: string;
  session: string;
  name: string;
  level: string;
  position: string;
  onOpen: (
    classId: string,
    session: string,
    name: string,
    level: string,
    position: string
  ) => void;
  onClose: () => void;
}

export const useEditClass = create<EditClassState>((set) => ({
  isOpen: false,
  classId: "",
  session: "",
  name: "",
  level: "",
  position: "",
  onOpen: (classId, session, name, level, position) =>
    set({ isOpen: true, classId, session, name, level, position }),
  onClose: () =>
    set({ isOpen: false, classId: "", session: "", name: "", level: "", position: "" }),
}));

interface DeleteClassState {
  isOpen: boolean;
  classId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteClass = create<DeleteClassState>((set) => ({
  isOpen: false,
  classId: "",
  onOpen: (id: string) => set({ isOpen: true, classId: id }),
  onClose: () => set({ isOpen: false, classId: "" }),
}));
