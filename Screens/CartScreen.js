import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Animated, ActivityIndicator, StatusBar } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyCoupon, removeFromCart, removeSelectedCoupon, setPriceSummary, updateCartQuantity } from '../redux/cartSlice';
import axiosInstance, { baseURL } from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import QuantitySelector from './Components/QuantitySelector';
import { addCartToDatabase } from '../redux/addCartToDatabase';
import { removeCartFromDatabase } from '../redux/removeCartFromDatabase';
import LottieView from 'lottie-react-native'; // Import LottieView
import appNameController from './Model/appNameController';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import CouponBottomSheet from './Components/CouponBottomSheet';
const CartScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const cart = useSelector(state => state.cart.items);
    // const deliveryAddress = useSelector(state => state.cart.deliveryAddress);
    // console.log("cartScreen cart", deliveryAddress);
    const dispatch = useDispatch();
    const { userId, token, name, email, mobile } = useSelector((state) => state.auth);

    // Initialize states with proper default values to prevent null issues
    const [cartItems, setCartItems] = useState(cart || []);
    const [cartProducts, setCartProducts] = useState([]);
    const [productStockArray, setProductStockArray] = useState([]);
    const [loadingItems, setLoadingItems] = useState({}); // Track loading state for each item
    const [isPageLoading, setIsPageLoading] = useState(true); // New state for initial page loading
    const [deliveryChargeObject, setDeliveryChargeObject] = useState();
    // Toast notification states
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success'); // 'success', 'error', 'info'
    const toastAnimation = useRef(new Animated.Value(0)).current;

    // Get cart item IDs for API calls
    const idsOfCartItem = cartItems.map((item) => item.id).filter(Boolean);

    const [isCouponModalVisible, setCouponModalVisible] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const [removeId, setRemoveId] = useState();
    const [removeItemLoader, setRemoveItemLoader] = useState(false);

    // Toast notification function
    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);

        // Animate toast in
        Animated.sequence([
            Animated.timing(toastAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000), // Show for 2 seconds
            Animated.timing(toastAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setToastVisible(false);
        });
    };



    // Update local cartItems when redux cart changes
    useEffect(() => {
        setCartItems(cart || []);
    }, [cart]);

    const calculateDiscount = (regular, selling) => {
        if (!regular || !selling) return null;

        const regularPrice = parseFloat(regular);
        const sellingPrice = parseFloat(selling);

        if (isNaN(regularPrice) || isNaN(sellingPrice)) return null;

        if (regularPrice > sellingPrice) {
            const discount = ((regularPrice - sellingPrice) / regularPrice) * 100;
            return `${Math.round(discount)}% Off`;
        }
        return null;
    };



    // Function to calculate the total price after applying the coupon discount
    const calculateTotal = () => {
        if (!Array.isArray(cartProducts)) return 0;

        let total = cartProducts.reduce((sum, item) => {
            const price = parseFloat(item?.selling_price || 0);
            const quantity = parseInt(item?.quantity || 0);
            return sum + price * quantity;
        }, 0);

        return total.toFixed(2);
    };


    const deliveryChargeCalculation = () => {
        if (!Array.isArray(cartProducts) || !deliveryChargeObject) return 0;

        let total = cartProducts.reduce((sum, item) => {
            const price = parseFloat(item?.selling_price) || 0;
            const quantity = parseInt(item?.quantity) || 0;
            return sum + price * quantity; // Fixed missing return
        }, 0);

        if (total < deliveryChargeObject.min_order) {
            return 'Unavailable';
        }
        if (total <= deliveryChargeObject.slab_1) {
            return deliveryChargeObject.charge_1;
        }
        if (total <= deliveryChargeObject.slab_2) {
            return deliveryChargeObject.charge_2;
        }
        return 0; // Free delivery for orders above slab_2
    };



    const calculateGrandTotal = () => {
        if (!Array.isArray(cartProducts)) return "0.00"; // Ensure return type is always a string with toFixed

        let total = cartProducts.reduce((sum, item) => {
            const price = parseFloat(item?.selling_price) || 0;
            const quantity = parseInt(item?.quantity) || 0;
            return sum + price * quantity;
        }, 0);

        // Ensure total is a number
        if (isNaN(total)) total = 0;

        // Apply coupon discount if available
        if (selectedCoupon?.max_disc) {
            total = total - parseFloat(selectedCoupon.max_disc) || 0;
            total = Math.max(0, total);
        }

        const delivery = deliveryChargeCalculation();
        const deliveryCharge = isNaN(delivery) || delivery === "Unavailable" ? 0 : parseFloat(delivery);

        total += deliveryCharge;

        return total.toFixed(2); // Ensures it's always a number and prevents undefined issues
    };




    const calculateTotalQuantity = () => {
        if (!Array.isArray(cartProducts)) return 0;

        return cartProducts.reduce((total, item) => {
            return total + (parseInt(item?.quantity || 0));
        }, 0);
    };

    const updateQuantity = async (id, quantity, prevQuantity) => {
        if (!id) return;

        try {
            const updateQuantityIdentifier = true;
            // Set loading state for this specific item
            setLoadingItems(prev => ({ ...prev, [id]: true }));
            dispatch(updateCartQuantity({ id, quantity })); // Update Redux state first
            await addCartToDatabase(id); // Save updated cart to database
            await fetchCartProductsCurrentUpdates(updateQuantityIdentifier);

            // Show toast notification based on quantity change
            const productName = cartProducts.find(item => item.id === id)?.name || 'Product';
            if (quantity > prevQuantity) {
                showToast(`${t('increasedQuentity')} ${productName.length > 20 ? productName.slice(0, 20) + '...' : productName}`, 'success');
            } else if (quantity < prevQuantity) {
                showToast(`${t('decreaseQuentity')} ${productName.length > 20 ? productName.slice(0, 20) + '...' : productName}`, 'info');
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            showToast("Failed to update quantity", 'error');
        } finally {
            // Clear loading state for this item
            setTimeout(() => {
                setLoadingItems(prev => ({ ...prev, [id]: false }));
            }, 300); // Small delay to ensure loader is visible even on fast connections
        }
    };

    const removeItem = async (id, name) => {
        if (!id) return;
        setRemoveItemLoader(true);
        try {
            setRemoveId(id);
            dispatch(removeFromCart({ id })); // Corrected dispatch
            await removeCartFromDatabase(id);
            await fetchCartProductsCurrentUpdates();

            // Show toast notification for removal
            showToast(`${name.length > 20 ? name.slice(0, 20) + '...' : name} ${t('removeFromCart')}`, 'error');
        } catch (error) {
            console.error("Error removing item:", error);
            showToast("Failed to remove item", 'error');
        }
        finally {
            setRemoveItemLoader(false);
        }
    };

    const renderStars = (rating) => {
        if (!rating) return '☆☆☆☆☆';
        const safeRating = parseFloat(rating) || 0;
        const stars = '★'.repeat(Math.floor(safeRating)) + '☆'.repeat(5 - Math.floor(safeRating));
        return stars;
    };

    const fetchCartProductsCurrentUpdates = async (isLoaderStart) => {
        //  isLoaderStart ? setIsPageLoading(false) : setIsPageLoading(true); // Show loading state when fetching

        try {
            if (!Array.isArray(idsOfCartItem) || idsOfCartItem.length === 0) {
                setCartProducts([]);
                setProductStockArray([]);
                setIsPageLoading(false); // Hide loading
                return;
            }

            const response = await axiosInstance.post('/Suhani-Electronics-Backend/f_fetch_cart.php', { u_id: userId });


            if (response?.data?.data) {
                const dataArray = Array.isArray(response.data.data) ? response.data.data : [];

                setProductStockArray(dataArray.map((item) => ({
                    id: item.id,
                    stock: parseInt(item.stock || 0)
                })));

                setCartProducts(dataArray);
            }

            const responseDeliveryCharge = await axiosInstance.get(`/Suhani-Electronics-Backend/f_delivery_charge.php?d_id=1`);
            setDeliveryChargeObject(responseDeliveryCharge?.data?.data[0]);

        } catch (error) {
            console.error("Error fetching cart products:", error);
            setCartProducts([]);
            setProductStockArray([]);
        } finally {
            // Add slight delay to ensure loading state is visible for better UX
            setTimeout(() => {
                setIsPageLoading(false);
            }, 800);
        }
    };

    useEffect(() => {
        fetchCartProductsCurrentUpdates();
    }, [idsOfCartItem.length]); // Dependency on array length is more reliable

    const stockChecker = (itemId) => {
        if (!itemId || !Array.isArray(productStockArray)) return { stock: 0 };
        return productStockArray.find(item => item.id == itemId) || { stock: 0 };
    };

    // Custom QuantitySelector with loading indicator
    const CustomQuantitySelector = ({ itemId, stock, value, onSelect }) => {
        const isLoading = loadingItems[itemId];
  
        // Store the current value for comparison when updating
        const prevValue = useRef(value);

        useEffect(() => {
            prevValue.current = value;
        }, [value]);

        return (
            <>
                {
                    stock?.stock > 0 ?
                        <View style={styles.quantityContainer}>
                            {isLoading ? (
                                <View style={styles.loaderContainer}>
                                    <ActivityIndicator size="small" color={appNameController.activityIndicatorColor} />
                                </View>
                            ) : (
                                <QuantitySelector
                                    stock={stock}
                                    value={value}
                                    onSelect={(newValue) => {
                                        onSelect(newValue, prevValue.current);
                                        prevValue.current = newValue;
                                    }}
                                />
                            )}
                        </View> :
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 8,
                            backgroundColor: appNameController.outOfStockButtonColor,
                            borderRadius: 10
                        }}>
                            <Text style={{
                                color: 'red', fontSize: 14,

                                fontWeight: '600'
                            }}>{t('outOfStock')}</Text>
                        </View>
                }

            </>
        );
    };

    // If the page is loading, show a full-screen loader
    if (isPageLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={appNameController.activityIndicatorColor} />
                <Text style={styles.loadingText}>{t('loadingCart')}</Text>
            </View>
        );
    }

    const removeCoupon = () => {

        setSelectedCoupon(null);
        dispatch(removeSelectedCoupon());
        showToast("Coupon removed", "error");
    };

    return (

        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('myCart')}({calculateTotalQuantity()})</Text>
                </View>

                {/* Cart Items or Empty State */}
                <View style={styles.cartItemsContainer}>
                    {(Array.isArray(cartProducts) && cartProducts.length > 0) ? (
                        cartProducts.map((item, index) => (
                            <View
                                key={item.id || index}
                                style={[
                                    styles.cartItem,

                                ]}
                            >
                                {item.id == removeId && removeItemLoader ?
                                    <View style={{

                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%'
                                    }}>
                                        <View style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 10,
                                            borderRadius: 8,
                                            width: '80%', // Adjust width to make it look clean
                                        }}>
                                            <ActivityIndicator size="small" color={appNameController.activityIndicatorColor} />
                                            <Text style={{
                                                marginTop: 5,
                                                fontSize: 14,
                                                fontWeight: 'bold',
                                                color: appNameController.textColor
                                            }}>{t('removingProduct')}</Text>
                                        </View>
                                    </View>

                                    :
                                    <>
                                        <View style={styles.itemLeft}>
                                            <Image
                                                source={{ uri: item?.img_1 ? `${baseURL}/Product_image/${item.img_1}` : null }}
                                                style={styles.itemImage}
                                            />

                                            <CustomQuantitySelector
                                                itemId={item.id}
                                                stock={stockChecker(item.id)}
                                                value={parseInt(item.quantity || 1)}
                                                onSelect={(value, prevValue) => updateQuantity(item.id, value, prevValue)}
                                            />
                                        </View>
                                        <View style={styles.itemRight}>
                                            <Text
                                                numberOfLines={2}
                                                style={styles.itemName}>{item?.name || 'Product Name'}</Text>
                                            <View style={styles.ratingContainer}>
                                                <Text style={styles.rating}>
                                                    {renderStars(item?.rating)}
                                                </Text>
                                                <Text style={styles.ratingText}>
                                                    {item?.rating || '0'} ({(item?.reviewCount || 0).toLocaleString()} reviews)
                                                </Text>
                                            </View>
                                            <View style={styles.priceContainer}>
                                                <Text style={styles.price}>₹{item?.selling_price || '0'}</Text>
                                                <Text style={styles.originalPrice}> ₹{item?.regular_price || '0'}</Text>
                                                <Text style={styles.discount}>
                                                    {calculateDiscount(item?.regular_price, item?.selling_price)}
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => removeItem(item.id, item.name)}
                                                style={styles.removeButton}
                                            >
                                                <Text style={styles.removeButtonText}>{t('remove')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>

                                }
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCartContainer}>
                            {/* Use Lottie animation for empty cart */}
                            <LottieView
                                source={require('../Assets/Animation/empty_cart.json')} // Make sure to add this file
                                style={styles.emptyCartAnimation}
                                autoPlay
                                loop
                            />
                            <Text style={styles.emptyCartText}>{t('cartEmpty')}</Text>
                            <Text style={styles.emptyCartSubText}>{t('addItemsCartToSee')}</Text>
                            <TouchableOpacity style={styles.shopNowButton}
                                onPress={() => navigation.navigate(`${t('home')}`)}
                            >
                                <Text style={styles.shopNowText}>{t('shopNow')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>


                {(Array.isArray(cartProducts) && cartProducts.length > 0) &&


                    <>
                        {/* Coupons Section */}
                        <View
                            style={{
                                width: '94%',
                                margin: 10,
                                padding: 10,
                                backgroundColor: '#ffffff',
                                borderRadius: 12,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 3,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontWeight: '700',
                                    color: '#333',
                                    marginBottom: 10,
                                    letterSpacing: 0.5,
                                }}
                            >
                                <FontAwesome name="ticket" size={18} style={{ marginRight: 8 }} />{t('applyCoupans')}</Text>


                            <TouchableOpacity
                                onPress={() => setCouponModalVisible(true)}
                                style={{
                                    height: 40,
                                    backgroundColor: '#f5f5f5',
                                    width: '25%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 8,
                                    flexDirection: 'row',
                                    borderWidth: 1,
                                    borderColor: '#e0e0e0',
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#555',
                                        fontWeight: '600',
                                        fontSize: 14,
                                        marginRight: 5,
                                    }}
                                >{t('viewAll')}</Text>
                                <FontAwesome name="angle-right" size={14} color="#555" />
                            </TouchableOpacity>
                        </View>
                        <CouponBottomSheet
                            isVisible={isCouponModalVisible}
                            onClose={() => setCouponModalVisible(false)}
                            totalAmount={calculateTotal()}
                            onApplyCoupon={(coupon) => {
                              
                                setSelectedCoupon(coupon); // Store the selected coupon
                                dispatch(applyCoupon(coupon));
                                setCouponModalVisible(false);
                                calculateTotal();
                            }}
                        />

                        {
                            selectedCoupon && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: '3%', marginVertical: 10 }}>
                                    <Text style={{ color: '#00b300', fontWeight: '600', fontSize: 13, marginRight: 5 }}>
                                        {selectedCoupon ? `${t('applied')} ${selectedCoupon.code} - ₹${selectedCoupon.max_disc} Off` : `${t('selectCoupan')}`}
                                    </Text>
                                    <TouchableOpacity onPress={removeCoupon}>
                                        <Text style={{ color: 'red', marginLeft: '10%' }}>{t('remove')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    </>
                }

                {/* Price Details */}
                {Array.isArray(cartProducts) && cartProducts.length > 0 && (
                    <View
                        style={{
                            backgroundColor: '#ffffff',

                            marginHorizontal: 10,
                            borderRadius: 12,
                            padding: 10,
                            marginBottom: 100,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Ionicons name="receipt-outline" size={22} color="#333" />
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '600',
                                    marginLeft: 8,
                                    color: '#333',
                                }}
                            >{t('orderSummary')}</Text>
                        </View>

                        <View style={{ height: 1, backgroundColor: '#f0f0f0', marginBottom: 10 }} />

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 5,
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="cart-outline" size={18} color="#666" />
                                <Text style={{ marginLeft: 8, fontSize: 15, color: '#444' }}>{t(' Items ')}({cartProducts.length})
                                </Text>
                            </View>
                            <Text style={{ fontSize: 15, fontWeight: '500', color: '#333' }}>
                                ₹{calculateTotal()}
                            </Text>
                        </View>
                        {
                            selectedCoupon && (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="ticket-outline" size={18} color="green" />
                                        <Text style={{ marginLeft: 8, fontSize: 12, color: '#00b300' }}>
                                            {selectedCoupon.code}
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '500', color: '#388e3c' }}>
                                        ₹{selectedCoupon.max_disc}
                                    </Text>
                                </View>
                            )
                        }


                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                <MaterialCommunityIcons name="truck-delivery-outline" size={18} color="#ff3333" />
                                <Text style={{ marginLeft: 8, fontSize: 13, color: '#ff3333' }}>{t('deliveryCharge')}</Text>
                            </View>
                            <Text style={{ fontSize: 15, fontWeight: '500', color: '#ff3333' }}>
                                {typeof deliveryChargeCalculation() === 'number' ? `₹${deliveryChargeCalculation()}` : deliveryChargeCalculation()}
                            </Text>
                        </View>

                        <View style={{ height: 1, backgroundColor: '#f0f0f0', marginVertical: 16 }} />

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="wallet-outline" size={18} color="#333" />
                                <Text style={{
                                    marginLeft: 8,
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#333'
                                }}>{t('totalamount')}</Text>
                            </View>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: '#333'
                            }}>
                                ₹{calculateGrandTotal()}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Toast Notification */}
            {toastVisible && (
                <Animated.View
                    style={[
                        styles.toast,
                        styles[`toast${toastType.charAt(0).toUpperCase() + toastType.slice(1)}`],
                        {
                            opacity: toastAnimation,
                            transform: [
                                {
                                    translateY: toastAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0]
                                    })
                                }
                            ]
                        }
                    ]}
                >
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </Animated.View>
            )}

            {/* Fixed Footer */}
            {Array.isArray(cartProducts) && cartProducts.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.footerPlaceOrderButton}
                        // onPress={() => showToast('Order placed successfully!', 'success')}
                        onPress={() => {
                            dispatch(setPriceSummary(
                                {
                                    total: calculateGrandTotal(),
                                    sub_total: calculateTotal(),
                                    delivery_charge: deliveryChargeCalculation(),
                                    discount_coupon_amount: selectedCoupon?.max_disc || 0,
                                    discount_coupon_code: selectedCoupon?.code || null
                                }
                            ));
                            navigation.navigate('SelectDeliveryAddress')
                        }}
                    >
                        <Text style={styles.placeOrderText}>{t('selectDeliveryaddress')}</Text>
                    </TouchableOpacity>
                </View>
            )}
            <StatusBar
                barStyle="light-content"
                translucent={false}
                backgroundColor={appNameController.statusBarColor}
            />
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f3f6',
    },
    // New loading container style
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f3f6',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 10,
        backgroundColor: appNameController.statusBarColor
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    cartItemsContainer: {
        backgroundColor: '#fff',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
    },
    cartItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 5,
        borderBottomColor: '#f0f0f0',
    },
    itemLeft: {
        marginRight: 15,
    },
    itemImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    itemRight: {
        flex: 1,
    },
    brandName: {
        fontSize: 14,
        color: '#878787',
        marginBottom: 2,
    },
    itemName: {
        fontSize: 16,
        marginBottom: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    rating: {
        color: '#ffd700',
        marginRight: 4,
        fontSize: 16,
    },
    ratingText: {
        fontSize: 14,
        color: '#878787',
    },
    seller: {
        fontSize: 14,
        color: '#878787',
        marginBottom: 2,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 4,
    },
    originalPrice: {
        fontSize: 14,
        color: '#878787',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discount: {
        color: '#388e3c',
        fontSize: 14,
    },
    delivery: {
        fontSize: 14,
        color: '#388e3c',
        marginBottom: 4,
    },
    quantityContainer: {
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        minHeight: 40, // Ensure consistent height when showing loader
    },
    loaderContainer: {
        minWidth: 80,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        backgroundColor: '#f5f5f5',
    },
    quantityButton: {
        borderWidth: 1,
        borderColor: '#c2c2c2',
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 16,
        color: '#2874f0',
    },
    quantity: {
        paddingHorizontal: 15,
        fontSize: 18,
        fontWeight: '600',
        color: '#000'
    },
    removeButton: {
        marginTop: 5,
    },
    removeButtonText: {
        color: '#2874f0',
        fontSize: 14,
        fontWeight: '500',
    },
    priceDetails: {

    },
    priceDetailsTitle: {

    },
    priceRow: {

    },
    freeDelivery: {

    },
    bottomPadding: {
        height: 60,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    footerLeft: {
        flex: 1,
    },
    footerTotalLabel: {
        fontSize: 17,
        color: '#878787',
    },
    footerTotalAmount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#212121',
    },
    footerPlaceOrderButton: {
        width: '90%',
        backgroundColor: appNameController.SelectDeliveryAddress,
        paddingHorizontal: 11,
        paddingVertical: 11,
        borderRadius: 10,
        marginHorizontal: '4%',
    },
    placeOrderText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    // Enhanced empty cart styles
    emptyCartContainer: {
        backgroundColor: '#f1f3f6',
        alignContent: 'center',
        paddingVertical: "25%",
        alignItems: 'center',
        justifyContent: 'center',

    },
    emptyCartAnimation: {
        width: 250,
        height: 250,
    },
    emptyCartText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    emptyCartSubText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    shopNowButton: {
        backgroundColor: appNameController.addToCartShopNow,
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 20,
    },
    shopNowText: {
        color: '#fff',
        fontWeight: '500',
    },
    // Toast notification styles
    toast: {
        position: 'absolute',
        bottom: 140,
        left: 20,
        right: 20,
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    toastSuccess: {
        backgroundColor: '#4CAF50',
    },
    toastError: {
        backgroundColor: '#F44336',
    },
    toastInfo: {
        backgroundColor: '#2196F3',
    },
    toastText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    // Add these to your styles object


    loadingTextRemoving: {
        marginLeft: 8,
        color: '#666',
        fontSize: 12,
        textAlign: 'center'
    },


});

export default CartScreen;

