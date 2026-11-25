import { z } from 'zod';

export const emailChangeSchema = z.object({
	email: z.email()
});

export const emailChangeOtpSchema = z.object({
	email: z.email(),
	otp: z.string().min(6, 'OTP must be at least 6 characters long')
});

export type EmailChangeSchema = typeof emailChangeSchema;
export type EmailChangeOtpSchema = typeof emailChangeOtpSchema;
