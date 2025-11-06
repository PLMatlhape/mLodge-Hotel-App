import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';
import type {
  PaymentIntent,
  PaymentResult,
  PaymentMethod,
  CreditCardDetails,
} from '../../services/paymentService';

interface PaymentState {
  currentIntent: PaymentIntent | null;
  paymentResult: PaymentResult | null;
  savedPaymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod['type'] | null;
  processing: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  currentIntent: null,
  paymentResult: null,
  savedPaymentMethods: [],
  selectedPaymentMethod: null,
  processing: false,
  error: null,
};

// Async thunks
export const createPaymentIntent = createAsyncThunk(
  'payment/createIntent',
  async ({
    amount,
    currency,
    metadata,
  }: {
    amount: number;
    currency?: string;
    metadata: PaymentIntent['metadata'];
  }) => {
    const intent = await paymentService.createPaymentIntent(amount, currency, metadata);
    return intent;
  }
);

export const processCreditCardPayment = createAsyncThunk(
  'payment/processCreditCard',
  async ({
    cardDetails,
    amount,
    currency,
    metadata,
  }: {
    cardDetails: CreditCardDetails;
    amount: number;
    currency?: string;
    metadata: PaymentIntent['metadata'];
  }) => {
    const result = await paymentService.processCreditCardPayment(
      cardDetails,
      amount,
      currency,
      metadata
    );
    return result;
  }
);

export const initializePayPalPayment = createAsyncThunk(
  'payment/initializePayPal',
  async ({
    amount,
    currency,
    metadata,
  }: {
    amount: number;
    currency?: string;
    metadata: PaymentIntent['metadata'];
  }) => {
    const result = await paymentService.initializePayPalPayment(amount, currency, metadata);
    return result;
  }
);

export const capturePayPalPayment = createAsyncThunk(
  'payment/capturePayPal',
  async (orderId: string) => {
    const result = await paymentService.capturePayPalPayment(orderId);
    return result;
  }
);

export const verifyBankTransfer = createAsyncThunk(
  'payment/verifyBankTransfer',
  async ({
    reference,
    amount,
    currency,
  }: {
    reference: string;
    amount: number;
    currency?: string;
  }) => {
    const result = await paymentService.verifyBankTransfer(reference, amount, currency);
    return result;
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setSelectedPaymentMethod: (state, action: PayloadAction<PaymentMethod['type']>) => {
      state.selectedPaymentMethod = action.payload;
      state.error = null;
    },
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.savedPaymentMethods.push(action.payload);
    },
    removePaymentMethod: (state, action: PayloadAction<string>) => {
      state.savedPaymentMethods = state.savedPaymentMethods.filter(
        (pm) => pm.id !== action.payload
      );
    },
    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      state.savedPaymentMethods = state.savedPaymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === action.payload,
      }));
    },
    clearPaymentResult: (state) => {
      state.paymentResult = null;
      state.error = null;
    },
    clearPaymentIntent: (state) => {
      state.currentIntent = null;
    },
    resetPaymentState: (state) => {
      state.currentIntent = null;
      state.paymentResult = null;
      state.processing = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.processing = false;
        state.currentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.processing = false;
        state.error = action.error.message || 'Failed to create payment intent';
      })
      // Process credit card payment
      .addCase(processCreditCardPayment.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(processCreditCardPayment.fulfilled, (state, action) => {
        state.processing = false;
        state.paymentResult = action.payload;
        if (!action.payload.success) {
          state.error = action.payload.errorMessage || 'Payment failed';
        }
      })
      .addCase(processCreditCardPayment.rejected, (state, action) => {
        state.processing = false;
        state.error = action.error.message || 'Payment processing failed';
      })
      // Initialize PayPal payment
      .addCase(initializePayPalPayment.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(initializePayPalPayment.fulfilled, (state) => {
        state.processing = false;
      })
      .addCase(initializePayPalPayment.rejected, (state, action) => {
        state.processing = false;
        state.error = action.error.message || 'Failed to initialize PayPal payment';
      })
      // Capture PayPal payment
      .addCase(capturePayPalPayment.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(capturePayPalPayment.fulfilled, (state, action) => {
        state.processing = false;
        state.paymentResult = action.payload;
      })
      .addCase(capturePayPalPayment.rejected, (state, action) => {
        state.processing = false;
        state.error = action.error.message || 'Failed to capture PayPal payment';
      })
      // Verify bank transfer
      .addCase(verifyBankTransfer.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(verifyBankTransfer.fulfilled, (state, action) => {
        state.processing = false;
        state.paymentResult = action.payload;
      })
      .addCase(verifyBankTransfer.rejected, (state, action) => {
        state.processing = false;
        state.error = action.error.message || 'Failed to verify bank transfer';
      });
  },
});

export const {
  setSelectedPaymentMethod,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  clearPaymentResult,
  clearPaymentIntent,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
