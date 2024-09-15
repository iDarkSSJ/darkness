import z from 'zod'

const ShellSchema = z.object({
  shell_name: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters')
    .trim(),
  shell_core: z.string().max(30),
})

export const validateShell = (input) => {
  return ShellSchema.safeParse(input)
}
