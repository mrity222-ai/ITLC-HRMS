import { Company, SubscriptionPlan, Payment, User, Coupon, SupportTicket, ActivityLog } from './types';

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    price: 0,
    billingCycle: 'monthly',
    trialDays: 14,
    employeeLimit: 10,
    storageLimit: 2,
    aiCreditsLimit: 50,
    features: {
      payroll: false,
      attendance: true,
      recruitment: false,
      faceRecognition: false,
      gpsAttendance: false,
      apiAccess: false,
      whiteLabel: false
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    billingCycle: 'monthly',
    trialDays: 0,
    employeeLimit: 50,
    storageLimit: 10,
    aiCreditsLimit: 200,
    features: {
      payroll: true,
      attendance: true,
      recruitment: true,
      faceRecognition: false,
      gpsAttendance: false,
      apiAccess: false,
      whiteLabel: false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    billingCycle: 'monthly',
    trialDays: 0,
    employeeLimit: 250,
    storageLimit: 50,
    aiCreditsLimit: 1000,
    features: {
      payroll: true,
      attendance: true,
      recruitment: true,
      faceRecognition: true,
      gpsAttendance: true,
      apiAccess: false,
      whiteLabel: false
    }
  },
  {
    id: 'business',
    name: 'Business',
    price: 499,
    billingCycle: 'monthly',
    trialDays: 0,
    employeeLimit: 1000,
    storageLimit: 250,
    aiCreditsLimit: 5000,
    features: {
      payroll: true,
      attendance: true,
      recruitment: true,
      faceRecognition: true,
      gpsAttendance: true,
      apiAccess: true,
      whiteLabel: false
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    billingCycle: 'monthly',
    trialDays: 0,
    employeeLimit: 99999,
    storageLimit: 1000,
    aiCreditsLimit: 50000,
    features: {
      payroll: true,
      attendance: true,
      recruitment: true,
      faceRecognition: true,
      gpsAttendance: true,
      apiAccess: true,
      whiteLabel: true
    }
  }
];

export const INITIAL_COMPANIES: Company[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_USERS: User[] = [];
export const INITIAL_COUPONS: Coupon[] = [];
export const INITIAL_TICKETS: SupportTicket[] = [];
export const INITIAL_LOGS: ActivityLog[] = [];
