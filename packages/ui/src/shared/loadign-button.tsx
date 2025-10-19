import React, { useState, useEffect } from "react";
import { Loader2, Check, X, LucideIcon } from "lucide-react";

import { Button } from "../components/button";
import { cn } from "../lib/utils";

export type ButtonState = "idle" | "loading" | "success" | "error";

interface LoadingButtonProps {
  onClick?: () => Promise<void> | void;
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  successTimeout?: number;
  errorTimeout?: number;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  type?: "submit" | "button" | "reset";
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
}: LoadingButtonProps) {
  const [internalState, setInternalState] = useState<ButtonState>("idle");

  const state = controlledState ?? internalState;

  const setState = (newState: ButtonState) => {
    if (onStateChange) {
      onStateChange(newState);
    } else {
      setInternalState(newState);
    }
  };

  useEffect(() => {
    if (state === "success") {
      const timer = setTimeout(() => setState("idle"), successTimeout);
      return () => clearTimeout(timer);
    }
    if (state === "error") {
      const timer = setTimeout(() => setState("idle"), errorTimeout);
      return () => clearTimeout(timer);
    }
  }, [state, successTimeout, errorTimeout]);

  const getButtonContent = () => {
    switch (state) {
      case "loading":
        return (
          <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingText}</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
            <Check className="h-4 w-4" />
            <span>{successText}</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
            <X className="h-4 w-4" />
            <span>{errorText}</span>
          </div>
        );
      default:
        return (
          <div className="animate-in slide-in-from-bottom-1 duration-200">
            {children}
          </div>
        );
    }
  };

  const getButtonVariant = () => {
    if (state === "success") return "default";
    if (state === "error") return "destructive";
    return variant;
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || state !== "idle"}
      variant={getButtonVariant()}
      size={size}
      className={cn(
        "transition-all duration-300 ease-in-out transform",
        state === "success" &&
          "bg-green-600 hover:bg-green-700 border-green-600",
        state === "loading" && "cursor-not-allowed",
        state === "loading" && "animate-pulse",
        className
      )}
    >
      <div className="transition-all duration-300 ease-in-out overflow-hidden">
        {getButtonContent()}
      </div>
      {Icon && state === "idle" && <Icon />}
    </Button>
  );
}
