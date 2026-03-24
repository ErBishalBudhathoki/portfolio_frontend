'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  trackingName?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, asChild = false, trackingName, onClick, type, ...props }, ref) {
    const buttonClassName = React.useMemo(() => {
      const baseClasses = buttonVariants({ variant, size });
      const userClasses = typeof className === 'string' ? className : '';
      return cn(baseClasses, userClasses);
    }, [variant, size, className]);
    
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (trackingName) {
        trackEvent('button_click', { button: trackingName });
      }
      
      if (onClick) {
        onClick(event);
      }
    }, [trackingName, onClick]);
    
    const Comp = asChild ? Slot : "button"
    
    // Determine the type attribute
    const buttonType = Comp === "button" && !type ? "button" : type;
    
    return (
      <Comp
        className={buttonClassName}
        ref={ref}
        onClick={handleClick}
        type={buttonType}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
