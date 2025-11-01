import { create } from "zustand";

interface CreateSalaryFeeState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateSalaryFee = create<CreateSalaryFeeState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditSalaryFeeState {
  isOpen: boolean;
  feeId: string;
  session: string;
  classNameId: string;
  amount: string;
  group?: string;
  onOpen: (
    feeId: string,
    session: string,
    classNameId: string,
    amount: string,
    group?: string
  ) => void;
  onClose: () => void;
}

export const useEditSalaryFee = create<EditSalaryFeeState>((set) => ({
  isOpen: false,
  feeId: "",
  session: "",
  classNameId: "",
  amount: "",
  group: "",
  onOpen: (
    feeId: string,
    session: string,
    classNameId: string,
    amount: string,
    group?: string
  ) => set({ isOpen: true, session, feeId, classNameId, amount, group }),
  onClose: () =>
    set({
      isOpen: false,
      feeId: "",
      classNameId: "",
      amount: "",
      group: "",
      session: "",
    }),
}));

interface DeleteSalaryFeeState {
  isOpen: boolean;
  feeId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteSalaryFee = create<DeleteSalaryFeeState>((set) => ({
  isOpen: false,
  feeId: "",
  onOpen: (id: string) => set({ isOpen: true, feeId: id }),
  onClose: () => set({ isOpen: false, feeId: "" }),
}));
