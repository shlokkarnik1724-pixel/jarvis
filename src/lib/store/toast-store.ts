"use client";

import { create } from "zustand";

export type ToastTone = "default" | "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration?: number;
};

type ToastState = {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? `toast-${Date.now()}-${++counter}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { ...toast, id, tone: toast.tone ?? "default" }],
    }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export function toast(
  title: string,
  options?: { description?: string; tone?: ToastTone; duration?: number }
) {
  return useToastStore.getState().push({
    title,
    description: options?.description,
    tone: options?.tone ?? "default",
    duration: options?.duration ?? 3200,
  });
}
