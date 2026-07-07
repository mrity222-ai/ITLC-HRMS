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

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp_1',
    name: 'Acme Corporation',
    logo: 'bg-gradient-to-tr from-purple-500 to-indigo-500',
    ownerName: 'Sarah Jenkins',
    email: 'sarah.j@acme.com',
    phone: '+1 (555) 123-4567',
    employeesCount: 245,
    subscriptionPlanId: 'professional',
    storageUsed: 34.5,
    status: 'active',
    createdDate: '2025-01-15',
    modulesEnabled: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: true,
      performance: true,
      assets: true,
      training: false,
      aiReports: true,
      chat: true,
      projects: true,
      faceRecognition: true,
      gpsTracking: true,
      mobileApp: true,
      api: false,
      whiteLabel: false
    }
  },
  {
    id: 'comp_2',
    name: 'Stark Industries',
    logo: 'bg-gradient-to-tr from-rose-500 to-red-500',
    ownerName: 'Tony Stark',
    email: 'pepper.potts@stark.com',
    phone: '+1 (555) 300-3000',
    employeesCount: 1540,
    subscriptionPlanId: 'enterprise',
    storageUsed: 780.2,
    status: 'active',
    createdDate: '2024-06-10',
    modulesEnabled: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: true,
      performance: true,
      assets: true,
      training: true,
      aiReports: true,
      chat: true,
      projects: true,
      faceRecognition: true,
      gpsTracking: true,
      mobileApp: true,
      api: true,
      whiteLabel: true
    }
  },
  {
    id: 'comp_3',
    name: 'Wayne Enterprises',
    logo: 'bg-gradient-to-tr from-slate-700 to-slate-900',
    ownerName: 'Bruce Wayne',
    email: 'alfred.p@wayne.com',
    phone: '+1 (555) 987-6543',
    employeesCount: 850,
    subscriptionPlanId: 'business',
    storageUsed: 210.4,
    status: 'active',
    createdDate: '2025-02-18',
    modulesEnabled: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: true,
      performance: true,
      assets: true,
      training: true,
      aiReports: true,
      chat: true,
      projects: true,
      faceRecognition: true,
      gpsTracking: true,
      mobileApp: true,
      api: true,
      whiteLabel: false
    }
  },
  {
    id: 'comp_4',
    name: 'Cyberdyne Systems',
    logo: 'bg-gradient-to-tr from-blue-600 to-cyan-500',
    ownerName: 'Miles Dyson',
    email: 'm.dyson@cyberdyne.com',
    phone: '+1 (555) 800-1984',
    employeesCount: 12,
    subscriptionPlanId: 'free_trial',
    storageUsed: 0.8,
    status: 'trial',
    createdDate: '2026-06-20',
    modulesEnabled: {
      attendance: true,
      leave: true,
      payroll: false,
      recruitment: false,
      performance: false,
      assets: false,
      training: false,
      aiReports: false,
      chat: true,
      projects: false,
      faceRecognition: false,
      gpsTracking: false,
      mobileApp: false,
      api: false,
      whiteLabel: false
    }
  },
  {
    id: 'comp_5',
    name: 'Umbrella Corporation',
    logo: 'bg-gradient-to-tr from-red-600 to-slate-900',
    ownerName: 'Albert Wesker',
    email: 'wesker@umbrella.com',
    phone: '+1 (555) 666-1010',
    employeesCount: 45,
    subscriptionPlanId: 'starter',
    storageUsed: 12.8,
    status: 'suspended',
    createdDate: '2025-08-30',
    modulesEnabled: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: true,
      performance: false,
      assets: true,
      training: false,
      aiReports: false,
      chat: false,
      projects: false,
      faceRecognition: false,
      gpsTracking: false,
      mobileApp: true,
      api: false,
      whiteLabel: false
    }
  },
  {
    id: 'comp_6',
    name: 'Oscorp Industries',
    logo: 'bg-gradient-to-tr from-green-500 to-emerald-700',
    ownerName: 'Norman Osborn',
    email: 'n.osborn@oscorp.com',
    phone: '+1 (555) 777-8888',
    employeesCount: 95,
    subscriptionPlanId: 'starter',
    storageUsed: 9.9,
    status: 'expired',
    createdDate: '2025-05-01',
    modulesEnabled: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: true,
      performance: false,
      assets: true,
      training: false,
      aiReports: false,
      chat: true,
      projects: false,
      faceRecognition: false,
      gpsTracking: false,
      mobileApp: true,
      api: false,
      whiteLabel: false
    }
  },
  {
    id: 'comp_7',
    name: 'Initech Inc.',
    logo: 'bg-gradient-to-tr from-teal-400 to-emerald-400',
    ownerName: 'Peter Gibbons',
    email: 'peter@initech.com',
    phone: '+1 (555) 321-4567',
    employeesCount: 88,
    subscriptionPlanId: 'professional',
    storageUsed: 22.1,
    status: 'active',
    createdDate: '2025-03-05',
    modulesEnabled: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: true,
      performance: true,
      assets: true,
      training: false,
      aiReports: true,
      chat: true,
      projects: true,
      faceRecognition: true,
      gpsTracking: true,
      mobileApp: true,
      api: false,
      whiteLabel: false
    }
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_1',
    companyId: 'comp_2',
    companyName: 'Stark Industries',
    amount: 999,
    gateway: 'stripe',
    status: 'successful',
    timestamp: '2026-06-28T14:32:00Z',
    invoiceNumber: 'INV-2026-084'
  },
  {
    id: 'pay_2',
    companyId: 'comp_3',
    companyName: 'Wayne Enterprises',
    amount: 499,
    gateway: 'paypal',
    status: 'successful',
    timestamp: '2026-06-28T09:15:00Z',
    invoiceNumber: 'INV-2026-083'
  },
  {
    id: 'pay_3',
    companyId: 'comp_1',
    companyName: 'Acme Corporation',
    amount: 149,
    gateway: 'credit_card',
    status: 'successful',
    timestamp: '2026-06-27T18:45:00Z',
    invoiceNumber: 'INV-2026-082'
  },
  {
    id: 'pay_4',
    companyId: 'comp_5',
    companyName: 'Umbrella Corporation',
    amount: 49,
    gateway: 'bank_transfer',
    status: 'failed',
    timestamp: '2026-06-26T11:20:00Z',
    invoiceNumber: 'INV-2026-081'
  },
  {
    id: 'pay_5',
    companyId: 'comp_7',
    companyName: 'Initech Inc.',
    amount: 149,
    gateway: 'razorpay',
    status: 'successful',
    timestamp: '2026-06-25T16:10:00Z',
    invoiceNumber: 'INV-2026-080'
  },
  {
    id: 'pay_6',
    companyId: 'comp_6',
    companyName: 'Oscorp Industries',
    amount: 49,
    gateway: 'upi',
    status: 'pending',
    timestamp: '2026-06-29T08:00:00Z',
    invoiceNumber: 'INV-2026-085'
  },
  {
    id: 'pay_7',
    companyId: 'comp_2',
    companyName: 'Stark Industries',
    amount: 999,
    gateway: 'stripe',
    status: 'successful',
    timestamp: '2026-05-28T14:32:00Z',
    invoiceNumber: 'INV-2026-074'
  },
  {
    id: 'pay_8',
    companyId: 'comp_3',
    companyName: 'Wayne Enterprises',
    amount: 499,
    gateway: 'paypal',
    status: 'successful',
    timestamp: '2026-05-18T09:15:00Z',
    invoiceNumber: 'INV-2026-073'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Priya Sharma',
    email: 'priya.sharma@superowner.io',
    role: 'Super Owner',
    status: 'active',
    companyName: 'SUPEROWNER Platform',
    createdDate: '2024-01-01'
  },
  {
    id: 'usr_2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@acme.com',
    role: 'Company Admin',
    status: 'active',
    companyName: 'Acme Corporation',
    createdDate: '2025-01-15'
  },
  {
    id: 'usr_3',
    name: 'David Banner',
    email: 'd.banner@stark.com',
    role: 'HR',
    status: 'active',
    companyName: 'Stark Industries',
    createdDate: '2024-08-01'
  },
  {
    id: 'usr_4',
    name: 'Selina Kyle',
    email: 'selina@wayne.com',
    role: 'Manager',
    status: 'active',
    companyName: 'Wayne Enterprises',
    createdDate: '2025-02-20'
  },
  {
    id: 'usr_5',
    name: 'Albert Wesker',
    email: 'wesker@umbrella.com',
    role: 'Company Admin',
    status: 'suspended',
    companyName: 'Umbrella Corporation',
    createdDate: '2025-08-30'
  },
  {
    id: 'usr_6',
    name: 'Peter Parker',
    email: 'p.parker@oscorp.com',
    role: 'Employee',
    status: 'active',
    companyName: 'Oscorp Industries',
    createdDate: '2025-06-15'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp_1',
    code: 'SUPERLAUNCH30',
    discountType: 'percentage',
    value: 30,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 142,
    status: 'active'
  },
  {
    id: 'cp_2',
    code: 'FESTIVE100',
    discountType: 'flat',
    value: 100,
    expiryDate: '2026-08-30',
    usageLimit: 100,
    usageCount: 45,
    status: 'active'
  },
  {
    id: 'cp_3',
    code: 'ENTERPRISEFREE',
    discountType: 'percentage',
    value: 100,
    expiryDate: '2026-07-15',
    usageLimit: 5,
    usageCount: 2,
    status: 'inactive'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_1',
    subject: 'API integration returning 500 error',
    companyName: 'Stark Industries',
    requesterName: 'Tony Stark',
    requesterEmail: 'tony@stark.com',
    priority: 'urgent',
    status: 'open',
    createdDate: '2026-06-29T08:12:00Z',
    messages: [
      {
        id: 'msg_1',
        senderName: 'Tony Stark',
        senderRole: 'Company Admin',
        content: 'Hi, we are trying to sync our employee payroll directory via Webhook / REST API, but the server returns a 500 Internal Server Error for endpoints under /api/v1/employees. Can you check our token configuration?',
        timestamp: '2026-06-29T08:12:00Z',
        isAgent: false
      }
    ]
  },
  {
    id: 'tkt_2',
    subject: 'Request for custom white-label domain mapping',
    companyName: 'Wayne Enterprises',
    requesterName: 'Alfred Pennyworth',
    requesterEmail: 'alfred.p@wayne.com',
    priority: 'high',
    status: 'pending',
    createdDate: '2026-06-28T10:30:00Z',
    messages: [
      {
        id: 'msg_2',
        senderName: 'Alfred Pennyworth',
        senderRole: 'Company Admin',
        content: 'Hello Support, we need our dashboard to map to hrms.waynecorp.com. We have updated our DNS records with CNAME routing pointing to your proxy. Please configure the SSL mapping on your side.',
        timestamp: '2026-06-28T10:30:00Z',
        isAgent: false
      },
      {
        id: 'msg_3',
        senderName: 'Support Agent (Priya)',
        senderRole: 'Super Owner Support',
        content: 'Hello Alfred, I see the CNAME is resolved correctly. I have added hrms.waynecorp.com to our custom domain gateway. Please test it now and let me know if SSL resolves properly.',
        timestamp: '2026-06-28T11:15:00Z',
        isAgent: true
      },
      {
        id: 'msg_4',
        senderName: 'Alfred Pennyworth',
        senderRole: 'Company Admin',
        content: 'Thank you. The page is loading, but the CSS assets are showing mixed-content warnings. Let me check our site headers.',
        timestamp: '2026-06-28T12:00:00Z',
        isAgent: false
      }
    ]
  },
  {
    id: 'tkt_3',
    subject: 'Face recognition module not recognizing night shifts',
    companyName: 'Acme Corporation',
    requesterName: 'Sarah Jenkins',
    requesterEmail: 'sarah.j@acme.com',
    priority: 'medium',
    status: 'resolved',
    createdDate: '2026-06-25T15:20:00Z',
    messages: [
      {
        id: 'msg_5',
        senderName: 'Sarah Jenkins',
        senderRole: 'Company Admin',
        content: 'Our night shift workers (10 PM to 6 AM) are facing issues checking in via the face recognition tablet application. It complains about poor lighting and fails matching.',
        timestamp: '2026-06-25T15:20:00Z',
        isAgent: false
      },
      {
        id: 'msg_6',
        senderName: 'Support Agent (Priya)',
        senderRole: 'Super Owner Support',
        content: 'Hi Sarah, we have pushed a v2.1.2 update to the tablet app that includes low-light auto-brightness calibration. Please make sure the device application is updated in the app store.',
        timestamp: '2026-06-26T09:40:00Z',
        isAgent: true
      },
      {
        id: 'msg_7',
        senderName: 'Sarah Jenkins',
        senderRole: 'Company Admin',
        content: 'That resolved it! Thank you.',
        timestamp: '2026-06-26T14:10:00Z',
        isAgent: false
      }
    ]
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    action: 'Company Created',
    details: 'New trial company "Cyberdyne Systems" registered.',
    timestamp: '2026-06-29T10:15:00Z',
    category: 'company',
    actorName: 'Miles Dyson (Miles Dyson)'
  },
  {
    id: 'log_2',
    action: 'Plan Purchased',
    details: 'Stark Industries purchased Enterprise Plan ($999/mo).',
    timestamp: '2026-06-29T09:02:00Z',
    category: 'subscription',
    actorName: 'Tony Stark'
  },
  {
    id: 'log_3',
    action: 'Payment Successful',
    details: 'Transaction of $999 verified on Stripe for invoice INV-2026-084.',
    timestamp: '2026-06-29T09:02:05Z',
    category: 'payment',
    actorName: 'Stripe Gateway'
  },
  {
    id: 'log_4',
    action: 'Feature Enabled',
    details: 'White Labeling module enabled for Stark Industries.',
    timestamp: '2026-06-29T09:05:00Z',
    category: 'feature',
    actorName: 'Priya Sharma'
  },
  {
    id: 'log_5',
    action: 'User Login',
    details: 'Super Owner Priya Sharma logged in from IP 192.168.1.45 (Windows / Chrome).',
    timestamp: '2026-06-29T08:30:00Z',
    category: 'security',
    actorName: 'Priya Sharma'
  },
  {
    id: 'log_6',
    action: 'Subscription Renewed',
    details: 'Wayne Enterprises subscription automatically renewed.',
    timestamp: '2026-06-28T00:01:00Z',
    category: 'subscription',
    actorName: 'Billing Service'
  },
  {
    id: 'log_7',
    action: 'Company Suspended',
    details: 'Umbrella Corporation suspended due to compliance concerns.',
    timestamp: '2026-06-27T16:00:00Z',
    category: 'company',
    actorName: 'Priya Sharma'
  },
  {
    id: 'log_8',
    action: 'Coupon Created',
    details: 'Promo code SUPERLAUNCH30 created (30% discount, 500 limits).',
    timestamp: '2026-06-25T11:00:00Z',
    category: 'settings',
    actorName: 'Priya Sharma'
  }
];
