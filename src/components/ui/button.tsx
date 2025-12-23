import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-body",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-md",
        link: "text-primary underline-offset-4 hover:underline",
        // Namoussa brand variants
        elegant: "bg-primary text-primary-foreground hover:bg-primary/85 rounded-none border-0 tracking-wider uppercase text-xs font-medium hover:tracking-widest",
        rose: "bg-secondary text-foreground hover:bg-secondary/80 rounded-none border-0 tracking-wider uppercase text-xs font-medium shadow-rose hover:shadow-elegant",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-none border-0 tracking-[0.2em] uppercase text-xs font-medium px-10 py-4 hover:tracking-[0.25em]",
        heroOutline: "bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-primary-foreground rounded-none tracking-[0.2em] uppercase text-xs font-medium px-10 py-4",
        whatsapp: "bg-[#25D366] text-foreground hover:bg-[#22c55e] rounded-full shadow-lg hover:shadow-xl font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 px-8",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10",
        iconLg: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
