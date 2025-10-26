import React, { useEffect, useRef } from "react";

type Tone = "danger" | "warning" | "success" | "neutral";

type Props = {
  open: boolean;
  title?: string;
  /** Si pasas children, `message` se ignora. */
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Cambia colores del header y botón confirmar */
  tone?: Tone;
  /** Deshabilita botones mientras se procesa */
  disabled?: boolean;
  children?: React.ReactNode;
};

const toneClasses: Record<Tone, {
  header: string;
  border: string;
  iconBg: string;
  title: string;
  text: string;
  confirmBtn: string;
}> = {
  danger: {
    header: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-600",
    title: "text-red-800",
    text: "text-red-700",
    confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    header: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-500",
    title: "text-amber-800",
    text: "text-amber-700",
    confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  success: {
    header: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-600",
    title: "text-emerald-800",
    text: "text-emerald-700",
    confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  neutral: {
    header: "bg-slate-50",
    border: "border-slate-200",
    iconBg: "bg-slate-600",
    title: "text-slate-800",
    text: "text-slate-700",
    confirmBtn: "bg-slate-700 hover:bg-slate-800 text-white",
  },
};

export default function ConfirmModal({
  open,
  title = "Confirmar acción",
  message = "¿Deseas continuar?",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  tone = "neutral",
  disabled = false,
  children,
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
    if (open) setTimeout(() => confirmBtnRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;

  const t = toneClasses[tone];

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
          className={`w-full max-w-md rounded-2xl border ${t.border} bg-white shadow-xl`}
        >
          <div className={`flex items-start gap-3 border-b ${t.border} ${t.header} px-5 py-4 rounded-t-2xl`}>
            <div className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full ${t.iconBg} text-white text-sm`}>!</div>
            <div className="flex-1">
              <h2 className={`text-base font-semibold ${t.title}`}>{title}</h2>
              <div className={`mt-1 text-sm ${t.text}`}>
                {children ?? message}
              </div>
            </div>
            <button
              className={`ml-2 rounded-md px-2 py-1 ${t.text} hover:opacity-80`}
              onClick={onCancel}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4">
            <button
              className="btn btn-outline disabled:opacity-60"
              onClick={onCancel}
              disabled={disabled}
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              className={`btn ${t.confirmBtn} disabled:opacity-60`}
              onClick={onConfirm}
              disabled={disabled}
              aria-busy={disabled || undefined}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
