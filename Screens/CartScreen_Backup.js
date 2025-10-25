import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated
} from 'react-native';
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { decrementQuantity, incrementQuantity, removeFromCart, updateCartQuantity } from '../redux/cartSlice';
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';

const CartScreen = () => {

    const cart = useSelector(state => state.cart.items);
    const dispatch = useDispatch();
    console.log("cart in cart screen", cart);
    const [cartItems, setCartItems] = useState([...cart] || []);



    const fadeAnims = useRef(cartItems.map(() => new Animated.Value(0))).current;
    const scaleAnims = useRef(cartItems.map(() => new Animated.Value(1))).current;

    // Start fade-in animation when component mounts
    React.useEffect(() => {
        cartItems.forEach((_, index) => {
            Animated.sequence([
                Animated.delay(index * 100), // Stagger the animations
                Animated.timing(fadeAnims[index], {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start();
        });
    }, [cartItems]);

    // const calculateTotal = () => {
    //     return cart.reduce((total, item) => {
    //         const numericPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
    //         return total + (numericPrice * item.quantity);
    //     }, 0);
    // };



    const updateQuantity = (id, quantity) => {
        dispatch(updateCartQuantity({ id, quantity }));
    };

    const removeItem = (id) => {
        const index = cartItems.findIndex(item => item.id === id);

        if (index === -1 || !fadeAnims[index] || !scaleAnims[index]) return; // Prevent errors

        // Animate the item out before removing it from Redux
        Animated.parallel([
            Animated.timing(fadeAnims[index], {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[index], {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            dispatch(removeFromCart({ id })); // Corrected dispatch

            // Remove animation values for this item safely
            fadeAnims.splice(index, 1);
            scaleAnims.splice(index, 1);
        });
    };


    const renderStars = (rating) => {
        const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        return stars;
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
                </View>


                {/* Cart Items */}
                <View style={styles.cartItemsContainer}>
                    {cart.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            style={[
                                styles.cartItem,
                                {
                                    opacity: fadeAnims[index],
                                    transform: [{ scale: scaleAnims[index] }]
                                }
                            ]}
                        >
                            <View style={styles.itemLeft}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={styles.quantityContainer}>
                                    <RNPickerSelect
                                        onValueChange={(value) => updateQuantity(item.id, value)}
                                        items={Array.from({ length: 10 }, (_, i) => ({
                                            label: `${i + 1}`,
                                            value: i + 1
                                        }))}
                                        value={item.quantity}
                                        style={pickerSelectStyles}
                                    />
                                </View>
                            </View>
                            <View style={styles.itemRight}>
                                <Text style={styles.itemName}>{item.title}</Text>
                                <View style={styles.ratingContainer}>
                                    <Text style={styles.rating}>{renderStars(item.rating)}</Text>
                                    <Text style={styles.ratingText}>
                                        {item?.rating} ({item?.reviewCount?.toLocaleString()} reviews)
                                    </Text>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.price}>${item.price}</Text>
                                    <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                                    <Text style={styles.discount}>{item.discount}% OFF</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => removeItem(item.id)}
                                    style={styles.removeButton}
                                >
                                    <Text style={styles.removeButtonText}>REMOVE</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Price Details */}
                <View style={styles.priceDetails}>
                    <Text style={styles.priceDetailsTitle}>PRICE DETAILS</Text>
                    <View style={styles.priceRow}>
                        <Text>Price ({cartItems.length} items)</Text>
                        <Text>₹{ }</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text>Delivery Charges</Text>
                        <Text style={styles.freeDelivery}>FREE</Text>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Fixed Footer */}
            <View style={styles.footer}>
                <View style={styles.footerLeft}>
                    <Text style={styles.footerTotalLabel}>Total Amount:</Text>
                    <Text style={styles.footerTotalAmount}>₹{ }</Text>
                </View>
                <TouchableOpacity style={styles.footerPlaceOrderButton}>
                    <Text style={styles.placeOrderText}>Place Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // ... (keep all existing styles)
    container: {
        flex: 1,
        backgroundColor: '#f1f3f6',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 15,
        backgroundColor: '#1E90FF',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
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
        backgroundColor: '#fff',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 12,
        padding: 15,
        marginBottom: 100
    },
    priceDetailsTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 15,
        color: '#878787',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    freeDelivery: {
        color: '#388e3c',
    },
    bottomPadding: {
        height: 60,
    },
    footer: {
        position: 'absolute',
        bottom: 91,
        left: 0,
        right: 0,
        height: 60,
        borderRadius: 8,
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
        backgroundColor: '#fb641b',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 16,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },


    cartItemsContainer: {
        padding: 10,
    },
    cartItem: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        elevation: 3,
    },
    itemLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    quantityContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    itemRight: {
        flex: 1,
        justifyContent: "space-between",
    },
    itemName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    rating: {
        marginRight: 5,
    },
    ratingText: {
        fontSize: 14,
        color: "#777",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    originalPrice: {
        fontSize: 14,
        textDecorationLine: "line-through",
        color: "#999",
        marginLeft: 5,
    },
    discount: {
        fontSize: 14,
        color: "red",
        marginLeft: 5,
    },
    removeButton: {
        backgroundColor: "red",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: "flex-start",
    },
    removeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },

});

const pickerSelectStyles = {
    inputIOS: {
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        color: "black",
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 1,
        paddingHorizontal: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        color: "black",
        paddingRight: 30,
    },
};


export default CartScreen;