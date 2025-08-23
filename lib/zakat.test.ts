import { test } from 'node:test';
import assert from 'node:assert';
import {
  calcNisab,
  calcZakat,
  GOLD_NISAB_GRAMS,
  OUNCE_TO_GRAM,
} from './zakat';

test('calcNisab and calcZakat below threshold', () => {
  const nisab = calcNisab(1000, GOLD_NISAB_GRAMS);
  const { obligatory, amount } = calcZakat(nisab - 1, nisab);
  assert.equal(obligatory, false);
  assert.equal(amount, 0);
});

test('calcNisab and calcZakat above threshold', () => {
  const nisab = calcNisab(1000, GOLD_NISAB_GRAMS);
  const { obligatory, amount } = calcZakat(nisab + 1000, nisab);
  assert.equal(obligatory, true);
  assert.equal(amount, (nisab + 1000) * 0.025);
});

test('integration with MetalpriceAPI sample', () => {
  const payload = {
    success: true,
    base: 'IDR',
    timestamp: 1755907199,
    rates: { IDRXAU: 54552212.3116184, XAU: 1.83e-8 },
  };
  const idrPerGram = payload.rates.IDRXAU / OUNCE_TO_GRAM;
  const nisab = calcNisab(idrPerGram, GOLD_NISAB_GRAMS);
  const { obligatory, amount } = calcZakat(nisab, nisab);
  assert.equal(Math.round(idrPerGram), Math.round(payload.rates.IDRXAU / OUNCE_TO_GRAM));
  assert.equal(obligatory, true);
  assert.equal(amount, nisab * 0.025);
});
