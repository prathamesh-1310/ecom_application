import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  phone: z.string().optional(),
});

export const registerB2BSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  phone: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required'),
  gstNumber: z.string().optional(),
  businessType: z.string().min(2, 'Business type is required'),
  expectedVolume: z.string().optional(),
  address: z.object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const addressSchema = z.object({
  addressType: z.string().optional(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  addressLine1: z.string().min(3, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().optional(),
  postalCode: z.string().min(3, 'Postal code is required'),
  isDefault: z.boolean().optional(),
});

export const createOrderSchema = z.object({
  cartId: z.string().uuid('Invalid cart ID format'),
  shippingAddress: z.object({
    fullName: z.string().optional(),
    email: z.string().email('Invalid shipping email').optional(),
    phone: z.string().optional(),
    addressLine1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  billingAddress: z.any().optional(),
  couponCode: z.string().optional(),
  platform: z.enum(['RETAIL', 'B2B']).optional(),
  policyAccepted: z.literal(true, { errorMap: () => ({ message: 'Policy acceptance is mandatory' }) }),
  policyVersion: z.string().optional(),
  accountPassword: z.string().optional(),
});

export const supportRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  requestType: z.string().optional(),
  reason: z.string().min(3, 'Reason must be specified'),
  description: z.string().min(5, 'Description is required'),
  attachmentUrls: z.any().optional(),
});

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};
