import 'server-only';
import type { CustomerSignInResult } from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { mapCustomer } from '@/lib/mappers/customer';
import type { Account } from '@/lib/types';

export async function signIn(email: string, password: string, anonymousCartId?: string): Promise<CustomerSignInResult> {
  const { body } = await apiRoot.login().post({
    body: {
      email,
      password,
      updateProductData: true,
      ...(anonymousCartId && { anonymousCartId, anonymousCartSignInMode: 'MergeWithExistingCustomerCart' }),
    },
  }).execute();
  return body;
}

export interface SignUpInput { email: string; password: string; firstName?: string; lastName?: string }

/** Creates the customer, attaching the guest cart, and returns the sign-in result (customer + cart). */
export async function signUp(input: SignUpInput, anonymousCartId?: string): Promise<CustomerSignInResult> {
  const { body } = await apiRoot.customers().post({
    body: {
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      ...(anonymousCartId && { anonymousCart: { typeId: 'cart', id: anonymousCartId } }),
    },
  }).execute();
  return body;
}

export async function getCustomerById(id: string): Promise<Account> {
  const { body } = await apiRoot.customers().withId({ ID: id }).get().execute();
  return mapCustomer(body);
}
