import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, FlatList, Animated, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
const ProductOrderSummary = ({ setCurrentStep, selectedAddress }) => {
    const navigation = useNavigation();
    // Animation refs and state
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const goToPreviousStep = () => {
        setCurrentStep(prevStep => prevStep - 1);
    };

    const goToNextStep = () => {
        navigation.navigate('PaymentPage')
    };

    const mockData = {
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
    };

    return (
        <ScrollView>
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
                {selectedAddress && (
                    <View style={styles.summarySection}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                                {selectedAddress.address}, {selectedAddress.landmark}
                            </Text>
                            <Text style={styles.addressText}>
                                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pin}
                            </Text>
                            <Text style={styles.addressText}>
                                Phone: {selectedAddress.mobile}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Price Details */}
                <View style={styles.summarySection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
        </ScrollView>
    );
};

export default ProductOrderSummary;

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
    orderStatusContainer: {
        flex: 1,
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
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
        marginLeft: 8,
    },
    changeLinkContainer: {
        padding: 4,
    },
    changeLink: {
        color: '#2874f0',
        fontWeight: '500',
    },
    addressSummary: {
        marginBottom: 8,
    },
    addressName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212121',
    },
    addressText: {
        color: '#757575',
        lineHeight: 20,
        marginBottom: 4,
    },
    priceContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceLabel: {
        color: '#757575',
    },
    priceValue: {
        color: '#212121',
        fontWeight: '500',
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
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    },
    savingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
    },
    savingsText: {
        marginLeft: 8,
        color: '#388e3c',
        fontSize: 14,
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
});