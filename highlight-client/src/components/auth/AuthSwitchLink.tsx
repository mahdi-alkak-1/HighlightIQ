import { Link } from "react-router-dom";

interface AuthSwitchLinkProps {
  copy: string;
  linkText: string;
  to: string;
}

const AuthSwitchLink = ({ copy, linkText, to }: AuthSwitchLinkProps) => {
  return (
    <p className="text-center text-xs text-white/70">
      {copy} {" "}
      <Link to={to} className="font-semibold text-brand-link hover:underline">
        {linkText}
      </Link>
    </p>
  );
};

export default AuthSwitchLink;
