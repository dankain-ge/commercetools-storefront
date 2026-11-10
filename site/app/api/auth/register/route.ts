import { NextRequest, NextResponse } from 'next/server';
import { getSession, jsonWithSession } from '@/lib/session';
import { signUp } from '@/lib/ct/auth';
import { mapCustomer } from '@/lib/mappers/customer';
import { ctErrorMessage, ctErrorCode } from '@/lib/ct/cart';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string; firstName?: string; lastName?: string };
  if (!body.email || !body.password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  if (body.password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  const session = await getSession();
  try {
    // Only a guest cart can be handed to the new customer; a cart already owned by a signed-in customer must not be passed.
    const guestCartId = session.customerId ? undefined : session.cartId;
    const result = await signUp({ email: body.email, password: body.password, firstName: body.firstName, lastName: body.lastName }, guestCartId);
    const customer = mapCustomer(result.customer);
    return jsonWithSession({ customer }, {
      customerId: customer.id,
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      cartId: result.cart?.id ?? guestCartId,
    }, { status: 201 });
  } catch (e) {
    const msg = ctErrorMessage(e, 'Registration failed');
    const status = ctErrorCode(e) === 'DuplicateField' ? 409 : 500;
    return NextResponse.json({ error: status === 409 ? 'An account with this email already exists' : msg }, { status });
  }
}
