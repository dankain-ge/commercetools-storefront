import { NextRequest, NextResponse } from 'next/server';
import { getSession, jsonWithSession } from '@/lib/session';
import { signIn } from '@/lib/ct/auth';
import { mapCustomer } from '@/lib/mappers/customer';
import { ctErrorMessage, ctErrorCode } from '@/lib/ct/cart';

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  const session = await getSession();
  try {
    // Merge only a guest cart; a cart owned by a previously signed-in customer is not an anonymous cart.
    const result = await signIn(email, password, session.customerId ? undefined : session.cartId);
    const customer = mapCustomer(result.customer);
    return jsonWithSession({ customer }, {
      customerId: customer.id,
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      cartId: result.cart?.id ?? undefined,
    });
  } catch (e) {
    const msg = ctErrorMessage(e, 'Login failed');
    const status = ctErrorCode(e) === 'InvalidCredentials' ? 401 : 500;
    return NextResponse.json({ error: status === 401 ? 'Invalid email or password' : msg }, { status });
  }
}
