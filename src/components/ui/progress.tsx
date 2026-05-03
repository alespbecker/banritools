"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3",
      },
      tone: {
        primary: "bg-primary/15",
        success: "bg-success/15",
        warning: "bg-warning/15",
        danger:  "bg-destructive/15",
        muted:   "bg-muted",
      },
    },
    defaultVariants: { size: "md", tone: "primary" },
  }
)

const progressBarVariants = cva("h-full w-full flex-1 transition-all duration-200", {
  variants: {
    tone: {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      danger:  "bg-destructive",
      muted:   "bg-muted-foreground/40",
    },
  },
  defaultVariants: { tone: "primary" },
})

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressTrackVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, tone, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressTrackVariants({ size, tone }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(progressBarVariants({ tone }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
