import { StyleSheet, Text, View, FlatList, Pressable, Animated, Image } from 'react-native';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { baseURL } from '../../Axios_BaseUrl_Token_SetUp/axiosInstance';

const MenuComponent = ({
    categories,
    allProducts,
    theme = {
        primary: '#2874F0',
        background: '#fff',
        border: '#e0e0e0',
        text: '#424242',
        selectedText: '#2874F0',
    },
    headerIcon = 'lightning-bolt',
    title = 'Menu',
    onCategorySelect = () => { },
    onSubCategorySelect = () => { },
}) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [displayProduct, setDisplayProduct] = useState([]);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const slideAnim = useRef(new Animated.Value(-50)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Initialize with default category and products
    useEffect(() => {
        if (categories.length > 0) {
            const allCategory = categories.find(cat => cat.id === 'all') || categories[0];
            setSelectedCategory(allCategory);

            if (allCategory.id === 'all') {
                setDisplayProduct(allProducts);
            } else {
                const filteredProducts = allProducts.filter(product => product.cs_id === allCategory.id);
                setDisplayProduct(filteredProducts);
            }

            // Run initial animation
            runAnimation();
        }
    }, [categories, allProducts]);

    const runAnimation = useCallback(() => {
        // Reset animations
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.95);
        slideAnim.setValue(-50);
        rotateAnim.setValue(0);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, scaleAnim, slideAnim, rotateAnim]);

    // Handler for category selection
    const handleCategoryPress = useCallback((category) => {
        // Call the parent component's onCategorySelect callback
        onCategorySelect(category);

        // Update the selected category
        setSelectedCategory(category);

        // Filter products based on the selected category
        if (category.id === 'all') {
            setDisplayProduct(allProducts);
        } else {
            const filteredProducts = allProducts.filter(product => product.cs_id === category.id);
            setDisplayProduct(filteredProducts);
        }

        // Run animation for the category change
        runAnimation();
    }, [allProducts, onCategorySelect, runAnimation]);

    // Handler for product selection
    const handleProductPress = useCallback((product) => {
        // Call the parent component's onSubCategorySelect callback with the product
        onSubCategorySelect(product);

        // Add bounce animation on press
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            })
        ]).start();
    }, [onSubCategorySelect, scaleAnim]);

    const renderCategoryItem = useCallback(({ item }) => (
        <Pressable
            style={[
                styles.categoryItem,
                selectedCategory?.id === item.id && styles.selectedCategory,
                { borderRightColor: theme.primary }
            ]}
            onPress={() => handleCategoryPress(item)}
        >
            <Image
                source={
                    item.id === 'all'
                        ? require('../../Assets/banner1.jpeg')
                        : { uri: `${baseURL}/Category_sub/${item.image}` }
                }
                style={styles.categoryImage}
                resizeMode="cover"
            />
            <Text style={[
                styles.categoryText,
                { color: theme.text },
                selectedCategory?.id === item.id && {
                    color: theme.selectedText,
                    fontWeight: 'bold'
                }
            ]}>
                {item.name}
            </Text>
        </Pressable>
    ), [selectedCategory, theme, handleCategoryPress]);

    const renderProductItem = useCallback(({ item }) => {
        const rotateValue = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['10deg', '0deg']
        });

        return (
            <Animated.View
                style={[
                    styles.productCard,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateX: slideAnim },
                            { rotate: rotateValue }
                        ]
                    }
                ]}
            >
                <Pressable onPress={() => handleProductPress(item)} style={styles.productPressable}>
                    {/* Product Image */}
                    <Image
                        source={{ uri: `${baseURL}/Product_image/${item.img_1}` }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />

                    {/* Product Info */}
                    <View style={styles.productInfo}>
                        {/* Product Name */}
                        <Text style={styles.productName}>
                            {item.name.length > 20 ? item.name.slice(0, 20).concat('...') : item.name}
                        </Text>

                        {/* Pricing Section */}
                        <View style={styles.priceSection}>
                            <Text style={styles.regularPrice}>₹{item.regular_price}</Text>
                            <Text style={styles.sellingPrice}>₹{item.selling_price}</Text>
                        </View>

                        {/* Rating Section */}
                        <View style={styles.ratingContainer}>
                            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>{item.rating} / 5</Text>
                        </View>

                        {/* Action Buttons: Add to Cart & Wishlist */}
                        <View style={styles.actionButtons}>
                            <Pressable style={styles.addToCartButton}>
                                <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                                <Text style={styles.buttonText}>Add to Cart</Text>
                            </Pressable>

                            <Pressable style={styles.wishlistButton}>
                                <MaterialCommunityIcons name="heart" size={18} color="#2874F0" />
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }, [fadeAnim, scaleAnim, slideAnim, rotateAnim, handleProductPress]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <View style={[styles.categoriesContainer, {
                    backgroundColor: '#f8f9fa',
                    borderRightColor: theme.border
                }]}>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <View style={styles.subCategoriesContainer}>
                    {selectedCategory ? (
                        <>
                            <Text style={[styles.selectedCategoryTitle, { color: theme.text }]}>
                                {selectedCategory.name}
                            </Text>
                            {displayProduct.length > 0 ? (
                                <FlatList
                                    data={displayProduct}
                                    renderItem={renderProductItem}
                                    keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                                    numColumns={2}
                                    showsVerticalScrollIndicator={false}
                                />
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <MaterialCommunityIcons
                                        name="information-outline"
                                        size={48}
                                        color="#BDBDBD"
                                    />
                                    <Text style={styles.placeholderText}>
                                        No products available in this category
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <MaterialCommunityIcons
                                name="gesture-tap"
                                size={48}
                                color="#BDBDBD"
                            />
                            <Text style={styles.placeholderText}>
                                Select a category to explore
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    categoriesContainer: {
        width: '22%',
        borderRightWidth: 1,
    },
    subCategoriesContainer: {
        flex: 1,
        padding: 3,
    },
    categoryItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    selectedCategory: {
        backgroundColor: '#fff',
        borderRightWidth: 4,
    },
    categoryText: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 4,
    },
    categoryImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        alignSelf: 'center',
    },
    selectedCategoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subCategoryItem: {
        backgroundColor: '#f2f2f2',
        flex: 1,
        alignItems: 'center',
        margin: 5,
        padding: 12,
    },
    subCategoryImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        marginBottom: 8,
    },
    subCategoryText: {
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '400',
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 4,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9e9e9e',
        textAlign: 'center',
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        margin: 2,
        flex: 1,
        alignItems: 'center',
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productPressable: {
        width: '100%',
        alignItems: 'center',
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginBottom: 5,
    },
    productInfo: {
        alignItems: 'center',
        width: '100%',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#424242',
        textAlign: 'center',
        marginBottom: 6,
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    regularPrice: {
        fontSize: 12,
        color: '#9E9E9E',
        textDecorationLine: 'line-through',
        marginRight: 5,
    },
    sellingPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2874F0',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    ratingText: {
        fontSize: 12,
        color: '#424242',
        marginLeft: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5,
    },
    addToCartButton: {
        flexDirection: 'row',
        backgroundColor: '#2874F0',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 12,
        color: '#fff',
        marginLeft: 3,
    },
    wishlistButton: {
        backgroundColor: '#F0F0F0',
        padding: 5,
        borderRadius: 8,
        marginLeft: 8,
    },
});

export default MenuComponent;