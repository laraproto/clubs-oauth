import { z } from 'zod';

export const formSchema = z.object({
	email: z.email()
});

export const otpFormSchema = z.object({
	email: z.email(),
	otp: z.string().min(6).max(6).regex(/^\d+$/, { message: 'OTP must be a 6-digit number.' })
});

export type FormSchema = typeof formSchema;
export type OtpFormSchema = typeof otpFormSchema;
