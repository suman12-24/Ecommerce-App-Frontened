import axios from 'axios';

const checkOrderStatus = async (user_token, order_id) => {
    try {
        const response = await axios.post(
            'https://khilaadixpro.shop/api/check-order-status',
            { user_token, order_id },
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data && response.data.result) {
            return response.data.result.status; // Example: "SUCCESS" or "PENDING"
        } else {
            return 'UNKNOWN';
        }
    } catch (error) {
        console.error('Check Order Status Error:', error);
        return 'ERROR';
    }
};

export default checkOrderStatus;
