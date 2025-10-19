import { create } from "zustand";

interface DeleteHouseState {
  isOpen: boolean;
  houseId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteHouse = create<DeleteHouseState>((set) => ({
  isOpen: false,
  houseId: "",
  onOpen: (id: string) => set({ isOpen: true, houseId: id }),
  onClose: () => set({ isOpen: false, houseId: "" }),
}));
