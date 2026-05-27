import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  badge: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  align?: "center" | "left";
  actions?: ReactNode;
};

export function PageHeader({
  badge,
  title,
  description,
  icon: Icon,
  align = "center",
  actions,
}: PageHeaderProps) {
  const isCenter = align === "center";

  return (
    <header
      className={`mb-8 md:mb-10 flex flex-col gap-4 ${
        isCenter ? "text-center max-w-3xl mx-auto" : "md:flex-row md:items-start md:justify-between"
      }`}
    >
      <div className={isCenter ? "" : "flex-1 min-w-0"}>
        <span className="text-xs uppercase tracking-widest chip-gold px-3.5 py-1.5 rounded-full mb-3 inline-block">
          {badge}
        </span>
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight flex items-center gap-2 ${
            isCenter
              ? "justify-center bg-gradient-to-r from-brand-blue via-brand-light to-brand-gold bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-brand-gold"
              : "text-slate-800 dark:text-white"
          }`}
        >
          {Icon && <Icon size={36} className="text-brand-blue dark:text-brand-light shrink-0" />}
          {title}
        </h1>
        {description && (
          <p className={`mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed ${isCenter ? "" : "max-w-2xl"}`}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className={isCenter ? "flex justify-center" : "shrink-0"}>{actions}</div>}
    </header>
  );
}

type TabOption<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type TabSwitcherProps<T extends string> = {
  tabs: TabOption<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
};

export function TabSwitcher<T extends string>({ tabs, active, onChange, className = "" }: TabSwitcherProps<T>) {
  return (
    <div
      className={`flex overflow-x-auto no-scrollbar bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-inner max-w-full ${className}`}
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            active === id
              ? "bg-white dark:bg-slate-700 text-brand-blue dark:text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white"
          }`}
        >
          {Icon && <Icon size={14} />}
          {label}
        </button>
      ))}
    </div>
  );
}
