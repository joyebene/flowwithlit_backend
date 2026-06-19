import { z } from "zod";

export const submitKycSchema = z.object({
    bvn: z.string().min(11).max(11),
    nin: z.string().min(11).max(11),
    address: z.string().min(5),
    dateOfBirth: z.string(),
});

export type SubmitKycDto = z.infer<typeof submitKycSchema>;