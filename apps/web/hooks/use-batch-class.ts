import { create } from "zustand";

interface DeleteBatchClassState {
    isOpen: boolean;
    classId: string;
    batchId: string;
    teacherId?: string;
    onOpen: (id: string, batchId: string, teacherId?: string) => void;
    onClose: () => void;
}

export const useDeleteBatchClass = create<DeleteBatchClassState>((set) => ({
    isOpen: false,
    classId: "",
    batchId: "",
    teacherId: "",
    onOpen: (id: string, batchId: string, teacherId?: string) => set({ isOpen: true, classId: id, batchId, teacherId }),
    onClose: () => set({ isOpen: false, classId: "", batchId: "", teacherId: "" }),
}));