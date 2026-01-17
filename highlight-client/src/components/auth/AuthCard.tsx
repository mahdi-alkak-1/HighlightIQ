import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="h-full w-full px-10 py-12">
      {children}
    </div>
  );
};

export default AuthCard;
