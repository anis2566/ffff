import { create } from "zustand";

interface DeleteExamState {
  isOpen: boolean;
  examId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteExam = create<DeleteExamState>((set) => ({
  isOpen: false,
  examId: "",
  onOpen: (id: string) => set({ isOpen: true, examId: id }),
  onClose: () => set({ isOpen: false, examId: "" }),
}));

interface PushToDocumentState {
  isOpen: boolean;
  name: string;
  classNameId: string;
  subjectId: string;
  onOpen: (name: string, classNameId: string, subjectId: string) => void;
  onClose: () => void;
}

export const usePushToDocument = create<PushToDocumentState>((set) => ({
  isOpen: false,
  name: "",
  classNameId: "",
  subjectId: "",
  onOpen: (name: string, classNameId: string, subjectId: string) =>
    set({ isOpen: true, name, classNameId, subjectId }),
  onClose: () =>
    set({ isOpen: false, name: "", classNameId: "", subjectId: "" }),
}));
