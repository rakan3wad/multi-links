import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message?: string
  className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null

  return (
    <div className={cn('flex gap-x-2 text-sm text-red-600', className)}>
      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      <p>{message}</p>
    </div>
  )
}
