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
  classNameId: string;
  amount: string;
  group?: string;
  type: string;
  onOpen: (
    type: string,
    feeId: string,
    classNameId: string,
    amount: string,
    group?: string
  ) => void;
  onClose: () => void;
}

export const useEditSalaryFee = create<EditSalaryFeeState>((set) => ({
  isOpen: false,
  type: "",
  feeId: "",
  classNameId: "",
  amount: "",
  group: "",
  onOpen: (
    type: string,
    feeId: string,
    classNameId: string,
    amount: string,
    group?: string
  ) => set({ isOpen: true, type, feeId, classNameId, amount, group }),
  onClose: () =>
    set({
      isOpen: false,
      feeId: "",
      classNameId: "",
      amount: "",
      group: "",
      type: "",
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
