import type { Customer } from '@commercetools/platform-sdk';
import type { Account } from '@/lib/types';
import { mapAddress } from './cart';

export function mapCustomer(c: Customer): Account {
  return {
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    addresses: c.addresses.map((a) => mapAddress(a)!).filter(Boolean),
    defaultShippingAddressId: c.defaultShippingAddressId,
    defaultBillingAddressId: c.defaultBillingAddressId,
  };
}
