import { create } from "zustand";

interface CreateIncomeState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateIncome = create<CreateIncomeState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditClassIncome {
  isOpen: boolean;
  incomeId: string;
  name: string;
  session: string;
  amount: string;
  month: string;
  onOpen: (
    incomeId: string,
    session: string,
    month: string,
    name: string,
    amount: string
  ) => void;
  onClose: () => void;
}

export const useEditIncome = create<EditClassIncome>((set) => ({
  isOpen: false,
  incomeId: "",
  session: "",
  month: "",
  name: "",
  amount: "",
  onOpen: (
    id: string,
    session: string,
    month: string,
    name: string,
    amount: string
  ) => set({ isOpen: true, incomeId: id, session, month, name, amount }),
  onClose: () => set({ isOpen: false, incomeId: "" }),
}));

interface DeleteIncomeState {
  isOpen: boolean;
  incomeId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteIncome = create<DeleteIncomeState>((set) => ({
  isOpen: false,
  incomeId: "",
  onOpen: (id: string) => set({ isOpen: true, incomeId: id }),
  onClose: () => set({ isOpen: false, incomeId: "" }),
}));
