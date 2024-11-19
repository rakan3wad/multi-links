import { ErrorMessage } from './error-message'

interface FormErrorsProps {
  id: string
  errors?: Record<string, string[] | undefined>
}

export function FormErrors({ id, errors }: FormErrorsProps) {
  if (!errors) return null

  return (
    <div
      id={`${id}-error`}
      aria-live="polite"
      className="mt-2 text-sm text-red-500"
    >
      {errors?.[id]?.map((error: string) => (
        <ErrorMessage key={error} message={error} />
      ))}
    </div>
  )
}
