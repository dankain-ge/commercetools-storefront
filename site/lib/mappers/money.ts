import type { TypedMoney, CentPrecisionMoney } from '@commercetools/platform-sdk';
import type { Money } from '@/lib/types';

export function mapMoney(m: TypedMoney | CentPrecisionMoney): Money {
  return { centAmount: m.centAmount, currencyCode: m.currencyCode, fractionDigits: m.fractionDigits };
}
