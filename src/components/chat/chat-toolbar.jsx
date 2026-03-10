"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ChatToolbar({ children, className, ...props }) {
  return (
    <div
      className={cn("sticky bottom-0 p-2 pt-0 bg-background", className)}
      {...props}
    >
      <div
        className={cn(
          "border rounded-md py-2 px-3",
          "flex flex-wrap items-start gap-x-2",
        )}
      >
        {children}
      </div>
    </div>
  );
}

const NEWLINE_MODIFIER_KEY = "shiftKey";

export const ChatToolbarTextarea = React.forwardRef(function ChatToolbarTextarea(
  { className, onSubmit, onKeyDown, ...props },
  ref
) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e[NEWLINE_MODIFIER_KEY]) {
      e.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(e);
  };

  return (
    <div className="flex-1 min-w-0 order-2 grid">
      <Textarea
        ref={ref}
        id="toolbar-input"
        placeholder="Describe your symptoms..."
        className={cn(
          "h-fit min-h-10 max-h-30 px-1 @md/chat:text-base",
          "border-none shadow-none focus-visible:border-none focus-visible:ring-0 placeholder:whitespace-nowrap resize-none",
          className,
        )}
        rows={1}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  );
});

const chatToolbarAddonAlignStyles = {
  "inline-start": "order-1",
  "inline-end": "order-3",
  "block-start": "order-0 w-full",
  "block-end": "order-4 w-full",
};

export function ChatToolbarAddon({
  children,
  className,
  align = "inline-start",
  ...props
}) {
  return (
    <div
      className={cn(
        "h-10 flex items-center gap-1.5",
        chatToolbarAddonAlignStyles[align],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChatToolbarButton({ children, className, ...props }) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "size-8 @md/chat:size-9 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='size-'])]:@md/chat:size-5 [&_svg]:stroke-[1.7px]",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
