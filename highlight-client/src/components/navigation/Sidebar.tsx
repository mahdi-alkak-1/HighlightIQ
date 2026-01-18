import { NavLink } from "react-router-dom";
import { navigationItems } from "@/data/dashboardData";
import { NavigationItem } from "@/types/dashboard";
import { getAuthUser } from "@/utils/authStorage";

const iconStyles = "h-4 w-4";

const renderIcon = (icon: NavigationItem["icon"]) => {
  switch (icon) {
    case "grid":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconStyles}>
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeWidth="1.5" />
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconStyles}>
          <path d="M5 7h4l1-2h4l1 2h4v10H5z" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconStyles}>
          <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3z" strokeWidth="1.5" />
        </svg>
      );
    case "folder":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconStyles}>
          <path d="M4 6h6l2 2h8v10H4z" strokeWidth="1.5" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconStyles}>
          <path d="M4 19V5m6 14v-8m6 8V9m6 10V7" strokeWidth="1.5" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconStyles}>
          <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" strokeWidth="1.5" />
          <path d="M3 12h2m14 0h2M12 3v2m0 14v2m-6.4-13.4l1.4 1.4m10 10l1.4 1.4m0-12.8l-1.4 1.4m-10 10l-1.4 1.4" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
};

const Sidebar = () => {
  const user = getAuthUser();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-brand-border bg-[#0C0F14]">
      <div className="flex items-center gap-2 px-6 py-6">
        <img
          src="/images/highlightiq-logo.png"
          alt="HighlightIQ"
          className="h-7 w-auto"
        />
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-blue/15 text-brand-blue"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? "text-brand-blue" : "text-white/70"}>
                  {renderIcon(item.icon)}
                </span>
                <span className={isActive ? "text-brand-blue" : "text-white/70"}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-brand-border px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/10" />
          <div>
            <p className="text-sm font-semibold text-white">
              {user?.name ?? "Creator"}
            </p>
            <p className="text-xs text-white/50">{user?.email ?? "—"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
