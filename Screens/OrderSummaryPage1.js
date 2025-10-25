import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, FlatList, Animated, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

// Mock data
const mockData = {
    addresses: [
        {
            id: 1,
            name: "John Doe",
            address: "123, Green Avenue, Park Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            phone: "+91 9876543210",
            isDefault: true
        },
        {
            id: 2,
            name: "John Doe",
            address: "456, Blue Villa, Lake Road",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411001",
            phone: "+91 9876543210",
            isDefault: false
        }
    ],
    orderDetails: {
        orderId: "OD123456789",
        orderDate: "15 Feb 2025",
        items: [
            {
                id: 1,
                name: "Samsung Galaxy M34 5G",
                price: 16999,
                quantity: 1,
                image: "/api/placeholder/80/80",
                rating: 4.5,
                ratingCount: 1253
            }
        ],
        priceDetails: {
            subtotal: 16999,
            discount: 2000,
            delivery: 40,
            total: 15039
        }
    },
    paymentMethods: [
        { id: 1, name: "UPI", icon: "mobile-alt" },
        { id: 2, name: "Credit/Debit Card", icon: "credit-card" },
        { id: 3, name: "Net Banking", icon: "university" },
        { id: 4, name: "EMI", icon: "calendar-alt" },
        { id: 5, name: "Cash on Delivery", icon: "money-bill-wave" }
    ]
};

const OrderSummaryPage = () => {
    const navigation = useNavigation();
    const navigationName = "OrderSummaryPage";
    const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Order Summary, 3: Payment
    const [selectedAddress, setSelectedAddress] = useState(mockData.addresses.find(addr => addr.isDefault) || mockData.addresses[0]);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(width)).current;
    const progressAnim = useRef(new Animated.Value(1)).current;

    // Card scale animations
    const addressCardScale = useRef({}).current;
    mockData.addresses.forEach(addr => {
        addressCardScale[addr.id] = new Animated.Value(1);
    });

    const paymentMethodScale = useRef({}).current;
    mockData.paymentMethods.forEach(method => {
        paymentMethodScale[method.id] = new Animated.Value(1);
    });

    // Handle step change animations
    useEffect(() => {
        // Reset animations
        fadeAnim.setValue(0);
        slideAnim.setValue(width);

        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
                toValue: currentStep,
                duration: 400,
                useNativeDriver: false,
            })
        ]).start();
    }, [currentStep]);

    // Handle address selection animations
    const handleAddressSelect = (address) => {
        // Reset all card scales
        Object.keys(addressCardScale).forEach(id => {
            Animated.timing(addressCardScale[id], {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });

        // Animate selected card
        Animated.sequence([
            Animated.timing(addressCardScale[address.id], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(addressCardScale[address.id], {
                toValue: 1.02,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(addressCardScale[address.id], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        setSelectedAddress(address);
    };

    // Handle payment method selection animations
    const handlePaymentSelect = (methodId) => {
        // Reset all payment method scales
        Object.keys(paymentMethodScale).forEach(id => {
            Animated.timing(paymentMethodScale[id], {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });

        // Animate selected method
        Animated.sequence([
            Animated.timing(paymentMethodScale[methodId], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(paymentMethodScale[methodId], {
                toValue: 1.02,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(paymentMethodScale[methodId], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        setSelectedPayment(methodId);
    };

    const goToNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Common component for all pages - Progress Bar
    const ProgressBar = () => {
        // Calculate progress width based on current step
        const progressWidth = progressAnim.interpolate({
            inputRange: [1, 2, 3],
            outputRange: ['33%', '66%', '100%'],
        });

        return (
            <View style={styles.progressBarContainer}>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>

                <View style={styles.progressStepsContainer}>
                    <View style={styles.progressStep}>
                        <View style={[styles.progressCircle, currentStep >= 1 && styles.activeCircle]}>
                            {currentStep > 1 ? (
                                <MaterialIcons name="check" size={16} color="#fff" />
                            ) : (
                                <Text style={styles.progressText}>1</Text>
                            )}
                        </View>
                        <Text style={[styles.progressLabel, currentStep >= 1 && styles.activeLabel]}>Address</Text>
                    </View>

                    <View style={styles.progressStep}>
                        <View style={[styles.progressCircle, currentStep >= 2 && styles.activeCircle]}>
                            {currentStep > 2 ? (
                                <MaterialIcons name="check" size={16} color="#fff" />
                            ) : (
                                <Text style={styles.progressText}>2</Text>
                            )}
                        </View>
                        <Text style={[styles.progressLabel, currentStep >= 2 && styles.activeLabel]}>Order Summary</Text>
                    </View>

                    <View style={styles.progressStep}>
                        <View style={[styles.progressCircle, currentStep >= 3 && styles.activeCircle]}>
                            <Text style={styles.progressText}>3</Text>
                        </View>
                        <Text style={[styles.progressLabel, currentStep >= 3 && styles.activeLabel]}>Payment</Text>
                    </View>
                </View>
            </View>
        );
    };

    // Step 1: Address Selection Page
    const AddressSelectionPage = () => (
        <Animated.View
            style={[
                styles.pageContainer,
                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
            ]}
        >
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Select Delivery Address</Text>
            </View>

            {mockData.addresses.map(address => (
                <Animated.View
                    key={address.id}
                    style={[
                        styles.addressCard,
                        selectedAddress.id === address.id && styles.selectedAddressCard,
                        { transform: [{ scale: addressCardScale[address.id] }] }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.addressCardContent}
                        onPress={() => handleAddressSelect(address)}
                        activeOpacity={0.8}
                    >
                        {address.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                            </View>
                        )}

                        <View style={styles.addressHeader}>
                            <View style={styles.addressNameContainer}>
                                <Ionicons name="person" size={16} color="#2874f0" style={styles.addressIcon} />
                                <Text style={styles.addressName}>{address.name}</Text>
                            </View>
                            {selectedAddress.id === address.id && (
                                <View style={styles.selectedIndicator}>
                                    <MaterialIcons name="check" size={16} color="#fff" />
                                </View>
                            )}
                        </View>

                        <View style={styles.addressDetails}>
                            <View style={styles.addressRow}>
                                <Ionicons name="location" size={16} color="#666" style={styles.addressIcon} />
                                <Text style={styles.addressText}>
                                    {address.address}
                                </Text>
                            </View>
                            <View style={styles.addressRow}>
                                <Ionicons name="business" size={16} color="#666" style={styles.addressIcon} />
                                <Text style={styles.addressText}>
                                    {address.city}, {address.state} - {address.pincode}
                                </Text>
                            </View>
                            <View style={styles.addressRow}>
                                <Ionicons name="call" size={16} color="#666" style={styles.addressIcon} />
                                <Text style={styles.addressText}>
                                    {address.phone}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.addressActions}>
                            <TouchableOpacity style={styles.addressActionBtn}>
                                <MaterialIcons name="edit" size={16} color="#2874f0" />
                                <Text style={styles.addressActionBtnText}>EDIT</Text>
                            </TouchableOpacity>
                            {!address.isDefault && (
                                <TouchableOpacity style={styles.addressActionBtn}>
                                    <MaterialIcons name="star-border" size={16} color="#2874f0" />
                                    <Text style={styles.addressActionBtnText}>MAKE DEFAULT</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            ))}

            <TouchableOpacity
                onPress={() => navigation.navigate("Account", {
                    screen: "AddCustomerAddress",
                    params: { navigationName }  // Pass params correctly inside an object
                })}
                style={styles.addNewAddressBtn} activeOpacity={0.8}>
                <MaterialIcons name="add-circle-outline" size={20} color="#2874f0" />
                <Text style={styles.addNewAddressBtnText}>ADD A NEW ADDRESS</Text>
            </TouchableOpacity>

            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={goToNextStep}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>DELIVER TO THIS ADDRESS</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    // Step 2: Order Summary Page
    const OrderSummaryPage = () => (
        <Animated.View
            style={[
                styles.pageContainer,
                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
            ]}
        >
            <View style={styles.headerContainer}>
                <View style={styles.orderStatusContainer}>
                    <Text style={styles.pageTitle}>Order Summary</Text>
                    <View style={styles.orderInfoContainer}>
                        <MaterialIcons name="shopping-bag" size={18} color="#2874f0" />
                        <Text style={styles.orderIdText}>Order ID: {mockData.orderDetails.orderId}</Text>
                    </View>
                </View>
            </View>

            {/* Items */}
            {mockData.orderDetails.items.map(item => (
                <View key={item.id} style={styles.itemContainer}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.productImage}
                    />
                    <View style={styles.itemDetails}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <View style={styles.ratingContainer}>
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>{item.rating} ★</Text>
                            </View>
                            <Text style={styles.ratingCount}>({item.ratingCount})</Text>
                        </View>
                        <Text style={styles.productPrice}>₹{item.price.toLocaleString()}</Text>

                        <View style={styles.quantityContainer}>
                            <Text style={styles.quantityLabel}>Quantity:</Text>
                            <View style={styles.quantityControls}>
                                <TouchableOpacity style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.quantity}>{item.quantity}</Text>
                                <TouchableOpacity style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            ))}

            {/* Selected Address */}
            <View style={styles.summarySection}>
                <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleContainer}>
                        <MaterialIcons name="location-on" size={20} color="#2874f0" />
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCurrentStep(1)} style={styles.changeLinkContainer}>
                        <Text style={styles.changeLink}>Change</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.addressSummary}>
                    <Text style={styles.addressName}>{selectedAddress.name}</Text>
                    <Text style={styles.addressText}>
                        {selectedAddress.address}
                    </Text>
                    <Text style={styles.addressText}>
                        {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </Text>
                    <Text style={styles.addressText}>
                        Phone: {selectedAddress.phone}
                    </Text>
                </View>
            </View>

            {/* Price Details */}
            <View style={styles.summarySection}>
                <View style={styles.sectionTitleContainer}>
                    <MaterialIcons name="receipt" size={20} color="#2874f0" />
                    <Text style={styles.sectionTitle}>Price Details</Text>
                </View>

                <View style={styles.priceContainer}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Price ({mockData.orderDetails.items.length} item)</Text>
                        <Text style={styles.priceValue}>₹{mockData.orderDetails.priceDetails.subtotal.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Discount</Text>
                        <Text style={styles.discountText}>-₹{mockData.orderDetails.priceDetails.discount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Delivery Charges</Text>
                        <Text style={styles.priceValue}>₹{mockData.orderDetails.priceDetails.delivery}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalText}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{mockData.orderDetails.priceDetails.total.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.savingsContainer}>
                    <MaterialIcons name="savings" size={18} color="#388e3c" />
                    <Text style={styles.savingsText}>
                        You'll save ₹{mockData.orderDetails.priceDetails.discount.toLocaleString()} on this order
                    </Text>
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
                    style={styles.continueButton}
                    onPress={goToNextStep}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>CONTINUE TO PAYMENT</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    // Step 3: Payment Page
    const PaymentPage = () => (
        <Animated.View
            style={[
                styles.pageContainer,
                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
            ]}
        >
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Payment Options</Text>
            </View>

            <View style={styles.paymentMethodsContainer}>
                {mockData.paymentMethods.map(method => (
                    <Animated.View
                        key={method.id}
                        style={{
                            transform: [{ scale: paymentMethodScale[method.id] }]
                        }}
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
                        alert('Order Placed Successfully!');
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>PLACE ORDER</Text>
                    {selectedPayment && <MaterialIcons name="check-circle" size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <ProgressBar />

            {currentStep === 1 && <AddressSelectionPage />}
            {currentStep === 2 && <OrderSummaryPage />}
            {currentStep === 3 && <PaymentPage />}
            <View style={{ height: 70 }}></View>
        </ScrollView>
    );
};

export default OrderSummaryPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f3f6', // Flipkart's background color
    },
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

    // Progress Bar styles
    progressBarContainer: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        marginBottom: 12,
        elevation: 2,
        borderRadius: 8,
    },
    progressTrack: {
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        marginBottom: 16,
    },
    progressFill: {
        height: 4,
        backgroundColor: '#2874f0',
        borderRadius: 2,
    },
    progressStepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressStep: {
        alignItems: 'center',
        width: '33%',
    },
    progressCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    activeCircle: {
        backgroundColor: '#2874f0',
    },
    progressText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    progressLabel: {
        fontSize: 12,
        color: '#757575',
        textAlign: 'center',
    },
    activeLabel: {
        color: '#2874f0',
        fontWeight: '500',
    },

    // Address Selection Page styles
    addressCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
    },
    addressCardContent: {
        padding: 16,
    },
    selectedAddressCard: {
        borderWidth: 1,
        borderColor: '#2874f0',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressIcon: {
        marginRight: 8,
    },
    addressName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212121',
    },
    addressDetails: {
        marginBottom: 12,
    },
    addressRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    addressText: {
        color: '#757575',
        lineHeight: 20,
        flex: 1,
    },
    defaultBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#2874f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomLeftRadius: 8,
    },
    defaultBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    selectedIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2874f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    addressActionBtn: {
        marginRight: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressActionBtnText: {
        color: '#2874f0',
        fontWeight: '500',
        marginLeft: 4,
    },
    addNewAddressBtn: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 2,
    },
    addNewAddressBtnText: {
        color: '#2874f0',
        fontWeight: 'bold',
        marginLeft: 8,
    },

    // Navigation buttons
    navigationButtons: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        elevation: 2,
    },
    continueButton: {
        flex: 1,
        backgroundColor: '#fb641b', // Flipkart orange
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
    },
    disabledButton: {
        backgroundColor: '#e0e0e0',
    },

    // Order Summary styles
    orderStatusContainer: {
        flex: 1,
    },
    orderInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    orderIdText: {
        marginLeft: 6,
        color: '#757575',
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        borderRadius: 8,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 4,
    },
    itemDetails: {
        marginLeft: 16,
        flex: 1,
    },
    productName: {
        fontSize: 16,
        marginBottom: 6,
        fontWeight: '500',
        color: '#212121',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingBadge: {
        backgroundColor: '#388e3c',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ratingText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ratingCount: {
        marginLeft: 6,
        fontSize: 12,
        color: '#757575',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityLabel: {
        color: '#757575',
        marginRight: 8,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 16,
        color: '#2874f0',
        fontWeight: 'bold',
    },
    quantity: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderLeftColor: '#e0e0e0',
        borderRightColor: '#e0e0e0',
    },

    // Summary Sections
    summarySection: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        borderRadius: 8,
        padding: 16,
        elevation: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    changeLink: {
        color: '#2874f0',
        fontWeight: '500',
    },

    // Price container styles
    priceContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    discountText: {
        color: '#388e3c',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
        marginTop: 8,
    },
    totalText: {
        fontWeight: 'bold',
    },

    // Payment page styles
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
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    paymentMethodName: {
        flex: 1,
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
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewDetailLink: {
        color: '#2874f0',
    },
});