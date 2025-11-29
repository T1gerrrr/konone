// MoMo Payment Service
// Lưu ý: Cần backend server để xử lý thanh toán MoMo vì cần Secret Key

const MOMO_API_BASE = process.env.REACT_APP_MOMO_API_URL || 'http://localhost:3001/api/momo';

/**
 * Tạo payment request đến MoMo
 * @param {Object} paymentData - Thông tin thanh toán
 * @param {number} paymentData.amount - Số tiền (VNĐ)
 * @param {string} paymentData.orderId - Mã đơn hàng
 * @param {string} paymentData.orderInfo - Thông tin đơn hàng
 * @param {string} paymentData.packageId - ID gói Premium (1month, 3months, 1year, lifetime)
 * @returns {Promise<Object>} Payment URL từ MoMo
 */
export async function createMoMoPayment(paymentData) {
  try {
    const response = await fetch(`${MOMO_API_BASE}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tạo thanh toán MoMo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating MoMo payment:', error);
    throw error;
  }
}

/**
 * Kiểm tra trạng thái thanh toán
 * @param {string} orderId - Mã đơn hàng
 * @returns {Promise<Object>} Trạng thái thanh toán
 */
export async function checkPaymentStatus(orderId) {
  try {
    const response = await fetch(`${MOMO_API_BASE}/status/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Lỗi khi kiểm tra trạng thái thanh toán');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

/**
 * Xử lý callback từ MoMo sau khi thanh toán
 * @param {Object} callbackData - Dữ liệu từ MoMo callback
 * @returns {Promise<Object>} Kết quả xử lý
 */
export async function handleMoMoCallback(callbackData) {
  try {
    const response = await fetch(`${MOMO_API_BASE}/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callbackData),
    });

    if (!response.ok) {
      throw new Error('Lỗi khi xử lý callback từ MoMo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error handling MoMo callback:', error);
    throw error;
  }
}

/**
 * Định nghĩa các gói Premium
 */
export const PREMIUM_PACKAGES = {
  '1month': {
    id: '1month',
    name: 'Premium 1 Tháng',
    days: 30,
    price: 99000, // 99,000 VNĐ
    originalPrice: 129000,
    discount: '23%',
    popular: false,
  },
  '3months': {
    id: '3months',
    name: 'Premium 3 Tháng',
    days: 90,
    price: 249000, // 249,000 VNĐ
    originalPrice: 387000,
    discount: '36%',
    popular: true,
    savings: 'Tiết kiệm 138,000đ',
  },
  '1year': {
    id: '1year',
    name: 'Premium 1 Năm',
    days: 365,
    price: 799000, // 799,000 VNĐ
    originalPrice: 1548000,
    discount: '48%',
    popular: false,
    savings: 'Tiết kiệm 749,000đ',
  },
  'lifetime': {
    id: 'lifetime',
    name: 'Premium Vĩnh Viễn',
    days: 9999,
    price: 2990000, // 2,990,000 VNĐ
    originalPrice: null,
    discount: null,
    popular: false,
    badge: 'Best Value',
  },
};

/**
 * Format số tiền VNĐ
 */
export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

