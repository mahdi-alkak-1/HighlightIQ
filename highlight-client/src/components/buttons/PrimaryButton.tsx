import { ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const PrimaryButton = ({ label, className, ...props }: PrimaryButtonProps) => {
  return (
    <button
      className={`w-full rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${
        className ?? ""
      }`}
      {...props}
    >
      {label}
    </button>
  );
};

export default PrimaryButton;
