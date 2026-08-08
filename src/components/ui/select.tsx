import * as React from "react";
import { cn } from "@/lib/utils";

/** Lightweight native select styled like shadcn (no extra radix select dependency wiring). */
export function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  // children are SelectItem elements — extract options
  const options: Array<{ value: string; label: React.ReactNode }> = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as { value?: string; children?: React.ReactNode; __selectItem?: boolean };
    if (props.value != null) {
      options.push({ value: props.value, label: props.children });
    } else if (props.children) {
      React.Children.forEach(props.children, (c) => {
        if (!React.isValidElement(c)) return;
        const p = c.props as { value?: string; children?: React.ReactNode };
        if (p.value != null) options.push({ value: p.value, label: p.children });
      });
    }
  });
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {typeof o.label === "string" || typeof o.label === "number" ? o.label : o.value}
        </option>
      ))}
    </select>
  );
}
export function SelectTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn(className)}>{children}</div>;
}
export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-muted">{placeholder}</span>;
}
export function SelectContent({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
export function SelectItem({
  value,
  children,
}: {
  value: string;
  children?: React.ReactNode;
}) {
  return <option value={value}>{children}</option>;
}
