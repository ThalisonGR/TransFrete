export default function Input({
  label,
  id,
  error,
  className = "",
  as = "input",
  ...props
}) {
  const Tag = as;
  const base =
    "w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand";
  const borderClass = error
    ? "border-red-500 focus:ring-red-500"
    : "border-slate-300";

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <Tag id={id} className={`${base} ${borderClass}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
