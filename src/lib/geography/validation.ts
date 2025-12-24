import { z } from "zod";

// Region Validations
export const RegionValidation = z.object({
    name: z.string().min(2, { message: "Region name must be at least 2 characters." }),
});

export const RegionUpdateValidation = z.object({
    name: z.string().min(2, { message: "Region name must be at least 2 characters." }),
});

// District Validations
export const DistrictValidation = z.object({
    name: z.string().min(2, { message: "District name must be at least 2 characters." }),
    region_id: z.string().uuid({ message: "Valid region ID is required." }),
});

export const DistrictUpdateValidation = z.object({
    name: z.string().min(2, { message: "District name must be at least 2 characters." }).optional(),
    region_id: z.string().uuid({ message: "Valid region ID is required." }).optional(),
});

// Village Validations
export const VillageValidation = z.object({
    name: z.string().min(2, { message: "Village name must be at least 2 characters." }),
    district_id: z.string().uuid({ message: "Valid district ID is required." }),
});

export const VillageUpdateValidation = z.object({
    name: z.string().min(2, { message: "Village name must be at least 2 characters." }).optional(),
    district_id: z.string().uuid({ message: "Valid district ID is required." }).optional(),
});
