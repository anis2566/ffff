import { useState, useEffect, ComponentProps } from "react";
import { Loader2, Check, X, LucideIcon } from "lucide-react";

import { Button } from "../components/button";
import { cn } from "../lib/utils";

export type ButtonState = "idle" | "loading" | "success" | "error";

interface LoadingButtonProps
  extends Omit<ComponentProps<typeof Button>, "onClick"> {
  onClick?: () => void;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  successTimeout?: number;
  errorTimeout?: number;
  icon?: LucideIcon;
  state?: ButtonState;
  onStateChange?: (state: ButtonState) => void;
}

export function LoadingButton({
  onClick,
  children,
  loadingText = "Loading...",
  successText = "Success!",
  errorText = "Error",
  successTimeout = 2000,
  errorTimeout = 2000,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  type = "button",
  icon: Icon,
  state: controlledState,
  onStateChange,
  ...buttonProps
}: LoadingButtonProps) {
  const [internalState, setInternalState] = useState<ButtonState>("idle");

  const isControlled = controlledState !== undefined;
  const state = isControlled ? controlledState : internalState;

  const setState = (newState: ButtonState) => {
    onStateChange?.(newState);
    if (!isControlled) {
      setInternalState(newState);
    }
  };

  const handleClick = () => {
    if (!onClick || state !== "idle") return;
    onClick();
  };

  useEffect(() => {
    if (state === "success" || state === "error") {
      const timeout = state === "success" ? successTimeout : errorTimeout;
      const timer = setTimeout(() => setState("idle"), timeout);
      return () => clearTimeout(timer);
    }
  }, [state, successTimeout, errorTimeout]);

  const buttonContent = (() => {
    switch (state) {
      case "loading":
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingText}</span>
          </>
        );
      case "success":
        return (
          <>
            <Check className="h-4 w-4" />
            <span>{successText}</span>
          </>
        );
      case "error":
        return (
          <>
            <X className="h-4 w-4" />
            <span>{errorText}</span>
          </>
        );
      default:
        return (
          <>
            {Icon && <Icon className="h-4 w-4" />}
            {children}
          </>
        );
    }
  })();

  const buttonVariant = (() => {
    if (state === "success") return "default";
    if (state === "error") return "destructive";
    return variant;
  })();

  return (
    <Button
      {...buttonProps}
      type={type}
      onClick={handleClick}
      disabled={disabled || state !== "idle"}
      variant={buttonVariant}
      size={size}
      className={cn(
        "transition-all duration-300 gap-2",
        state === "success" &&
          "bg-green-600 hover:bg-green-700 border-green-600",
        state === "loading" && "cursor-wait",
        className
      )}
    >
      {buttonContent}
    </Button>
  );
}
