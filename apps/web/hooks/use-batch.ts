import { create } from "zustand";

interface DeleteBatchState {
  isOpen: boolean;
  batchId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteBatch = create<DeleteBatchState>((set) => ({
  isOpen: false,
  batchId: "",
  onOpen: (id: string) => set({ isOpen: true, batchId: id }),
  onClose: () => set({ isOpen: false, batchId: "" }),
}));

interface RemoveFromBatchState {
  isOpen: boolean;
  studentId: string;
  batchId: string;
  onOpen: (studentId: string, batchId: string) => void;
  onClose: () => void;
}

export const useRemoveFromBatch = create<RemoveFromBatchState>((set) => ({
  isOpen: false,
  studentId: "",
  batchId: "",
  onOpen: (studentId: string, batchId: string) =>
    set({ isOpen: true, studentId, batchId }),
  onClose: () => set({ isOpen: false, studentId: "", batchId: "" }),
}));

interface CreateBatchClassesState {
  isOpen: boolean;
  times: string[];
  level: string;
  batchId: string;
  onOpen: (times: string[], level: string, batchId: string) => void;
  onClose: () => void;
}

export const useCreateBatchClasses = create<CreateBatchClassesState>((set) => ({
  isOpen: false,
  times: [],
  level: "",
  batchId: "",
  onOpen: (times: string[], level: string, batchId: string) =>
    set({ isOpen: true, times, level, batchId }),
  onClose: () => set({ isOpen: false, times: [], level: "", batchId: "" }),
}));

interface CreateBatchClassState {
  isOpen: boolean;
  time: string;
  day: string;
  level: string;
  batchId: string;
  onOpen: (time: string, day: string, level: string, batchId: string) => void;
  onClose: () => void;
}

export const useCreateBatchClass = create<CreateBatchClassState>((set) => ({
  isOpen: false,
  time: "",
  day: "",
  level: "",
  batchId: "",
  onOpen: (time: string, day: string, level: string, batchId: string) =>
    set({ isOpen: true, time, day, level, batchId }),
  onClose: () =>
    set({ isOpen: false, time: "", day: "", level: "", batchId: "" }),
}));
