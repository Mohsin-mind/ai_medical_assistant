import { cn } from "@/lib/utils";

export function Chat({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "h-full overflow-hidden flex flex-col @container/chat",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
