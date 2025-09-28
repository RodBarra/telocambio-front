export function Field({
  label,
  children,
  hint,
  error,
}: {
  label?: string;
  children: any;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="field">
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
