import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthHero from "@/components/auth/AuthHero";
import AuthSwitchLink from "@/components/auth/AuthSwitchLink";
import BrandLogo from "@/components/auth/BrandLogo";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextField from "@/components/form/TextField";
import { registerCopy } from "@/data/authCopy";
import { useRegister } from "@/hooks/useRegister";
import AuthLayout from "@/layouts/AuthLayout";

const RegisterPage = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { register, isLoading, errorMessage, fieldErrors } = useRegister();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await register(formState);
  };

  return (
    <AuthLayout
      left={
        <AuthHero
          title={registerCopy.heroTitle}
          subtitle={registerCopy.heroSubtitle}
          imageSrc={registerCopy.heroImage}
        />
      }
      right={
        <AuthCard>
          <div className="space-y-6">
            <BrandLogo />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">
                {registerCopy.formTitle}
              </h2>
              <p className="text-sm text-white/60">
                {registerCopy.formSubtitle}
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <TextField
                label={registerCopy.fields.name.label}
                placeholder={registerCopy.fields.name.placeholder}
                name="name"
                value={formState.name}
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, name: value }))
                }
                error={fieldErrors.name}
                autoComplete="name"
              />
              <TextField
                label={registerCopy.fields.email.label}
                placeholder={registerCopy.fields.email.placeholder}
                name="email"
                type="email"
                value={formState.email}
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, email: value }))
                }
                error={fieldErrors.email}
                autoComplete="email"
              />
              <TextField
                label={registerCopy.fields.password.label}
                placeholder={registerCopy.fields.password.placeholder}
                name="password"
                type="password"
                value={formState.password}
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, password: value }))
                }
                error={fieldErrors.password}
                autoComplete="new-password"
              />

              <PrimaryButton
                label={isLoading ? "Creating..." : registerCopy.submitLabel}
                type="submit"
                disabled={isLoading}
              />
            </form>

            <AuthSwitchLink
              copy={registerCopy.switchCopy}
              linkText={registerCopy.switchLink}
              to="/login"
            />
          </div>
        </AuthCard>
      }
    />
  );
};

export default RegisterPage;
