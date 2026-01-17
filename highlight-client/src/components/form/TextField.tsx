interface TextFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
}

const TextField = ({
  label,
  placeholder,
  type = "text",
  name,
  value,
  onChange,
  error,
  autoComplete,
}: TextFieldProps) => {
  const baseClasses =
    "w-full rounded-md border px-4 py-2 text-sm text-white outline-none transition bg-brand-panel border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/40";
  const errorClasses = error
    ? " border-red-500/70 focus:border-red-500 focus:ring-red-500/40"
    : "";

  return (
    <label className="flex flex-col gap-2 text-sm text-white/90">
      <span>{label}</span>
      <input
        className={`${baseClasses}${errorClasses}`}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span id={`${name}-error`} className="text-xs text-red-400">
          {error}
        </span>
      )}
    </label>
  );
};

export default TextField;
