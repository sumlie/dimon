export type AuthIdentity = {
  provider: string;
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  linkedAt: string | null;
  lastLoginAt: string | null;
};

export type CustomerAddress = {
  id?: string | null;
  label?: string | null;
  recipientName?: string | null;
  recipientPhone?: string | null;
  deliveryMethod?: string | null;
  address: string;
  isDefault?: boolean | null;
};

export type AuthCustomer = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  username: string | null;
  addresses: CustomerAddress[];
  defaultPaymentMethod: string | null;
  emailVerifiedAt: string | null;
  registrationCompletedAt: string | null;
  createdAt: string;
};

export type MeResponse = {
  customer: AuthCustomer | null;
  identities: AuthIdentity[];
};

export type TelegramStartResponse = {
  botUsername: string;
  authUrl: string;
  error?: string;
};

export type OnboardingProfile = {
  provider: string;
  email: string;
  name: string;
  username: string;
  emailVerified: boolean;
};
