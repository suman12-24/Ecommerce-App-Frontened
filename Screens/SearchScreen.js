import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, FlatList, Dimensions, Image, Pressable, ActivityIndicator, Animated, Alert, StatusBar } from 'react-native';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance, { baseURL } from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { addCartToDatabase } from '../redux/addCartToDatabase';
import { addToWishList, removeFromWishList } from '../redux/wishListSlice';
import { deleteWishListItemFromDatabase } from '../redux/deleteWishListItemFromDatabase';
import { addWishListToDatabase } from '../redux/addWishListToDatabase';
import EnhancedWishlistButton from './Components/EnhancedWishlistButton';
import appNameController from './Model/appNameController';
import { useTranslation } from 'react-i18next';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2; // Account for padding and gap

// Custom Toast Component
const AnimatedToast = ({ message, type, visible, onHide }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            // Auto hide after 2 seconds
            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -100,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ]).start(() => {
                    if (onHide) onHide();
                });
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [visible, translateY, opacity, onHide]);

    return visible ? (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3',
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <MaterialCommunityIcons
                name={type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'information'}
                size={20}
                color="#fff"
            />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    ) : null;
};

const SearchScreen = () => {
    const { token } = useSelector(state => state.auth);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [favorites, setFavorites] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const cart = useSelector(state => state.cart);
    const cartItems = Array.isArray(cart) ? cart : (cart?.items || []);
    const wishList = useSelector(state => state.wishList);
    const { t } = useTranslation();
    // State for image loading
    const [loadingImages, setLoadingImages] = useState({});

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isLoading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading]);
    // Toast state
    const [toast, setToast] = useState({
        visible: false,
        message: '',
        type: 'success',
    });

    // Animation refs for Add to Cart button
    const addToCartScale = useRef(new Animated.Value(1)).current;

    // Show toast message
    const showToast = (message, type = 'success') => {
        setToast({
            visible: true,
            message,
            type,
        });
    };

    // Hide toast message
    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    // Handle image loading state
    const handleImageLoadStart = (productId) => {
        setLoadingImages(prev => ({ ...prev, [productId]: true }));
    };

    const handleImageLoadEnd = (productId) => {
        setLoadingImages(prev => ({ ...prev, [productId]: false }));
    };

    // Memoized function to calculate discount
    const calculateDiscount = useCallback((regular, selling) => {
        const regularPrice = parseFloat(regular);
        const sellingPrice = parseFloat(selling);
        if (regularPrice > sellingPrice) {
            const discount = ((regularPrice - sellingPrice) / regularPrice) * 100;
            return `${Math.round(discount)}% Off`;
        }
        return null;
    }, []);

    const isProductInCart = (productId) => {
        if (!cartItems || !Array.isArray(cartItems)) return false;
        return cartItems.some(item => {
            // Handle different possible structures of cart items
            const itemId = typeof item === 'object' ? (item.id || item.productId) : item;
            return itemId === productId;
        });
    };

    const handleAddToCart = async (product, event) => {
        if (!token) {
            showToast(`${t('loginToAddCart')}`, 'error');
            setTimeout(() => {
                navigation.navigate('AccountStack', { screen: 'AuthScreen' });
            }, 1000);
            return;
        }

        // Animate the button
        Animated.sequence([
            Animated.timing(addToCartScale, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(addToCartScale, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(addToCartScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        try {
            // Add to cart in redux
            dispatch(addToCart(product));

            // Add to database
            await addCartToDatabase(product.id);

            // Show success toast
            showToast(`${product.name} ${t('addedToCart')}`, 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast('Failed to add item to cart', 'error');
        }
    };

    const goToCart = () => {
        navigation.navigate("BottomTabNavigator", {
            screen: `${t('cart')}`,
            params: { screen: "CartScreen" }
        });
    };

    // Fetch products only once when component mounts
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get('/Suhani-Electronics-Backend/f_product_search.php');

                if (response?.data?.data) {
                    // Store the complete data from the API
                    setAllProducts(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products based on search query
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim() === '') {
                setFilteredProducts([]);
                setError(null);
            } else {
                const filtered = allProducts.filter(product =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setFilteredProducts(filtered);
                if (filtered.length === 0) {
                    setError(`${t('noResultFound')} "${searchQuery}"`);
                } else {
                    setError(null);
                }
            }
        }, 300); // Debounce search for better performance

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, allProducts]);

    // Memoized star rating component to prevent re-renders
    const renderStars = useCallback((rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <View style={styles.starsContainer}>
                {[...Array(fullStars)].map((_, index) => (
                    <FontAwesome key={`full-${index}`} name="star" size={12} color="#FFD700" />
                ))}
                {hasHalfStar && <FontAwesome name="star-half-full" size={12} color="#FFD700" />}
                {[...Array(emptyStars)].map((_, index) => (
                    <FontAwesome key={`empty-${index}`} name="star-o" size={12} color="#FFD700" />
                ))}
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
        );
    }, []);

    const toggleFavorite = async (productId, productName) => {
        // Animation for heart icon
        const heartScale = new Animated.Value(1);

        Animated.sequence([
            Animated.timing(heartScale, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(heartScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
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

    const handleProductPress = useCallback((item) => {
        navigation.navigate('ProductDetailsScreen', { item });
    }, [navigation]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        setError(null);
    }, []);

    // Memoized product card component to prevent re-renders
    const renderProductCard = useCallback(({ item }) => (
        <Pressable
            style={styles.card}
            onPress={() => handleProductPress(item)}
        >
            <View style={styles.imageContainer}>
                {loadingImages[item.id] && (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="small" color={appNameController.activityIndicatorColor} />
                    </View>
                )}
                <Image
                    source={{ uri: `${baseURL}/Product_image/${item.img_1}` }}
                    style={styles.productImage}
                    onLoadStart={() => handleImageLoadStart(item.id)}
                    onLoadEnd={() => handleImageLoadEnd(item.id)}
                />
            </View>
            {calculateDiscount(item.regular_price, item.selling_price) && (
                <View style={styles.discountSticker}>
                    <Text style={styles.discountText}>{calculateDiscount(item.regular_price, item.selling_price)}</Text>
                </View>
            )}
            <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>{`₹${parseFloat(item.selling_price).toLocaleString()}`}</Text>
                {item.regular_price !== item.selling_price && (
                    <Text style={styles.originalPrice}>{`₹${parseFloat(item.regular_price).toLocaleString()}`}</Text>
                )}
            </View>
            {renderStars(parseFloat(item.rating || 0))}
            <View style={styles.actions}>
                {isProductInCart(item.id) ? (
                    <TouchableOpacity
                        style={[styles.addToCartButton, { backgroundColor: appNameController.goToCartButtonColor }]}
                        onPress={goToCart}
                    >
                        <MaterialCommunityIcons name="cart-check" size={18} color="#fff" />
                        <Text style={styles.buttonText}>{t('goToCart')}</Text>
                    </TouchableOpacity>
                ) : item.stock > 0 ? (
                    <Animated.View style={{ transform: [{ scale: addToCartScale }] }}>
                        <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={(event) => handleAddToCart(item, event)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                            <Text style={styles.buttonText}>{t('addToCart')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
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
                    activeOpacity={0.7}
                >
                    <Animated.View>
                        <FontAwesome
                            name={wishList.includes(item.id) ? 'heart' : 'heart-o'}
                            size={24}
                            color={wishList.includes(item.id) ? 'red' : 'gray'}
                        />
                    </Animated.View>
                </TouchableOpacity> */}
                <EnhancedWishlistButton
                    size={24}
                    color="red"
                    isLiked={wishList.includes(item.id)}
                    isLoggedIn={!!token}
                    onToggle={() => toggleFavorite(item.id, item.name)}
                />
            </View>
        </Pressable>
    ), [baseURL, favorites, handleProductPress, renderStars, toggleFavorite, calculateDiscount, loadingImages, addToCartScale, wishList]);

    // Extract key extractor logic
    const keyExtractor = useCallback((item) => item.id.toString(), []);

    // Memoize content container style
    const listStyle = useMemo(() => ({
        padding: 10
    }), []);

    // Memoize column wrapper style
    const columnStyle = useMemo(() => ({
        justifyContent: 'space-between',
        marginBottom: 10
    }), []);

    return (

        <SafeAreaView style={styles.container}>
            {/* Toast notification */}
            <AnimatedToast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />

            <View style={styles.searchHeader}
            >
                <Icon name="arrow-back" size={24} color="#616161" onPress={() => navigation.goBack()} />
                <View style={styles.searchContainer}>
                    <Icon name="search" size={24} color="#616161" />
                    <TextInput
                        placeholder={t('searchForProduct')}
                        placeholderTextColor="#9E9E9E"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                </View>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleClearSearch}>
                    <Text style={styles.cancelText}>{t('cancel')}</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={appNameController.activityIndicatorColor} style={{ marginTop: 10, marginRight: 10 }} />
                    <Text style={styles.loadingText}>{t('loadProduct')}</Text>
                </View>
            ) : searchQuery.trim() === '' ? (
                // Only show search instructions when search query is empty
                <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]}>
                    <Icon name="search" size={30} color="#0fbd9a" style={{ marginTop: 10 }} />
                    <Text style={styles.loadingText}>{t('clickSearchBar')}</Text>
                </Animated.View>
            ) : null}

            {error && searchQuery.trim() !== '' && (
                <View style={styles.errorContainer}>
                    <Icon name="search-off" size={40} color="#999" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorSubtext}>{t('checkingSpellWithDiffKey')}</Text>
                </View>
            )}

            {searchQuery.trim() !== '' && !error && !isLoading && (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={keyExtractor}
                    renderItem={renderProductCard}
                    numColumns={2}
                    columnWrapperStyle={columnStyle}
                    contentContainerStyle={listStyle}
                    initialNumToRender={6}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <StatusBar
                barStyle="light-content"
                translucent={false}
                backgroundColor={appNameController.statusBarColor}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchContainer: {
        marginLeft: 8,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
        paddingHorizontal: 8,
        marginRight: 5,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#212121',
        paddingVertical: 8,
    },
    cancelBtn: {
        paddingHorizontal: 2,
        paddingVertical: 5,
    },
    cancelText: {
        color: '#ff3333',
        fontSize: 16,
        fontWeight: '500',
    },
    centerContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    imageContainer: {
        width: '100%',
        height: 100,
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        position: 'absolute',
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    productImage: {
        marginTop: 5,
        width: '100%',
        height: 100,
        resizeMode: 'center',
    },
    discountSticker: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#ff3333',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 12,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginTop: 8,
        marginHorizontal: 8,
        height: 32,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    originalPrice: {
        fontSize: 12,
        color: '#666',
        textDecorationLine: 'line-through',
        marginLeft: 6,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginHorizontal: 8,
        marginBottom: 8,
    },
    addToCartButton: {
        flexDirection: 'row',
        backgroundColor: appNameController.addToCartButtonColor,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        marginLeft: 4,
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    },
    favoriteIcon: {
        padding: 4,
    },
    toast: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});

export default React.memo(SearchScreen);
