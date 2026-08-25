import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpayInstance = () => {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('mock')) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return null;
};

export const createRazorpayOrder = async (amountInINR, orderId) => {
  const rzp = getRazorpayInstance();
  const amountInPaise = Math.round(amountInINR * 100);

  if (!rzp) {
    // Mock sandbox order response
    const mockRzpOrderId = `rzp_mock_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      mock: true,
      order: {
        id: mockRzpOrderId,
        entity: 'order',
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderId,
        status: 'created',
      },
    };
  }

  try {
    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
    });
    return { success: true, mock: false, order };
  } catch (error) {
    console.error('Razorpay order creation error:', error.message);
    return { success: false, error: error.message };
  }
};

export const verifyRazorpayPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_razorpay_secret_456';
  
  if (razorpayOrderId.startsWith('rzp_mock_order_')) {
    // Accept mock payment in testing mode
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};
