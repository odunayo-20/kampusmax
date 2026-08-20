import {
  SavedAddress,
  SavedPaymentMethod,
  NotificationPreferences,
  PrivacySettings,
  SecuritySettings,
  LoyaltyProgram,
} from "@/types";
import {
  savedAddresses as mockAddresses,
  savedPaymentMethods as mockPaymentMethods,
  defaultNotificationPreferences,
  defaultPrivacySettings,
  defaultSecuritySettings,
  loyaltyProgram,
} from "@/data/profile";

let addresses = [...mockAddresses];
let paymentMethods = [...mockPaymentMethods];
let notifPrefs = { ...defaultNotificationPreferences };
let privSettings = { ...defaultPrivacySettings };
let secSettings = { ...defaultSecuritySettings };

export function getSavedAddresses(): SavedAddress[] {
  return addresses;
}

export function addAddress(addr: Omit<SavedAddress, "id">): SavedAddress {
  const newAddr = { ...addr, id: `addr${Date.now()}` };
  addresses = [...addresses, newAddr];
  if (newAddr.isDefault) {
    addresses = addresses.map((a) =>
      a.id === newAddr.id ? a : { ...a, isDefault: false }
    );
  }
  return newAddr;
}

export function updateAddress(
  id: string,
  data: Partial<SavedAddress>
): SavedAddress | undefined {
  addresses = addresses.map((a) => (a.id === id ? { ...a, ...data } : a));
  if (data.isDefault) {
    addresses = addresses.map((a) =>
      a.id === id ? a : { ...a, isDefault: false }
    );
  }
  return addresses.find((a) => a.id === id);
}

export function deleteAddress(id: string): void {
  addresses = addresses.filter((a) => a.id !== id);
}

export function getSavedPaymentMethods(): SavedPaymentMethod[] {
  return paymentMethods;
}

export function addPaymentMethod(
  method: Omit<SavedPaymentMethod, "id" | "createdAt">
): SavedPaymentMethod {
  const newMethod = {
    ...method,
    id: `pm${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  paymentMethods = [...paymentMethods, newMethod];
  return newMethod;
}

export function deletePaymentMethod(id: string): void {
  paymentMethods = paymentMethods.filter((m) => m.id !== id);
}

export function setDefaultPaymentMethod(id: string): void {
  paymentMethods = paymentMethods.map((m) => ({
    ...m,
    isDefault: m.id === id,
  }));
}

export function getNotificationPreferences(): NotificationPreferences {
  return notifPrefs;
}

export function updateNotificationPreferences(
  data: Partial<NotificationPreferences>
): NotificationPreferences {
  notifPrefs = { ...notifPrefs, ...data };
  return notifPrefs;
}

export function getPrivacySettings(): PrivacySettings {
  return privSettings;
}

export function updatePrivacySettings(
  data: Partial<PrivacySettings>
): PrivacySettings {
  privSettings = { ...privSettings, ...data };
  return privSettings;
}

export function getSecuritySettings(): SecuritySettings {
  return secSettings;
}

export function updateSecuritySettings(
  data: Partial<SecuritySettings>
): SecuritySettings {
  secSettings = { ...secSettings, ...data };
  return secSettings;
}

export function getLoyaltyProgram(): LoyaltyProgram {
  return loyaltyProgram;
}
