import { create } from "zustand";

interface CreateSubjectState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateSubject = create<CreateSubjectState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditSubjectState {
  isOpen: boolean;
  subjectId: string;
  session: string;
  name: string;
  level: string;
  group?: string;
  onOpen: (
    subjectId: string,
    session: string,
    name: string,
    level: string,
    group?: string
  ) => void;
  onClose: () => void;
}

export const useEditSubject = create<EditSubjectState>((set) => ({
  isOpen: false,
  subjectId: "",
  session: "",
  name: "",
  level: "",
  group: "",
  onOpen: (
    subjectId: string,
    session: string,
    name: string,
    level: string,
    group?: string
  ) => set({ isOpen: true, subjectId, session, name, level, group }),
  onClose: () =>
    set({ isOpen: false, subjectId: "", session: "", name: "", level: "" }),
}));

interface DeleteSubjectState {
  isOpen: boolean;
  subjectId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteSubject = create<DeleteSubjectState>((set) => ({
  isOpen: false,
  subjectId: "",
  onOpen: (id: string) => set({ isOpen: true, subjectId: id }),
  onClose: () => set({ isOpen: false, subjectId: "" }),
}));
