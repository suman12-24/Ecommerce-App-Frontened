import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Animated, ActivityIndicator, BackHandler } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axiosInstance, { baseURL } from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import appNameController from './Model/appNameController';
import { useTranslation } from 'react-i18next';
const AllOrderDetails = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { userId, token } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderNotFound, setOrderNotFound] = useState(false); // New state for order not found

    // Animation values with proper initialization
    const fadeAnim = useRef([]);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Fetch orders from API with proper dependency
    useEffect(() => {
        fetchOrders();
         const backHandler = BackHandler.addEventListener(
              'hardwareBackPress',
              handleBackPress
            );
            return () => backHandler.remove();
    }, [userId]); // Add userId as dependency
    const handleBackPress = () => {
        navigation.goBack();
        return true; // Prevents default behavior
    };
    const fetchOrders = async () => {
        if (!userId) {
            setError('User ID is missing. Please log in again.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setOrderNotFound(false); // Reset order not found state

            // Using the provided API endpoint
            const response = await axiosInstance.get(`/Suhani-Electronics-Backend/f_order_details_all.php?u_id=${userId}`);

            // Check if API call was successful and data exists
            if (response?.data?.success && Array.isArray(response?.data?.data)) {
                // Check if orders array is empty from API response
                if (response.data.data.length === 0) {
                    setOrderNotFound(true);
                    setOrders([]);
                } else {
                    // Transform API data into the format expected by our component
                    const transformedOrders = transformOrderData(response?.data?.data);
                    setOrders(transformedOrders);

                    // If we received data but couldn't transform any valid orders
                    if (transformedOrders.length === 0) {
                        setOrderNotFound(true);
                    } else {
                        // Initialize animation values for each order
                        fadeAnim.current = transformedOrders.map(() => new Animated.Value(0));
                        // Start animations after data is loaded
                        setTimeout(() => startAnimations(transformedOrders.length), 100);
                    }
                }
            } else if (response?.data?.message === "No orders found" || response?.data?.message?.includes("not found")) {
                // Explicitly handle "No orders found" response from API
                setOrderNotFound(true);
                setOrders([]);
            } else {
                throw new Error(response?.data?.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            if (err.message && err.message.includes("not found")) {
                setOrderNotFound(true);
            } else {
                setError('Failed to load orders. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Transform API data to match the format our component expects
    const transformOrderData = (apiData) => {
        if (!Array.isArray(apiData)) {
            console.error('Expected array for order data, received:', typeof apiData);
            return [];
        }

        return apiData.map(orderData => {
            try {
                // Validate required fields
                if (!orderData.order_details) {
                    console.error('Missing order_details in order data');
                    return null;
                }

                // Get the delivery status text
                const deliveryStatus = getDeliveryStatusText(
                    orderData.order_details.delivery_status,
                    orderData.order_details.order_cancel
                );

                // Safely parse the date
                let orderDate;
                try {
                    orderDate = new Date(orderData.order_details.order_date);
                    // Check if date is valid
                    if (isNaN(orderDate.getTime())) {
                        orderDate = new Date(); // Fallback to current date
                    }
                } catch (e) {
                    console.error('Invalid date format:', orderData.order_details.order_date);
                    orderDate = new Date(); // Fallback to current date
                }

                const formattedDate = orderDate.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

                // Calculate estimated delivery date (3 days after order date)
                const deliveryDate = new Date(orderDate);
                deliveryDate.setDate(deliveryDate.getDate() + 3);
                const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

                // In the transformOrderData function, modify the items mapping:
                const items = Array.isArray(orderData.order_products)
                    ? orderData.order_products.map(product => {
                        // Make sure product object exists and has required fields
                        if (!product) return null;

                        // Change 'name' to 'p_name' to match the API response
                        return {
                            id: product.p_id || `temp-${Math.random()}`,
                            name: product.p_name || 'Unknown Product',
                            price: `₹${parseInt(product.selling_price || 0).toLocaleString()}`,
                            quantity: product.quantity || 1,
                            image: `${baseURL}/Product_image/${product.image}`
                        };
                    }).filter(Boolean) // Remove any null items
                    : [];

                return {
                    order_id: orderData.order_id,
                    id: (orderData.order_details.id || Math.random().toString()).toString(),
                    orderNumber: `OD${orderData.order_details.id || ''}${Math.floor(Math.random() * 1000000)}`,
                    date: formattedDate,
                    status: deliveryStatus,
                    deliveryDate: formattedDeliveryDate,
                    totalAmount: `₹${parseFloat(orderData.order_details.total_amount || 0).toLocaleString()}`,
                    items: items,
                    totalItems: items.length // Add totalItems for badge display logic
                };
            } catch (err) {
                console.error('Error processing order:', err);
                return null;
            }
        }).filter(Boolean); // Remove any null orders
    };

    // Map delivery status codes to text
    const getDeliveryStatusText = (statusCode, orderCancel) => {
        // First check if order is cancelled
        if (orderCancel === '1' || orderCancel === 1) {
            return 'Cancelled';
        }

        // Otherwise check delivery status
        switch (parseInt(statusCode)) {
            case 0:
                return 'Order Received';
            case 1:
                return 'Order Processing';
            case 2:
                return 'Out for Delivery';
            case 3:
                return 'Order Delivered';
            case 4:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const startAnimations = (orderCount) => {
        // Ensure we have the right number of animations
        if (!fadeAnim.current || fadeAnim.current.length !== orderCount) {
            console.error('Animation setup mismatch with order count');
            return;
        }

        // Fade in animation for each order card
        fadeAnim.current.forEach((anim, index) => {
            Animated.sequence([
                Animated.delay(index * 150),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start();
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Order Received':
                return '#00C853';
            case 'Order Processing':
                return '#FF9800';
            case 'Out for Delivery':
                return '#2196F3';
            case 'Order Delivered':
                return '#9C27B0';
            case 'Cancelled':
                return '#F44336';
            default:
                return '#9E9E9E';
        }
    };

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={appNameController.activityIndicatorColor} />
                <Text style={styles.loadingText}>{t('loadingYourOrder')}</Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
                    <Text style={styles.retryButtonText}>{t('retry')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Order Not Found state (specific message for when orders aren't found)
    if (orderNotFound) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#0baf9a" />
                <Text style={styles.errorTitle}>{t('noOrderFound')}</Text>
                <Text style={styles.emptyText}>{t('canNotFindAnyOrderassciate')}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
                    <Text style={styles.retryButtonText}>{t('refresh')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Empty state (when orders array is empty but not due to error)
    if (orders.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={64} color="#9E9E9E" />
                <Text style={styles.emptyText}>{t('haveNotPlaceOrder')}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
                    <Text style={styles.retryButtonText}>{t('refresh')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('myOrders')}</Text>
                <Text style={styles.headerSubtitle}>{t('trackRecentOrder')}</Text>
            </View>

            {orders.map((order, orderIndex) => (
                <Animated.View
                    key={order.id}
                    style={[
                        styles.orderCard,
                        {
                            opacity: fadeAnim.current[orderIndex] || 1,
                            transform: [{
                                translateY: fadeAnim.current[orderIndex] ?
                                    fadeAnim.current[orderIndex].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0]
                                    }) : 0
                            }]
                        }
                    ]}
                >
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                        <Text style={styles.orderDate}>{order.date}</Text>
                    </View>

                    {/* Only show first item, with additional indicator if there are more items */}
                    {order.items.length > 0 && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('IndividualProductOrderDetails', { userId, orderId: order.id })}
                            key={`${order.id}-item-${order.items[0].id || 0}`}
                            style={styles.productContainer}
                            onPressIn={onPressIn}
                            onPressOut={onPressOut}
                            activeOpacity={0.9}
                        >
                            <View style={styles.productImageContainer}>
                                {order.items[0].image ? (
                                    <Image
                                        source={{ uri: order.items[0].image }}
                                        style={styles.productImage}
                                        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                    />
                                ) : (
                                    <View style={[styles.productImage, styles.placeholderImage]}>
                                        <Ionicons name="image-outline" size={32} color="#BDBDBD" />
                                    </View>
                                )}

                                {/* Badge for additional items */}
                                {order.totalItems > 1 && (
                                    <View style={styles.moreBadge}>
                                        <Text style={styles.moreBadgeText}>+{order.totalItems - 1} {t('more')}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.productDetails}>
                                <Text style={styles.productName} numberOfLines={2}>{order.items[0].name}</Text>
                                <Text style={styles.productPrice}>{order.items[0].price}</Text>
                                <View style={styles.statusContainer}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                                    <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                                        {order.status}
                                    </Text>
                                </View>
                                <View style={{ marginTop: 3, marginBottom: 2 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '500' }}>{t('totalOrderQuentity')}: {order.totalItems}</Text>
                                </View>
                            </View>

                            <View style={styles.rightContainer}>
                                <Ionicons name="chevron-forward" size={24} color="#666" />
                            </View>
                        </TouchableOpacity>
                    )}

                    <View style={styles.orderFooter}>
                        <Text style={styles.deliveryDate}>{t('deliveryBy')}{order.deliveryDate}</Text>
                        <Text style={styles.totalAmount}>{t('total')}: {order.totalAmount}</Text>
                    </View>
                </Animated.View>
            ))}
            <View style={{ height: 70 }} />
        </ScrollView>
    );
};

export default AllOrderDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        padding: 8,
        backgroundColor: '#0ba893',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        marginLeft: 20,
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 5,
    },
    headerSubtitle: {
        marginLeft: 20,
        fontSize: 16,
        color: '#edeef8',
        opacity: 0.9,
    },
    orderCard: {
        backgroundColor: '#ffffff',
        margin: 5,
        borderRadius: 16,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 5,
        borderBottomWidth: 0.8,
        borderBottomColor: '#F0F0F0',
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#424242',
    },
    orderDate: {
        fontSize: 14,
        color: '#757575',
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    // New container for image to allow badge positioning
    productImageContainer: {
        position: 'relative',
        width: 90,
        height: 90,
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        resizeMode: 'center'
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EEEEEE',
    },
    // New styles for the "+X more" badge
    moreBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 0,
    },
    moreBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    productDetails: {
        flex: 1,
        marginLeft: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 15,
        color: '#424242',
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    orderStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    rightContainer: {
        padding: 8,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    deliveryDate: {
        fontSize: 14,
        color: '#616161',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
    },
    // Styles for loading, error and empty states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#424242',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#424242',
        textAlign: 'center',
        marginHorizontal: 20,
    },
    errorTitle: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0baf9a',
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#0ba893',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#424242',
        textAlign: 'center',
    },
});