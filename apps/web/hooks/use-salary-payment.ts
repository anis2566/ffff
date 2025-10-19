import { create } from "zustand";

interface ShowTransactionState {
  isOpen: boolean;
  transactionId: string;
  amount: number;
  status: string;
  onOpen: (transactionId: string, amount: number, status: string) => void;
  onClose: () => void;
}

export const useShowTransaction = create<ShowTransactionState>((set) => ({
  isOpen: false,
  transactionId: "",
  amount: 0,
  status: "",
  onOpen: (transactionId: string, amount: number, status: string) =>
    set({ isOpen: true, transactionId, amount, status }),
  onClose: () =>
    set({ isOpen: false, transactionId: "", amount: 0, status: "" }),
}));
