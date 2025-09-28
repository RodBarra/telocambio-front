import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Confirmar acción",
  message = "¿Deseas continuar?",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  // Enfocar botón confirmar al abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmBtnRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40"
        aria-hidden
        onClick={onCancel}
      />
      {/* Panel */}
      <div
        className="fixed inset-0 z-[101] grid place-items-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={panelRef}
          className="w-full max-w-md rounded-2xl border border-red-200 bg-white shadow-xl"
        >
          <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-5 py-4 rounded-t-2xl">
            <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-sm">!</div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-red-800">{title}</h2>
              <div className="mt-1 text-sm text-red-700">{message}</div>
            </div>
            <button
              className="ml-2 rounded-md px-2 py-1 text-red-700 hover:bg-red-100"
              onClick={onCancel}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4">
            <button
              className="btn btn-outline"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              className="btn bg-red-600 text-white hover:bg-red-700"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
