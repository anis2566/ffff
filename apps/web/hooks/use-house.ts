import { create } from "zustand";

interface CreateHouseState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateHouse = create<CreateHouseState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditHouseState {
  isOpen: boolean;
  houseId: string;
  name: string;
  roomCount: number;
  onOpen: (houseId: string, name: string, roomCount: number) => void;
  onClose: () => void;
}

export const useEditHouse = create<EditHouseState>((set) => ({
  isOpen: false,
  houseId: "",
  name: "",
  roomCount: 0,
  onOpen: (houseId: string, name: string, roomCount: number) =>
    set({ isOpen: true, houseId, name, roomCount }),
  onClose: () => set({ isOpen: false, houseId: "", name: "", roomCount: 0 }),
}));

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
