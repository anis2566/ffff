import { create } from "zustand";

interface DeleteStudentState {
  isOpen: boolean;
  studentId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteStudent = create<DeleteStudentState>((set) => ({
  isOpen: false,
  studentId: "",
  onOpen: (id: string) => set({ isOpen: true, studentId: id }),
  onClose: () => set({ isOpen: false, studentId: "" }),
}));

interface BatchTransferState {
  isOpen: boolean;
  studentId: string;
  batchName: string;
  classNameId: string;
  batchId: string;
  onOpen: (
    studentId: string,
    batchName: string,
    classNameId: string,
    batchId: string
  ) => void;
  onClose: () => void;
}

export const useBatchTransfer = create<BatchTransferState>((set) => ({
  isOpen: false,
  studentId: "",
  batchName: "",
  classNameId: "",
  batchId: "",
  onOpen: (
    studentId: string,
    batchName: string,
    classNameId: string,
    batchId: string
  ) =>
    set({
      isOpen: true,
      studentId,
      batchName: batchName,
      classNameId,
      batchId,
    }),
  onClose: () =>
    set({
      isOpen: false,
      studentId: "",
      batchName: "",
      classNameId: "",
      batchId: "",
    }),
}));

interface MarkAbsentStudentState {
  isOpen: boolean;
  studentId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useMarkAbsentStudent = create<MarkAbsentStudentState>((set) => ({
  isOpen: false,
  studentId: "",
  onOpen: (id: string) => set({ isOpen: true, studentId: id }),
  onClose: () => set({ isOpen: false, studentId: "" }),
}));

interface MarkPesentStudentState {
  isOpen: boolean;
  studentId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useMarkPesentStudent = create<MarkPesentStudentState>((set) => ({
  isOpen: false,
  studentId: "",
  onOpen: (id: string) => set({ isOpen: true, studentId: id }),
  onClose: () => set({ isOpen: false, studentId: "" }),
}));
