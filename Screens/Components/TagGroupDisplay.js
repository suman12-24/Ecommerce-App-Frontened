import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Pressable, Animated, Alert, Easing } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axiosInstance, { baseURL } from '../../Axios_BaseUrl_Token_SetUp/axiosInstance';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addToCart } from '../../redux/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishList, removeFromWishList } from '../../redux/wishListSlice';
import { addCartToDatabase } from '../../redux/addCartToDatabase';
import { addWishListToDatabase } from '../../redux/addWishListToDatabase';
import { deleteWishListItemFromDatabase } from '../../redux/deleteWishListItemFromDatabase';
import EnhancedWishlistButton from './EnhancedWishlistButton';
import appNameController from '../Model/appNameController';
import { useTranslation } from 'react-i18next';
// Toast Component
const Toast = ({ visible, message, type, onHide }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show toast animation
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
                }),
            ]).start();

            // Hide toast after delay
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
                    }),
                ]).start(() => {
                    if (onHide) onHide();
                });
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#4CAF50';
            case 'error':
                return '#F44336';
            case 'warning':
                return '#FF9800';
            case 'info':
                return '#2196F3';
            default:
                return '#333';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'times-circle';
            case 'warning':
                return 'exclamation-circle';
            case 'info':
                return 'info-circle';
            default:
                return 'bell';
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                {
                    backgroundColor: getBackgroundColor(),
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <FontAwesome name={getIcon()} size={20} color="#fff" style={styles.toastIcon} />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

const LightningAnimation = ({ visible, position, onAnimationEnd }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (visible) {
            // Reset values
            opacity.setValue(0);
            scale.setValue(0.5);

            // Sequence of animations
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1.2,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (onAnimationEnd) onAnimationEnd();
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.lightningContainer,
                {
                    opacity,
                    transform: [{ scale }],
                    top: position.y - 30,
                    left: position.x - 15,
                },
            ]}
        >
            <FontAwesome name="bolt" size={30} color="#FFD700" />
        </Animated.View>
    );
};

const ShimmerPlaceholder = ({ width, height, style }) => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <View style={[{ width, height, backgroundColor: '#E0E0E0', overflow: 'hidden' }, style]}>
            <Animated.View
                style={{
                    width: '100%',
                    height: '100%',
                    transform: [{ translateX }],
                }}
            >
                <LinearGradient
                    colors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%' }}
                />
            </Animated.View>
        </View>
    );
};

const ProductCardSkeleton = () => (
    <View style={styles.card}>
        <ShimmerPlaceholder width={200} height={180} />
        <View style={{ padding: 10 }}>
            <ShimmerPlaceholder width={150} height={20} style={{ marginTop: 10 }} />
            <ShimmerPlaceholder width={100} height={20} style={{ marginTop: 10 }} />
            <ShimmerPlaceholder width={120} height={20} style={{ marginTop: 10 }} />
            <View style={styles.actions}>
                <ShimmerPlaceholder width={100} height={32} style={{ borderRadius: 5 }} />
                <ShimmerPlaceholder width={32} height={32} style={{ borderRadius: 16 }} />
            </View>
        </View>
    </View>
);

const LoadingState = () => (
    <View style={styles.container}>
        <ShimmerPlaceholder width={150} height={24} style={{ marginBottom: 15 }} />
        <FlatList
            data={[1, 2, 3]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <ProductCardSkeleton />}
        />
    </View>
);

// Image with loading indicator
const ProductImage = ({ source, style }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            })
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const handleLoadEnd = () => {
        setImageLoading(false);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
            {imageLoading && (
                <View style={[style, styles.loaderContainer]}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <FontAwesome name="spinner" size={24} color="#0fbd9a" />
                    </Animated.View>
                </View>
            )}
            <Animated.Image
                source={source}
                style={[
                    style,
                    { opacity: fadeAnim, position: imageLoading ? 'absolute' : 'relative' }
                ]}
                onLoadEnd={handleLoadEnd}
            />
        </View>
    );
};

const TagGroupDisplay = ({ tagGroupName }) => {
    const { t } = useTranslation();
    const { token } = useSelector(state => state.auth);
    const [favorites, setFavorites] = useState({});
    const [products, setProducts] = useState([]);
    const [banner, setBanner] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const wishList = useSelector(state => state.wishList);
    const [lightningVisible, setLightningVisible] = useState(false);
    const [lightningPosition, setLightningPosition] = useState({ x: 0, y: 0 });
    const [animatingItemId, setAnimatingItemId] = useState(null);
    const [animatingWishlistId, setAnimatingWishlistId] = useState(null);

    // Toast state
    const [toast, setToast] = useState({
        visible: false,
        message: '',
        type: 'success',
    });

    // Get cart items from Redux store - accessing the correct structure
    const cart = useSelector(state => state.cart);
    // Handle potential different cart structures based on your Redux setup
    const cartItems = Array.isArray(cart) ? cart : (cart?.items || []);

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <>
                {[...Array(fullStars)].map((_, index) => (
                    <FontAwesome key={`full-${index}`} name="star" size={16} color="#FFD700" />
                ))}
                {hasHalfStar && <FontAwesome name="star-half-full" size={16} color="#FFD700" />}
                {[...Array(emptyStars)].map((_, index) => (
                    <FontAwesome key={`empty-${index}`} name="star-o" size={16} color="#FFD700" />
                ))}
            </>
        );
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            if (tagGroupName.products || tagGroupName.tag_group) {
                setProducts(tagGroupName?.products);
                // Handling tag_group as an object
                const tagGroup = tagGroupName.tag_group;
                const transformedTags = {
                    id: tagGroup.id,
                    title: tagGroup.tag_name,
                    image: `${baseURL}/Product_image/${tagGroup.banner}`,
                };
                setBanner(transformedTags);
            }
        } catch (err) {
            setError('Failed to fetch products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({
            visible: true,
            message,
            type,
        });
    };

    // Hide toast notification
    const hideToast = () => {
        setToast({
            ...toast,
            visible: false,
        });
    };

    const isProductInCart = (productId) => {
        if (!cartItems || !Array.isArray(cartItems)) return false;
        return cartItems.some(item => {
            // Handle different possible structures of cart items
            const itemId = typeof item === 'object' ? (item.id || item.productId) : item;
            return itemId === productId;
        });
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

    const toggleFavorite = async (productId, productName, event) => {
        if (!token) {
            showToast(`${t('loginToAddFavourite')}`, 'error');
            setTimeout(() => {
                navigation.navigate('AccountStack', { screen: 'AuthScreen' });
            }, 1000);
            return;
        }
        // Set the animating wishlist item
        setAnimatingWishlistId(productId);

        try {
            if (wishList.includes(productId)) {
                dispatch(removeFromWishList(productId)); // Remove from wishlist
                await deleteWishListItemFromDatabase(productId);
                showToast(`${productName} ${t('removeFromWhislist')}`, 'error');
            } else {
                dispatch(addToWishList(productId)); // Add to wishlist
                await addWishListToDatabase(productId);
                showToast(`${productName} added to wishlist`, 'success');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            showToast('Failed to update wishlist', 'error');
        }

        // Reset animating wishlist ID after a short delay
        setTimeout(() => {
            setAnimatingWishlistId(null);
        }, 1000);
    };

    const handleAddToCart = async (product, event) => {
        if (!token) {
            showToast(`${t('plzLogInToAddItemCart')}`, 'error');
            setTimeout(() => {
                navigation.navigate('AccountStack', { screen: 'AuthScreen' });
            }, 1000);

            return;
        }

        try {
            // Get button position for animation
            const buttonPosition = event.nativeEvent;
            setLightningPosition({
                x: buttonPosition.pageX,
                y: buttonPosition.pageY
            });

            // Set animating item and show lightning
            setAnimatingItemId(product.id);
            setLightningVisible(true);

            // Add to cart in redux
            dispatch(addToCart(product));

            // Add to database
            await addCartToDatabase(product.id);

            // Show toast notification
            showToast(`${product.name} ${t('addedToCart')}`, 'success');


        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast('Failed to add to cart', 'error');
        }
    };

    const handleAnimationEnd = () => {
        setLightningVisible(false);
        setAnimatingItemId(null);
    };

    // New function to navigate to cart screen
    const goToCart = () => {
        // This will navigate to the CartScreen while preserving the tab bar
        navigation.navigate('Cart', { screen: 'CartScreen' });
    };

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Toast component */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />

            <LightningAnimation
                visible={lightningVisible}
                position={lightningPosition}
                onAnimationEnd={handleAnimationEnd}
            />

            <View style={{
                flexDirection: 'row',
                marginBottom: 10,
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.header}>{banner.title}</Text>
                </View>

                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => navigation.navigate('ViewAllProductScreen', { products, pageTittle: banner.title })}
                >
                    <Text style={{ fontSize: 14, fontWeight: '500', marginRight: 5, color: '#007AFF' }}>
                       {t('viewAll')}
                    </Text>
                    <Icon name="arrow-forward-ios" size={14} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={products}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate('ProductDetailsScreen', { item })}
                        style={styles.card}>
                        <ProductImage
                            source={{ uri: `${baseURL}/Product_image/${item.img_1}` }}
                            style={styles.productImage}
                        />
                        {calculateDiscount(item.regular_price, item.selling_price) && (
                            <View style={styles.discountSticker}>
                                <Text style={styles.discountText}>{calculateDiscount(item.regular_price, item.selling_price)}</Text>
                            </View>
                        )}
                        <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.productPrice}>₹{item.selling_price.toLocaleString()}</Text>
                            {item.regular_price !== item.selling_price && (
                                <Text style={styles.originalPrice}>₹{item.regular_price.toLocaleString()}</Text>
                            )}
                        </View>
                        <View style={styles.ratingContainer}>
                            {renderStars(item.rating)}
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>

                        <View style={styles.actions}>
                            {item.stock < 1 ? (
                                <TouchableOpacity
                                    style={[styles.addToCartButton, { backgroundColor: appNameController.outOfStockButtonColor }]}
                                    disabled={true}
                                >
                                    <MaterialCommunityIcons name="cart-off" size={18} color="#ff3333" />
                                    <Text style={[styles.buttonText, { color: '#ff3333' }]}>{t('goToCart')}</Text>
                                </TouchableOpacity>
                            ) : isProductInCart(item.id) ? (
                                <TouchableOpacity
                                    style={[styles.addToCartButton, { backgroundColor: appNameController.goToCartButtonColor }]}
                                    onPress={goToCart}
                                >
                                    <MaterialCommunityIcons name="cart-check" size={18} color="#fff" />
                                    <Text style={styles.buttonText}>{t('goToCart')}</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[
                                        styles.addToCartButton,
                                        animatingItemId === item.id && styles.animatingButton
                                    ]}
                                    onPress={(event) => handleAddToCart(item, event)}
                                >
                                    <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                                    <Text style={styles.buttonText}>{t('addToCart')}</Text>
                                </TouchableOpacity>
                            )}

                            {/* Enhanced Wishlist Button */}
                            <View style={styles.favoriteIcon}>
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
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    header: {
        color: '#262626',
        fontSize: 18,
        fontWeight: '700',
        paddingLeft: 1
    },
    card: {
        marginVertical: 10,
        width: 200,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 5,
        marginLeft: 5,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    productImage: {
        marginTop: 10,
        width: '100%',
        height: 110,
        resizeMode: 'contain',
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
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
        fontWeight: 'bold',
        fontSize: 12,
    },
    productTitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 5,
        marginHorizontal: 10,
        height: 40,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    originalPrice: {
        fontSize: 14,
        color: '#666',
        textDecorationLine: 'line-through',
        marginLeft: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 5,
    },
    ratingText: {
        marginLeft: 5,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 10,
        marginBottom: 10,
    },
    addToCartButton: {
        flexDirection: 'row',
        backgroundColor: appNameController.addToCartButtonColor,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    animatingButton: {
        backgroundColor: '#099980',
    },
    buttonText: {
        paddingLeft: 5,
        color: '#fff',
        fontWeight: '500',
        fontSize: 14,
    },
    favoriteIcon: {
        marginLeft: 10,
    },
    bannerContainer: {
        marginBottom: 15,
    },
    bannerImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    lightningContainer: {
        position: 'absolute',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Toast styles
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#333',
        flexDirection: 'row',
        padding: 12,
        borderRadius: 5,
        margin: 10,
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    toastText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    toastIcon: {
        marginRight: 10,
    },
    heartIcon: {
        // Add shadow to make heart more prominent
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    }
});

export default TagGroupDisplay;

