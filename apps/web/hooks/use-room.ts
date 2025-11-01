import { create } from "zustand";

interface CreateRoomState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateRoom = create<CreateRoomState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditRoomState {
  isOpen: boolean;
  roomId: string;
  houseId: string;
  name: string;
  capacity: number;
  availableTimes: string[];
  onOpen: (
    roomId: string,
    houseId: string,
    name: string,
    capacity: number,
    availableTimes: string[]
  ) => void;
  onClose: () => void;
}

export const useEditRoom = create<EditRoomState>((set) => ({
  isOpen: false,
  roomId: "",
  houseId: "",
  name: "",
  capacity: 0,
  availableTimes: [],
  onOpen: (
    roomId: string,
    houseId: string,
    name: string,
    capacity: number,
    availableTimes: string[]
  ) => set({ isOpen: true, roomId, houseId, name, capacity, availableTimes }),
  onClose: () =>
    set({
      isOpen: false,
      roomId: "",
      houseId: "",
      name: "",
      capacity: 0,
      availableTimes: [],
    }),
}));

interface DeleteRoomState {
  isOpen: boolean;
  roomId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteRoom = create<DeleteRoomState>((set) => ({
  isOpen: false,
  roomId: "",
  onOpen: (id: string) => set({ isOpen: true, roomId: id }),
  onClose: () => set({ isOpen: false, roomId: "" }),
}));
