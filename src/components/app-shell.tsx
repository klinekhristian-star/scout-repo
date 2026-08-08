import { Link, useRouterState } from "@tanstack/react-router";
import { Briefcase, FileText, LayoutDashboard, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Board", icon: LayoutDashboard },
  { to: "/resume", label: "Master Resume", icon: FileText },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-bg text-fg-on-dark shadow-[var(--shadow-card)]">
              <Compass className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold tracking-tight text-fg leading-none">
                Scout
              </span>
              <span className="block text-[11px] text-muted tracking-wide uppercase">
                Job OS
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 rounded-full border border-border bg-surface-card p-1 shadow-[var(--shadow-card)]">
            {nav.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/" || pathname.startsWith("/jobs")
                  : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-bg text-fg-on-dark"
                      : "text-muted hover:text-fg hover:bg-surface",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {(title || actions) && (
        <div className="border-b border-border/60 bg-surface-card/50">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="min-w-0">
              {title && (
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-muted max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-border/70 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3 w-3" aria-hidden />
            Scout — track, tailor, ship applications
          </span>
          <span className="hidden sm:inline">Data stays in this browser</span>
        </div>
      </footer>
    </div>
  );
}
