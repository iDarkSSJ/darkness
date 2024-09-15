import { z } from 'zod'

const usernameRegex = /^[A-Za-z0-9_. -]+$/
const startNoSupported = /^[_.-]/
const endNoSupported = /[_.-]$/
const passwordRegex = /^[a-zA-Z\d@$!%*?&#^()_\-+={}[\]:;"'<>,./\\~`|]{6,30}$/
const passwordLetter = /[a-zA-Z]/
const passwordDigit = /\d/

const UserSchema = z.object({
  user_name: z
    .string()
    .min(3, '')
    .max(15, 'Username must not exceed 15 characters')
    .refine(
      (v) => !startNoSupported.test(v),
      'Username cannot start with this character'
    )
    .refine(
      (v) => !endNoSupported.test(v),
      'Username cannot end with this character'
    )
    .refine(
      (v) => usernameRegex.test(v),
      'Username contains unsupported characters'
    )
    .refine((v) => !v.includes(' '), 'Username cannot contain spaces'),

  user_email: z.string().email('Invalid email address'),

  user_password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(30, 'Password must not exceed 30 characters')
    .refine((v) => !v.includes(' '), 'Password cannot contain spaces')
    .refine(
      (v) => passwordLetter.test(v),
      'Password must contain at least one letter'
    )
    .refine((v) => passwordDigit.test(v), 'Password must contain at least one digit')
    .refine(
      (v) => passwordRegex.test(v),
      'Password contains unsupported characters'
    ),
})

export const validateUser = (input) => {
  return UserSchema.safeParse(input)
}
