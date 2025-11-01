import { create } from "zustand";

interface CreateAdmissionFeeState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateAdmissionFee = create<CreateAdmissionFeeState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditAdmissionFeeState {
  isOpen: boolean;
  feeId: string;
  session: string;
  classNameId: string;
  amount: string;
  onOpen: (
    feeId: string,
    session: string,
    classNameId: string,
    amount: string
  ) => void;
  onClose: () => void;
}

export const useEditAdmissionFee = create<EditAdmissionFeeState>((set) => ({
  isOpen: false,
  feeId: "",
  session: "",
  classNameId: "",
  amount: "",
  onOpen: (
    feeId: string,
    session: string,
    classNameId: string,
    amount: string
  ) => set({ isOpen: true, feeId, session, classNameId, amount }),
  onClose: () =>
    set({ isOpen: false, feeId: "", session: "", classNameId: "", amount: "" }),
}));

interface DeleteAdmissionFeeState {
  isOpen: boolean;
  feeId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteAdmissionFee = create<DeleteAdmissionFeeState>((set) => ({
  isOpen: false,
  feeId: "",
  onOpen: (id: string) => set({ isOpen: true, feeId: id }),
  onClose: () => set({ isOpen: false, feeId: "" }),
}));
