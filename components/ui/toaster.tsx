"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"

// Update the ToastViewport positioning for slide-in effect
const CustomToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]",
      className,
    )}
    {...props}
  />
))
CustomToastViewport.displayName = ToastPrimitives.Viewport.displayName

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <CustomToastViewport />
    </ToastProvider>
  )
}
