import type { ZodSchema } from 'zod'

export const validateSchema = <T>(
  schema: ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | {
      success: false
      error: string
    } => {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    const errorMessage = result.error.errors
      .map((err) => err.message)
      .join(', ')
    return { success: false, error: errorMessage }
  }
}
