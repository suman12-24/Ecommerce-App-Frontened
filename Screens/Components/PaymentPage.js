import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const PaymentPage = ({ setCurrentStep = () => { } }) => {
    // State management
    const [selectedPayment, setSelectedPayment] = useState(null);

    const fadeAnim = useSharedValue(0);
    const slideAnim = useSharedValue(100);
    const paymentMethodScale = {
        1: useSharedValue(1),
        2: useSharedValue(1),
        3: useSharedValue(1),
        4: useSharedValue(1),
        5: useSharedValue(1)
    };
    // Mock data
    const mockData = {
        paymentMethods: [
            { id: 1, name: "UPI", icon: "mobile-alt" },
            { id: 2, name: "Credit/Debit Card", icon: "credit-card" },
            { id: 3, name: "Net Banking", icon: "university" },
            { id: 4, name: "EMI", icon: "calendar-alt" },
            { id: 5, name: "Cash on Delivery", icon: "money-bill-wave" }
        ],
        orderDetails: {
            priceDetails: {
                total: 24999
            }
        }
    };

    // Animation setup
    useEffect(() => {
        fadeAnim.value = withTiming(1, { duration: 300 });
        slideAnim.value = withTiming(0, { duration: 300 });
    }, []);

    // Animated styles
    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeAnim.value,
            transform: [{ translateX: slideAnim.value }]
        };
    });

    // Handle payment method selection
    const handlePaymentSelect = (id) => {
        setSelectedPayment(id);

        // Animate selected payment method
        Object.keys(paymentMethodScale).forEach(key => {
            const numKey = Number(key);
            if (numKey === id) {
                paymentMethodScale[numKey].value = withSpring(1.02);
            } else {
                paymentMethodScale[numKey].value = withSpring(1);
            }
        });
    };

    // Go to previous step
    const goToPreviousStep = () => {
        fadeAnim.value = withTiming(0, { duration: 200 });
        slideAnim.value = withTiming(-100, { duration: 200 });

        setTimeout(() => {
            setCurrentStep(prevStep => prevStep - 1);
        }, 200);
    };

    // Generate animated styles for each payment method
    const getPaymentMethodStyle = (id) => {
        return useAnimatedStyle(() => {
            return {
                transform: [{ scale: paymentMethodScale[id].value }]
            };
        });
    };

    return (
        <Animated.View style={[styles.pageContainer, animatedContainerStyle]}>
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Payment Options</Text>
            </View>

            <View style={styles.paymentMethodsContainer}>
                {mockData.paymentMethods.map(method => (
                    <Animated.View
                        key={method.id}
                        style={getPaymentMethodStyle(method.id)}
                    >
                        <TouchableOpacity
                            style={[
                                styles.paymentMethodCard,
                                selectedPayment === method.id && styles.selectedPaymentMethod
                            ]}
                            onPress={() => handlePaymentSelect(method.id)}
                            activeOpacity={0.8}
                        >
                            <View style={[
                                styles.paymentMethodIcon,
                                selectedPayment === method.id && styles.selectedPaymentMethodIcon
                            ]}>
                                <FontAwesome5 name={method.icon} size={20} color={selectedPayment === method.id ? "#fff" : "#2874f0"} />
                            </View>
                            <Text style={styles.paymentMethodName}>{method.name}</Text>
                            {selectedPayment === method.id && (
                                <View style={styles.selectedPaymentIndicator}>
                                    <MaterialIcons name="check" size={16} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            {/* Price Summary */}
            <View style={styles.priceSummaryContainer}>
                <View style={styles.priceSummaryContent}>
                    <View style={styles.totalAmountContainer}>
                        <Text style={styles.totalAmountLabel}>Total Amount:</Text>
                        <Text style={styles.totalAmount}>₹{mockData.orderDetails.priceDetails.total.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCurrentStep(2)} style={styles.viewDetailContainer}>
                        <Text style={styles.viewDetailLink}>View Details</Text>
                        <MaterialIcons name="chevron-right" size={16} color="#2874f0" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={goToPreviousStep}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="arrow-back" size={20} color="#212121" />
                    <Text style={styles.backButtonText}>BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !selectedPayment && styles.disabledButton
                    ]}
                    disabled={!selectedPayment}
                    onPress={() => {
                        // Show success animation and message
                        Alert.alert('Success', 'Order Placed Successfully!');
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>PLACE ORDER</Text>
                    {selectedPayment && <MaterialIcons name="check-circle" size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default PaymentPage;

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        paddingBottom: 16,
    },
    headerContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        elevation: 2,
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    paymentMethodsContainer: {
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    paymentMethodCard: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedPaymentMethod: {
        backgroundColor: '#f5faff',
    },
    paymentMethodIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    selectedPaymentMethodIcon: {
        backgroundColor: '#2874f0',
    },
    paymentMethodName: {
        flex: 1,
        fontSize: 16,
        color: '#212121',
    },
    selectedPaymentIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2874f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceSummaryContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceSummaryContent: {
        flex: 1,
    },
    totalAmountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    totalAmountLabel: {
        marginRight: 8,
        color: '#757575',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewDetailLink: {
        color: '#2874f0',
    },
    navigationButtons: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        elevation: 2,
    },
    backButton: {
        marginRight: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#212121',
        marginLeft: 4,
        fontWeight: '500',
    },
    continueButton: {
        flex: 1,
        backgroundColor: '#fb641b',
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    continueButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 8,
    },
    disabledButton: {
        backgroundColor: '#e0e0e0',
    },
});