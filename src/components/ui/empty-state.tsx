import React from "react"
import { cn } from "@/src/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-zinc-50 border border-zinc-200 rounded-2xl min-h-[200px]", className)} {...props}>
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 text-zinc-500 mb-4 ring-1 ring-zinc-200 shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-zinc-500 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
