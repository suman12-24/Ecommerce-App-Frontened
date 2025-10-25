import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions, Animated, Platform, Pressable } from 'react-native';
import axiosInstance, { baseURL } from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { CategoryShimmerEffect, ProductShimmerEffect } from './Components/ShimmerEffect';
import { addToWishList, removeFromWishList } from '../redux/wishListSlice';
import { deleteWishListItemFromDatabase } from '../redux/deleteWishListItemFromDatabase';
import { addWishListToDatabase } from '../redux/addWishListToDatabase';
import { addToCart } from '../redux/cartSlice';
import { addCartToDatabase } from '../redux/addCartToDatabase';
import EnhancedWishlistButton from './Components/EnhancedWishlistButton';
import appNameController from './Model/appNameController';
import { useTranslation } from 'react-i18next';
const { width, height } = Dimensions.get('window');

const CategoryMainScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { token } = useSelector(state => state.auth);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productLoading, setProductLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [imagesLoading, setImagesLoading] = useState({});
    const [subCategoryTitle, setSubCategoryTitle] = useState('All Products');
    const [columnCount, setColumnCount] = useState(2);

    // Animation references
    const categoryOpacity = useRef(new Animated.Value(0)).current;
    const productScale = useRef(new Animated.Value(0.8)).current;
    const cart = useSelector(state => state.cart);
    const cartItems = Array.isArray(cart) ? cart : (cart?.items || []);

    const category_id = route?.params;
    const scrollY = useRef(new Animated.Value(0)).current;

    const dispatch = useDispatch();
    const wishList = useSelector(state => state.wishList);

    // Animation values for toast notification
    const toastOpacity = useRef(new Animated.Value(0)).current;
    const toastTranslateY = useRef(new Animated.Value(-50)).current;
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [imageLoading, setImageLoading] = useState(true);

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


    const handleProductPress = (item) => {
        navigation.navigate('ProductDetailsScreen', { item });
    };

    const handleAddToCart = async (product, event) => {
        if (!token) {
            showToast(`${t('loginToAddCart')}`, 'error');
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
                showToast(`${productName} ${t('removeFromWhislist')}`, 'info');
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

    const goToCart = () => {
        // Navigate to cart screen
        navigation.navigate(`${t('cart')}`);
    };

    useEffect(() => {
        fetchCategories();
    }, [category_id]);

    useEffect(() => {
        // Animate categories when they load
        Animated.timing(categoryOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();
    }, [categories]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `/Suhani-Electronics-Backend/f_product_category_main_s.php?cm_id=${category_id}`
            );

            if (response?.data?.success) {
                // Create 'All Products' category
                const allProductsCategory = {
                    id: 'all',
                    category_name: 'All Products',
                    category_image: {
                        uri: 'https://i.pinimg.com/736x/0e/e9/aa/0ee9aa82a9dccd8fb758edce37fdda06.jpg'
                    }
                };

                const formattedData = [
                    allProductsCategory,
                    ...response.data.data.map(item => ({
                        id: item.id,
                        category_name: item.name,
                        category_image: item.logo
                            ? { uri: `${baseURL}/Category_sub/${item.logo}` }
                            : require('../Assets/banner1.jpeg'),
                    }))
                ];

                setCategories(formattedData);

                // Fetch all products by default
                fetchProducts('all');
            } else {
                setError('No categories found');
            }
        } catch (err) {
            setError('Failed to fetch categories');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (subcategoryId, subcategoryName) => {
        try {
            // Reset product scale for animation
            Animated.spring(productScale, {
                toValue: 0.8,
                friction: 5,
                useNativeDriver: true
            }).start();

            setProductLoading(true);
            setProducts([]);
            setSelectedCategory(subcategoryId);

            // Determine column count based on number of products
            const newColumnCount = products.length === 1 ? 1 : 2;
            setColumnCount(newColumnCount);

            // Check if it's 'All Products' category
            const endpoint = subcategoryId === 'all'
                ? `/Suhani-Electronics-Backend/f_product_category_main.php?cm_id=${category_id}`
                : `/Suhani-Electronics-Backend/f_product_category_sub.php?cs_id=${subcategoryId}`;

            const response = await axiosInstance.get(endpoint);

            if (response?.data?.success) {
                const fetchedProducts = response.data.data;
                setProducts(fetchedProducts);

                // Adjust column count based on fetched products
                const updatedColumnCount = fetchedProducts.length === 1 ? 1 : 2;
                setColumnCount(updatedColumnCount);

                subcategoryId === 'all' ? setSubCategoryTitle("All Products") : setSubCategoryTitle(subcategoryName);

                // Animate products when loaded
                Animated.spring(productScale, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true
                }).start();
            } else {
                setProducts([]);
                setColumnCount(2); // Reset to default
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setProducts([]);
            setColumnCount(2); // Reset to default
        } finally {
            setProductLoading(false);
        }
    };

    const renderCategoryItem = ({ item }) => {
        const isSelected = selectedCategory === item.id;

        return (
            <Animated.View
                style={[
                    styles.categoryItemContainer,
                    { opacity: categoryOpacity }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.categoryItem,
                        isSelected && styles.selectedCategoryItem
                    ]}
                    onPress={() => fetchProducts(item.id, item.category_name)}
                >
                    <LinearGradient
                        colors={isSelected ? ['#fff', '#fff'] : ['#f1f5f9', '#f1f5f9']}
                        style={styles.categoryGradient}
                    >
                        <View style={styles.imageContainer}>
                            {imageLoading && (
                                <ActivityIndicator
                                    size="small"
                                    color={appNameController.activityIndicatorColor}
                                    style={{
                                        position: 'absolute',
                                        zIndex: 1,
                                    }}
                                />
                            )}
                            <Image
                                source={item.category_image}
                                style={styles.categoryImage}
                                onLoadStart={() => setImageLoading(true)}
                                onLoadEnd={() => setImageLoading(false)}
                            />
                        </View>
                        <Text
                            style={[
                                styles.categoryName,
                                isSelected && styles.selectedCategoryText
                            ]}
                            numberOfLines={2}
                        >
                            {item.category_name}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

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

    const calculateDiscount = (regular, selling) => {
        const regularPrice = parseFloat(regular);
        const sellingPrice = parseFloat(selling);
        if (regularPrice > sellingPrice) {
            const discount = ((regularPrice - sellingPrice) / regularPrice) * 100;
            return `${Math.round(discount)}% Off`;
        }
        return null;
    };

    const isProductInCart = (productId) => {
        if (!cartItems || !Array.isArray(cartItems)) return false;
        return cartItems.some(item => {
            const itemId = typeof item === 'object' ? (item.id || item.productId) : item;
            return itemId === productId;
        });
    };

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

    const renderProduct = ({ item, index }) => {
        const ITEM_WIDTH = columnCount === 1
            ? (width - 100)
            : (width - 105) / 2;

        const inCart = isProductInCart(item.id);
        const isImageLoading = imagesLoading[item.id];

        // Single product layout
        if (products.length === 1) {
            return (
                <Animated.View
                    style={[
                        styles.productCard,
                        {
                            left: 3,
                            width: ITEM_WIDTH,
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
                                {inCart ? (
                                    <TouchableOpacity
                                        style={[styles.addToCartButton, { backgroundColor: appNameController.goToCartButtonColor }]}
                                        onPress={goToCart}
                                    >
                                        <MaterialCommunityIcons name="cart-check" size={18} color="#fff" />
                                        <Text style={styles.buttonText}>{t('goToCart')}</Text>
                                    </TouchableOpacity>
                                ) : item.stock > 0 ? (
                                    <TouchableOpacity
                                        style={styles.addToCartButton}
                                        onPress={() => handleAddToCart(item)}
                                    >
                                        <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                                        <Text style={styles.buttonText}>{t('addToCart')}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.addToCartButton, { backgroundColor: appNameController.outOfStockButtonColor }]}
                                        disabled={true}
                                    >
                                        <MaterialCommunityIcons name="cart-off" size={18} color="#ff3333" />
                                        <Text style={[styles.buttonText, { color: '#ff3333' }]}>{t('outOfStock')}</Text>
                                    </TouchableOpacity>
                                )}
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

        // Multiple products grid layout
        const isEven = index % 2 === 0;
        return (
            <Animated.View
                style={[
                    styles.productCard,
                    {
                        width: ITEM_WIDTH,
                        marginLeft: isEven ? 5 : 2,
                        marginRight: isEven ? 3 : 5,
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
                            {inCart ? (
                                <TouchableOpacity
                                    style={[styles.addToCartButton, { backgroundColor: appNameController.goToCartButtonColor }]}
                                    onPress={goToCart}
                                >
                                    <MaterialCommunityIcons name="cart-check" size={18} color="#fff" />
                                    <Text style={styles.buttonText}>{t('goCart')}</Text>
                                </TouchableOpacity>
                            ) : item.stock > 0 ? (
                                <TouchableOpacity
                                    style={styles.addToCartButton}
                                    onPress={() => handleAddToCart(item)}
                                >
                                    <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                                    <Text style={styles.buttonText}>{t('add')}</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.addToCartButton, { backgroundColor: appNameController.outOfStockButtonColor }]}
                                    disabled={true}
                                >
                                    <MaterialCommunityIcons name="cart-off" size={16} color="#ff3333" />
                                    <Text style={[styles.buttonText, { color: '#ff3333', fontSize: 13.5 }]}>{t('stockOut')}</Text>
                                </TouchableOpacity>
                            )}
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

    // Loading state with shimmer effects
    if (loading) {
        return (
            <LinearGradient
                colors={['#fff', '#f2f2f2']}
                style={styles.container}
            >
                <View style={styles.mainContainer}>
                    {/* Categories Shimmer */}
                    <View style={styles.categoriesContainer}>
                        <CategoryShimmerEffect />
                    </View>

                    {/* Products Shimmer */}
                    <View style={styles.productsContainer}>
                        <ProductShimmerEffect />
                    </View>
                </View>
            </LinearGradient>
        );
    }

    // Error state
    if (error) {
        return (
            <LinearGradient
                colors={['#fff', '#f2f2f2']}
                style={styles.centerContainer}
            >
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchCategories}
                >
                    <Text style={styles.retryButtonText}>{t('retry')}</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    // Main render
    return (
        <LinearGradient
            colors={['#F0FFF0', '#E6F2E6']}
            style={styles.container}
        >
            <View style={styles.mainContainer}>
                {/* Categories List (Left Side) */}
                <Animated.View
                    style={[
                        styles.categoriesContainer,
                        { opacity: categoryOpacity }
                    ]}
                >
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.categoriesList}
                        showsVerticalScrollIndicator={false}
                    />
                </Animated.View>

                {/* Products List (Right Side) */}
                <View style={styles.productsContainer}>
                    <Text style={{
                        textAlign: 'center', marginBottom: 15, marginTop: 5,
                        fontSize: 20, color: 'black', fontWeight: '500'
                    }}>{subCategoryTitle}</Text>
                    {productLoading ? (
                        <LinearGradient
                            colors={['#fff', '#f2f2f2']}
                            style={styles.centerContainer}
                        >
                            <ProductShimmerEffect />
                        </LinearGradient>
                    ) : (
                        products.length > 0 ? (
                            <FlatList
                                key={columnCount} // Key to force re-render when column count changes
                                data={products}
                                renderItem={renderProduct}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={columnCount}
                                showsVerticalScrollIndicator={false}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: false }
                                )}
                            />
                        ) : (
                            <View style={styles.centerContainer}>
                                <Text style={styles.noProductsText}>{t('noProductFound')}</Text>
                            </View>
                        )
                    )}

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
            </View>
        </LinearGradient>
    );
};

export default CategoryMainScreen;

// Note: The styles object is not included in this snippet. 
// You would need to add the corresponding StyleSheet definition from your original code.

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    categoriesContainer: {
        width: width * 0.22,
        backgroundColor: '#edf8f8',
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.1)', // Softer border color
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    productsContainer: {
        flex: 1,
        marginTop: 10,
        backgroundColor: '#fff',
    },
    categoriesList: {
        paddingVertical: 5,
    },
    categoryItemContainer: {
        marginBottom: 3, // Consistent spacing
        marginHorizontal: 3,
        borderRadius: 10, // Slightly rounded corners
    },
    categoryItem: {
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent', // For consistent sizing
    },
    categoryGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    selectedCategoryItem: {
        elevation: 2,
        shadowColor: '#e0e7ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    categoryImage: {
        width: 50, // Slightly smaller
        height: 50,
        resizeMode: 'center',
    },
    categoryName: {
        marginTop: -10,
        fontSize: 12, // Slightly smaller font
        textAlign: 'center',
        color: '#333333',
        fontWeight: '600',
    },
    selectedCategoryText: {
        marginTop: -12,
        color: '#595959',
        fontWeight: '700',
        fontSize: 14
    },

    productCard: {
        marginTop: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        // marginBottom: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    imageContainer: {
        alignSelf: 'center',
        width: '100%', // Slightly wider image container
        height: 70, // Increased height
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    productImage: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain', // Ensure full image visibility
    },
    imageLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        zIndex: 1,
    },
    discountSticker: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#FF6B6B',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    discountText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 11,
    },
    productInfo: {
        padding: 6,
    },
    productName: {
        fontSize: 13,
        color: '#1F2937', // Darker text color
        fontWeight: '600',
        marginBottom: 3,
        height: 35, // Consistent height for multi-line names
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        color: '#0ba893', // More vibrant green
        fontWeight: '700',
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 14,
        color: '#6B7280',
        textDecorationLine: 'line-through',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    addToCartButton: {
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: appNameController.addToCartButtonColor,
        paddingVertical: 5,
        borderRadius: 6,
        alignItems: 'center',
        flex: 1, // Take available space
        marginRight: 2, // Space between cart and favorite
    },
    buttonText: {
        color: '#FFFFFF',
        marginLeft: 4,
        fontSize: 15,
        fontWeight: '600',
    },
    favoriteIcon: {
        padding: 5,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.05)', // Soft background
    },
    noProductsText: {
        fontSize: 16,
        color: '#10B981',
        fontWeight: '500',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#6B7280',
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        backgroundColor: '#0ba893',
        borderRadius: 12,
        elevation: 2,
        marginTop: 20
    },
    retryButtonText: {

        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
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
