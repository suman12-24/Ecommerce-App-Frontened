import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
const MakePaymentScreen2 = ({ route }) => {
    const navigation = useNavigation();
    const { orderId, totalAmount } = route.params;
    console.log('orderId', orderId);
    console.log('totalAmount', totalAmount);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const paymentData = {
        "o_id": orderId,
        "total_amount": totalAmount,
        "transactionId": "1rrr2adsfsf",
        "order_status": "Success"
    };

    const handlePaymentSuccess = async () => {
        setLoading(true);
        try {
            // Make API call to the success endpoint
            const response = await axiosInstance.put('/Suhani-Electronics-Backend/f_payment.php', paymentData);
            console.log('API Response:', response.data);
            // Check if the API call was successful
            if (response.data && response?.data?.success === true) {
                dispatch(clearCart());
                // Here you might want to navigate to a confirmation screen
                navigation.navigate('PaymentSuccess', {
                    orderId, totalAmount
                });
            } else {
                navigation.navigate('PaymentFailed');
            }
        } catch (error) {
            console.error('API Error:', error);
            Alert.alert(
                'Error',
                'There was an error processing your payment. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentFailed = () => {
        navigation.navigate('PaymentFailed');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Make a Payment</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.successButton}
                    onPress={handlePaymentSuccess}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Processing...' : '✔ Payment Success'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.failedButton}
                    onPress={handlePaymentFailed}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>✖ Payment Failed</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MakePaymentScreen2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e88e5',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    successButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 15,
        width: '80%',
        alignItems: 'center',
        elevation: 5,
    },
    failedButton: {
        backgroundColor: '#D32F2F',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});