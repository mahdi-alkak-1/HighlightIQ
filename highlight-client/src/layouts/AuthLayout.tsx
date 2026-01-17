import { ReactNode } from "react";

interface AuthLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

const AuthLayout = ({ left, right }: AuthLayoutProps) => {
  return (
    <div className="h-screen overflow-hidden bg-brand-bg text-brand-text">
      <div className="grid h-screen grid-cols-1 lg:grid-cols-[1.45fr_1fr]">
        <div className="order-2 lg:order-1">{left}</div>
        <div className="order-1 flex items-stretch justify-stretch bg-brand-panelStrong lg:order-2">
          {right}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
