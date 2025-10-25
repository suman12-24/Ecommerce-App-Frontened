import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, RefreshControl, Dimensions, Animated, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance, { baseURL } from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { addToCart } from '../redux/cartSlice';
import { addCartToDatabase } from '../redux/addCartToDatabase';
import { addToWishList, removeFromWishList } from '../redux/wishListSlice';
import { deleteWishListItemFromDatabase } from '../redux/deleteWishListItemFromDatabase';
import { addWishListToDatabase } from '../redux/addWishListToDatabase';
import EnhancedWishlistButton from './Components/EnhancedWishlistButton';
import appNameController from './Model/appNameController';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const ProductListingScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { token } = useSelector(state => state.auth);
    const { subcategoryId, subcategoryName } = route.params;
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const dispatch = useDispatch();
    const wishList = useSelector(state => state.wishList);
    // Track loading status for each image
    const [imagesLoading, setImagesLoading] = useState({});

    // Animation values for toast notification
    const toastOpacity = useRef(new Animated.Value(0)).current;
    const toastTranslateY = useRef(new Animated.Value(-50)).current;
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const cart = useSelector(state => state.cart);
    const cartItems = Array.isArray(cart) ? cart : (cart?.items || []);

    // Dynamic column count and item width based on product count
    const columnCount = products.length === 1 ? 1 : 2;
    const ITEM_WIDTH = columnCount === 1 ? (width - 32) : (width - 32) / 2;

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <View style={styles.ratingContainer}>
                {[...Array(fullStars)].map((_, index) => (
                    <FontAwesome key={`full-${index}`} name="star" size={16} color="#FFD700" />
                ))}
                {hasHalfStar && <FontAwesome name="star-half-full" size={16} color="#FFD700" />}
                {[...Array(emptyStars)].map((_, index) => (
                    <FontAwesome key={`empty-${index}`} name="star-o" size={16} color="#FFD700" />
                ))}
                <Text style={styles.ratingText}>{rating}</Text>
            </View>
        );
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                `/Suhani-Electronics-Backend/f_product_category_sub.php?cs_id=${subcategoryId}`
            );

            if (response.data?.success) {
                const loadedProducts = response.data.data;

                // Initialize image loading state for each product
                const initialLoadingState = {};
                loadedProducts.forEach(product => {
                    initialLoadingState[product.id] = true;
                });
                setImagesLoading(initialLoadingState);

                setProducts(loadedProducts);
            } else {
                throw new Error('Failed to fetch products');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateDiscount = (regular, selling) => {
        const regularPrice = parseFloat(regular);
        const sellingPrice = parseFloat(selling);
        if (regularPrice > sellingPrice) {
            const discount = ((regularPrice - sellingPrice) / regularPrice) * 100;
            return `${Math.round(discount)}% Off`;
        }
        return null;
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchProducts();
    }, [subcategoryId]);

    // Show toast animation
    const showToast = (message) => {
        setToastMessage(message);
        setToastVisible(true);

        // Reset animation values
        toastOpacity.setValue(0);
        toastTranslateY.setValue(-50);

        // Animate in
        Animated.parallel([
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(toastTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Automatically hide after 2 seconds
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(toastOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(toastTranslateY, {
                    toValue: -50,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setToastVisible(false);
            });
        }, 1000);
    };

    const isProductInCart = (productId) => {
        if (!cartItems || !Array.isArray(cartItems)) return false;
        return cartItems.some(item => {
            // Handle different possible structures of cart items
            const itemId = typeof item === 'object' ? (item.id || item.productId) : item;
            return itemId === productId;
        });
    };

    const toggleFavorite = async (productId, productName) => {
        if (!token) {
            showToast(`${t('loginToAddWhislist')}`, 'error');
            setTimeout(() => {
                navigation.navigate('AccountStack', { screen: 'AuthScreen' });
            }, 1000);
            return;
        }
        try {
            if (wishList.includes(productId)) {
                dispatch(removeFromWishList(productId)); // Remove from wishlist
                await deleteWishListItemFromDatabase(productId);
                showToast(`${productName} ${t('itemRemoveFromWhislist')}`, 'info');
            } else {
                dispatch(addToWishList(productId)); // Add to wishlist
                await addWishListToDatabase(productId);
                showToast(`${productName} ${t('addedToWhislist')}`, 'success');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            showToast('Failed to update wishlist', 'error');
        }
    };

    const handleAddToCart = async (product, event) => {
        if (!token) {
            showToast(`${t('plzLogInToAddItemCart')}`, 'error');
            setTimeout(() => {
                navigation.navigate('AccountStack', { screen: 'AuthScreen' });
            }, 1000);
            return;
        }
        // Add to cart in redux
        dispatch(addToCart(product));

        // Add to database
        await addCartToDatabase(product.id);


        // Show toast notification
        showToast(`${product.name} ${t('addedToYourCart')}!`);
    };

    const handleProductPress = (item) => {
        navigation.navigate('ProductDetailsScreen', { item });

    }

    const goToCart = () => {
        // This will navigate to the CartScreen while preserving the tab bar
        navigation.navigate(`${t('cart')}`, { screen: 'CartScreen' });
    };

    // Handle image loading status change
    const handleImageLoadStart = (productId) => {
        setImagesLoading(prev => ({
            ...prev,
            [productId]: true
        }));
    };

    const handleImageLoadEnd = (productId) => {
        setImagesLoading(prev => ({
            ...prev,
            [productId]: false
        }));
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={appNameController.statusBarColor} />
                <Text style={styles.loadingText}>{t('loadAmzProduc')}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                    <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderProduct = ({ item, index }) => {
        // Check if product is in cart (for both single and multiple product views)
        const inCart = isProductInCart(item.id);
        const isImageLoading = imagesLoading[item.id];

        // For single product, center it
        if (products.length === 1) {
            return (
                <Animated.View
                    style={[
                        styles.productCard,
                        {
                            width: ITEM_WIDTH,
                            marginHorizontal: 16,
                            transform: [{
                                scale: scrollY.interpolate({
                                    inputRange: [-50, 0, 100, 200],
                                    outputRange: [1, 1, 1, 0.95],
                                    extrapolate: 'clamp',
                                })
                            }]
                        }
                    ]}
                >
                    <Pressable onPress={() => handleProductPress(item)}>
                        <View style={styles.imageContainer}>
                            {isImageLoading && (
                                <View style={styles.imageLoadingContainer}>
                                    <ActivityIndicator size="small" color={appNameController.activityIndicatorColor} />
                                </View>
                            )}
                            <Image
                                source={{ uri: `${baseURL}/Product_image/${item.img_1}` }}
                                style={styles.productImage}
                                onLoadStart={() => handleImageLoadStart(item.id)}
                                onLoad={() => handleImageLoadEnd(item.id)}
                                onError={() => handleImageLoadEnd(item.id)}
                            />
                        </View>
                        {calculateDiscount(item.regular_price, item.selling_price) && (
                            <View style={styles.discountSticker}>
                                <Text style={styles.discountText}>{calculateDiscount(item.regular_price, item.selling_price)}</Text>
                            </View>
                        )}
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {item.name}
                            </Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.productPrice}>₹{item.selling_price}</Text>
                                {item.regular_price !== item.selling_price && (
                                    <Text style={styles.originalPrice}>₹{item.regular_price}</Text>
                                )}
                            </View>
                            {renderStars(parseFloat(item.rating || 0))}
                            <View style={styles.actions}>
                                {item.stock > 0 ? (
                                    inCart ? (
                                        <TouchableOpacity
                                            style={[styles.addToCartButton, { backgroundColor: appNameController.goToCartButtonColor, marginBottom: 12 }]}
                                            onPress={goToCart}
                                        >
                                            <MaterialCommunityIcons name="cart-check" size={18} color="#fff" />
                                            <Text style={styles.buttonText}>{t('goToCart')}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.addToCartButton, { marginBottom: 12 }]}
                                            onPress={() => handleAddToCart(item)}
                                        >
                                            <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                                            <Text style={styles.buttonText}>{t('addToCart')}</Text>
                                        </TouchableOpacity>
                                    )
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.addToCartButton, { backgroundColor: appNameController.outOfStockButtonColor, marginBottom: 12 }]}
                                        disabled={true}
                                    >
                                        <MaterialCommunityIcons name="cart-off" size={18} color="#ff3333" />
                                        <Text style={[styles.buttonText, { color: '#ff3333' }]}>{t('outOfStock')}</Text>
                                    </TouchableOpacity>
                                )}
                                {/* <TouchableOpacity
                                    onPress={() => toggleFavorite(item.id, item.name)}
                                    style={styles.favoriteIcon}
                                >
                                    <FontAwesome
                                        name={wishList.includes(item.id) ? 'heart' : 'heart-o'}
                                        size={24}
                                        color={wishList.includes(item.id) ? 'red' : 'gray'}
                                    />
                                </TouchableOpacity> */}

                                <EnhancedWishlistButton
                                    size={24}
                                    color="red"
                                    isLiked={wishList.includes(item.id)}
                                    isLoggedIn={!!token}
                                    onToggle={() => toggleFavorite(item.id, item.name)}
                                />
                            </View>
                        </View>
                    </Pressable>
                </Animated.View>
            );
        }

        // For multiple products, use the existing grid layout
        const isEven = index % 2 === 0;
        return (
            <Animated.View
                style={[
                    styles.productCard,
                    {
                        width: ITEM_WIDTH,
                        marginLeft: isEven ? 12 : 5,
                        marginRight: isEven ? 5 : 10,
                        transform: [{
                            scale: scrollY.interpolate({
                                inputRange: [-50, 0, 100 * (index + 1), 100 * (index + 2)],
                                outputRange: [1, 1, 1, 0.95],
                                extrapolate: 'clamp',
                            })
                        }]
                    }
                ]}
            >
                <Pressable onPress={() => handleProductPress(item)}>
                    <View style={styles.imageContainer}>
                        {isImageLoading && (
                            <View style={styles.imageLoadingContainer}>
                                <ActivityIndicator size="small" color={appNameController.activityIndicatorColor} />
                            </View>
                        )}
                        <Image
                            source={{ uri: `${baseURL}/Product_image/${item.img_1}` }}
                            style={styles.productImage}
                            onLoadStart={() => handleImageLoadStart(item.id)}
                            onLoad={() => handleImageLoadEnd(item.id)}
                            onError={() => handleImageLoadEnd(item.id)}
                        />
                    </View>
                    {calculateDiscount(item.regular_price, item.selling_price) && (
                        <View style={styles.discountSticker}>
                            <Text style={styles.discountText}>{calculateDiscount(item.regular_price, item.selling_price)}</Text>
                        </View>
                    )}
                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.productPrice}>₹{item.selling_price}</Text>
                            {item.regular_price !== item.selling_price && (
                                <Text style={styles.originalPrice}>₹{item.regular_price}</Text>
                            )}
                        </View>
                        {renderStars(parseFloat(item.rating || 0))}
                        <View style={styles.actions}>
                            {item.stock > 0 ? (
                                inCart ? (
                                    <TouchableOpacity
                                        style={[styles.addToCartButton, { backgroundColor: appNameController.goToCartButtonColor }]}
                                        onPress={goToCart}
                                    >
                                        <MaterialCommunityIcons name="cart-check" size={18} color="#fff" />
                                        <Text style={styles.buttonText}>{t('goToCart')}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.addToCartButton}
                                        onPress={() => handleAddToCart(item)}
                                    >
                                        <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                                        <Text style={styles.buttonText}>{t('addToCart')}</Text>
                                    </TouchableOpacity>
                                )
                            ) : (
                                <TouchableOpacity
                                    style={[styles.addToCartButton, { backgroundColor: appNameController.outOfStockButtonColor }]}
                                    disabled={true}
                                >
                                    <MaterialCommunityIcons name="cart-off" size={18} color="#ff3333" />
                                    <Text style={[styles.buttonText, { color: '#ff3333' }]}>{t('outOfStock')}</Text>
                                </TouchableOpacity>
                            )}
                            {/* <TouchableOpacity
                                onPress={() => toggleFavorite(item.id, item.name)}
                                style={styles.favoriteIcon}
                            >
                                <FontAwesome
                                    name={wishList.includes(item.id) ? 'heart' : 'heart-o'}
                                    size={24}
                                    color={wishList.includes(item.id) ? 'red' : 'gray'}
                                />
                            </TouchableOpacity> */}

                            <EnhancedWishlistButton
                                size={24}
                                color="red"
                                isLiked={wishList.includes(item.id)}
                                isLoggedIn={!!token}
                                onToggle={() => toggleFavorite(item.id, item.name)}
                            />
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={columnCount}
                key={columnCount} // Important: changing this forces FlatList to re-render when column count changes
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[appNameController.activityIndicatorColor]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="inbox" size={48} color="#64748b" />
                        <Text style={styles.emptyText}>{t('noProductFound')}</Text>
                    </View>
                }
            />

            {/* Toast Notification */}
            {toastVisible && (
                <Animated.View
                    style={[
                        styles.toast,
                        {
                            opacity: toastOpacity,
                            transform: [{ translateY: toastTranslateY }]
                        }
                    ]}
                >
                    <MaterialCommunityIcons name="cart-check" size={20} color="#fff" />
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    productList: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        overflow: 'hidden',
    },
    imageContainer: {
        marginTop: 10,
        alignSelf: 'center',
        width: '80%',
        height: 110,
        position: 'relative',
    },
    imageLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(248, 250, 252, 0.5)',
        zIndex: 1,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'center',
    },
    discountSticker: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#ff3333',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    discountText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 12,
    },
    productInfo: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 3
    },
    productName: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
        marginBottom: 5,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        color: '#0ba893',
        fontWeight: '700',
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 14,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#64748b',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addToCartButton: {
        marginBottom: 6,
        flexDirection: 'row',
        backgroundColor: appNameController.addToCartButtonColor,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    favoriteIcon: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: appNameController.statusBarColor,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginVertical: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#0ba893',
        borderRadius: 12,
        elevation: 2,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 48,
    },
    emptyText: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    // Toast notification styles
    toast: {
        position: 'absolute',
        top: 20,
        left: 16,
        right: 16,
        backgroundColor: '#0ba893',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
    toastText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 8,
    }
});

export default ProductListingScreen;
