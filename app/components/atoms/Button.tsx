// components/Button.tsx
import React from "react";
import { buttonClasses } from "@/lib/utils";
import { Loader2 } from "lucide-react"; // For loading spinner

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  isLoading = false,
  startIcon,
  endIcon,
  disabled,
  ...props
}) => {
  return (
    <button 
      className={buttonClasses(className, variant, size)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {!isLoading && startIcon && (
        <span className="mr-2">{startIcon}</span>
      )}
      {children}
      {!isLoading && endIcon && (
        <span className="ml-2">{endIcon}</span>
      )}
    </button>
  );
};
