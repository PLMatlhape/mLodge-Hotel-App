# Payment Integration Testing Guide

## 🚀 Quick Start

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Navigate to Booking**
   - Go to any room listing
   - Click "Book Now"
   - Fill in booking details (dates, guests, etc.)

3. **Test Payment Flow**
   - Scroll to payment section
   - Select a payment method
   - Fill in payment details
   - Click "Pay Securely"

---

## 🧪 Test Cases

### Test 1: Credit Card Validation

#### Valid Card Numbers (for testing)
- **Visa:** 4532015112830366
- **Mastercard:** 5425233430109903
- **Amex:** 374245455400126
- **Discover:** 6011000991300009

#### Invalid Card Numbers
- **Too short:** 4532 0151 1283 036
- **Invalid checksum:** 4532 0151 1283 0367
- **Non-numeric:** 4532-0151-1283-0366

#### Expected Behavior
- ✅ Valid cards show green checkmark
- ❌ Invalid cards show error message
- 🔍 Card brand automatically detected

---

### Test 2: Expiry Date Validation

#### Test Cases
| Input | Expected Result | Message |
|-------|----------------|---------|
| 12/25 | ❌ Error | Card has expired |
| 01/24 | ❌ Error | Card has expired |
| 12/26 | ✅ Valid | - |
| 06/30 | ✅ Valid | - |
| 13/26 | ❌ Error | Invalid month |
| 00/26 | ❌ Error | Invalid month |

---

### Test 3: CVV Validation

#### Test Cases
| Card Type | CVV | Expected Result |
|-----------|-----|----------------|
| Visa | 123 | ✅ Valid |
| Visa | 12 | ❌ Error (too short) |
| Visa | 1234 | ❌ Error (too long) |
| Amex | 1234 | ✅ Valid |
| Amex | 123 | ❌ Error (too short) |

---

### Test 4: Payment Processing

#### Credit Card Payment
1. Select "Credit/Debit Card"
2. Enter valid card details:
   - Card Number: 4532 0151 1283 0366
   - Name: John Doe
   - Expiry: 12/26
   - CVV: 123
3. Click "Pay Securely"
4. Wait for 2-second processing
5. **Expected:** 90% success rate
   - **Success:** Booking created, redirected to dashboard
   - **Failure:** Error message shown, can retry

---

### Test 5: Bank Transfer

1. Select "Bank Transfer"
2. Note the bank details displayed:
   - Bank: First National Bank (FNB)
   - Account: mLodge Hotel PTY LTD
   - Account Number: 62 7891 2345 6
   - Branch Code: 250 655
   - Reference: MLODGE-XXXX-XXXXXXXX-XXXX
3. Click "Pay Securely"
4. **Expected:** Success (instant confirmation)
   - Note: In production, this would be pending verification

---

### Test 6: PayPal

1. Select "PayPal"
2. Click "Continue to PayPal"
3. **Expected:** Alert message about redirect
   - In production, would redirect to PayPal login
4. After redirect, payment would be captured

---

### Test 7: Processing Fees

#### Verify Fee Calculation
| Payment Method | Amount | Expected Fee | Expected Total |
|---------------|--------|-------------|----------------|
| Credit Card | R1,000 | R29.30 | R1,029.30 |
| Credit Card | R5,000 | R145.30 | R5,145.30 |
| PayPal | R1,000 | R34.35 | R1,034.35 |
| PayPal | R5,000 | R170.35 | R5,170.35 |
| Bank Transfer | R1,000 | R0.00 | R1,000.00 |
| Bank Transfer | R5,000 | R0.00 | R5,000.00 |

**Formula:**
- Credit Card: `amount * 0.029 + 30`
- PayPal: `amount * 0.034 + 35`
- Bank Transfer: `0`

---

### Test 8: Error Handling

#### Test Cases
1. **Missing Cardholder Name**
   - Leave name field empty
   - Click "Pay Securely"
   - **Expected:** Error message "Cardholder name is required"

2. **Invalid Card Number**
   - Enter: 1234 5678 9012 3456
   - Click "Pay Securely"
   - **Expected:** Error message "Invalid card number"

3. **Expired Card**
   - Enter expiry: 12/23
   - Click "Pay Securely"
   - **Expected:** Error message "Card has expired"

4. **Payment Failure (10% chance)**
   - Enter valid details
   - Click "Pay Securely"
   - If fails: **Expected:** Error toast, can retry
   - If succeeds: **Expected:** Booking created

---

### Test 9: Terms and Conditions

1. Try to submit without checking terms
2. **Expected:** Payment form doesn't open
3. Check the terms checkbox
4. **Expected:** Can now proceed to payment

---

### Test 10: Loading States

1. Click "Pay Securely"
2. **During Processing:**
   - Button shows "Processing..." with spinner
   - Button is disabled
   - All form fields disabled
   - Cannot select different payment method
3. **After Success:**
   - Success toast message
   - Redirected to dashboard
4. **After Error:**
   - Error toast message
   - Form re-enabled
   - Can retry payment

---

## 🎯 Success Criteria

### ✅ Must Pass
- [ ] Valid card numbers are accepted
- [ ] Invalid card numbers are rejected with error
- [ ] Expired cards are rejected
- [ ] CVV validation works (3 for regular, 4 for Amex)
- [ ] Card brand is detected correctly
- [ ] Processing fees calculate correctly
- [ ] Payment success creates booking
- [ ] Payment failure shows error and allows retry
- [ ] Terms must be accepted before payment
- [ ] Loading states display correctly

### 🎨 User Experience
- [ ] Error messages are clear and helpful
- [ ] Form is responsive on mobile
- [ ] Payment methods are easy to switch
- [ ] Processing fee is transparent
- [ ] Card number formats automatically
- [ ] Expiry date formats automatically (MM/YY)

---

## 🐛 Common Issues

### Issue 1: "Invalid card number" on valid card
**Cause:** Card number includes spaces or dashes  
**Solution:** Service automatically removes spaces/dashes

### Issue 2: CVV error on Amex card
**Cause:** Amex requires 4 digits, not 3  
**Solution:** CVV validation checks card brand

### Issue 3: Payment always fails
**Cause:** Mock processing has 10% failure rate  
**Solution:** This is expected for testing, retry

### Issue 4: User name undefined
**Cause:** User object doesn't have `name` property  
**Solution:** Uses fallback values (John Doe)

---

## 📊 Testing Checklist

### Manual Testing
- [ ] Test all 3 payment methods
- [ ] Test credit card validation
- [ ] Test expiry date validation
- [ ] Test CVV validation
- [ ] Test processing fee calculation
- [ ] Test successful payment flow
- [ ] Test failed payment flow
- [ ] Test terms validation
- [ ] Test loading states
- [ ] Test error messages

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 🔍 Debug Mode

### Enable Console Logging
Add to `paymentService.ts`:
```typescript
console.log('Validating card:', cardNumber);
console.log('Card brand:', this.detectCardBrand(cardNumber));
console.log('Luhn check:', this.validateCardNumber(cardNumber));
```

### Redux DevTools
1. Open Redux DevTools in browser
2. Watch for actions:
   - `payment/selectPaymentMethod`
   - `payment/processCreditCard/pending`
   - `payment/processCreditCard/fulfilled`
   - `payment/processCreditCard/rejected`

### Check Payment State
```javascript
// In browser console
store.getState().payment
```

---

## 🎉 Next Steps After Testing

1. **Fix any bugs found**
2. **Add real Stripe/PayPal integration**
3. **Set up environment variables**
4. **Create payment history page**
5. **Add receipt generation**
6. **Implement refund processing**
7. **Add payment analytics**

---

## 📝 Test Results Template

```markdown
### Test Session: [Date]

**Tester:** [Name]
**Browser:** [Chrome/Firefox/Safari/Edge]
**Device:** [Desktop/Mobile/Tablet]

#### Results

| Test | Status | Notes |
|------|--------|-------|
| Card Validation | ✅/❌ | |
| Expiry Validation | ✅/❌ | |
| CVV Validation | ✅/❌ | |
| Processing Fees | ✅/❌ | |
| Payment Success | ✅/❌ | |
| Payment Failure | ✅/❌ | |
| Bank Transfer | ✅/❌ | |
| PayPal | ✅/❌ | |
| Terms Validation | ✅/❌ | |
| Loading States | ✅/❌ | |

#### Issues Found
1. [Issue description]
2. [Issue description]

#### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## 🚨 Important Notes

1. **Mock Processing:** Current implementation simulates payment processing with 2-second delay and 90% success rate. This is for testing only.

2. **No Real Charges:** No actual payment processing occurs. Safe to test with any card numbers.

3. **Data Not Stored:** Card details are validated but never stored in state or database.

4. **Production Ready:** Once real Stripe/PayPal integration is added, the system is production-ready.

5. **Security:** Client-side validation only. Server-side validation required for production.
