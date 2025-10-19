import { create } from "zustand";

interface DeleteTeacherPaymentState {
  isOpen: boolean;
  paymentId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteTeacherPayment = create<DeleteTeacherPaymentState>(
  (set) => ({
    isOpen: false,
    paymentId: "",
    onOpen: (id: string) => set({ isOpen: true, paymentId: id }),
    onClose: () => set({ isOpen: false, paymentId: "" }),
  })
);

interface TeacherPaymentStatusState {
  isOpen: boolean;
  paymentId: string;
  status: string;
  onOpen: (id: string, status: string) => void;
  onClose: () => void;
}

export const useTeacherPaymentStatus = create<TeacherPaymentStatusState>(
  (set) => ({
    isOpen: false,
    paymentId: "",
    status: "",
    onOpen: (id: string, status: string) =>
      set({ isOpen: true, paymentId: id, status }),
    onClose: () => set({ isOpen: false, paymentId: "", status: "" }),
  })
);
