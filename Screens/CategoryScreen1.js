import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Animated, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance, { baseURL } from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// Shimmer component for reusability
const ShimmerPlaceholder = ({ width, height, style }) => {
    const shimmerAnimated = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.timing(shimmerAnimated, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        );
        shimmerAnimation.start();

        return () => {
            shimmerAnimation.stop();
        };
    }, []);

    const translateX = shimmerAnimated.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <View
            style={[
                { width, height, backgroundColor: '#E0E0E0', overflow: 'hidden' },
                style,
            ]}
        >
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
                    style={{ width: '200%', height: '100%' }}
                />
            </Animated.View>
        </View>
    );
};

// Image component with loading indicator
const LoadingImage = ({ source, style, resizeMode }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <View style={[styles.imageContainer, { width: style.width, height: style.height, borderRadius: style.borderRadius }]}>
            {isLoading && (
                <View style={[styles.loaderContainer, { width: style.width, height: style.height }]}>
                    <ActivityIndicator size="small" color="#6366f1" />
                </View>
            )}
            <Image
                source={source}
                style={[style, { opacity: isLoading ? 0 : 1 }]}
                resizeMode={resizeMode || 'cover'}
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
            />
        </View>
    );
};

// Category placeholder during loading
const CategoryPlaceholder = () => {
    return (
        <View style={styles.categoryItem}>
            <ShimmerPlaceholder
                width={80}
                height={60}
                style={{ borderRadius: 10 }}
            />
            <ShimmerPlaceholder
                width={70}
                height={15}
                style={{ borderRadius: 4, marginTop: 8 }}
            />
        </View>
    );
};

// Subcategory placeholder during loading
const SubcategoryPlaceholder = () => {
    return (
        <View style={styles.subcategoryCard}>
            <ShimmerPlaceholder
                width={80}
                height={80}
                style={{ borderRadius: 12, marginBottom: 8 }}
            />
            <ShimmerPlaceholder
                width={100}
                height={14}
                style={{ borderRadius: 4, marginBottom: 4 }}
            />
            <ShimmerPlaceholder
                width={70}
                height={14}
                style={{ borderRadius: 4 }}
            />
        </View>
    );
};

const CategoryScreen = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
    const [error, setError] = useState(null);

    // Fetch functions remain the same...
    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/Suhani-Electronics-Backend/f_category.php');
            if (response.data?.success) {
                setCategories(response.data.data);
                if (response.data.data.length > 0) {
                    const firstCategory = response.data.data[0];
                    setSelectedCategory(firstCategory);
                    fetchSubCategories(firstCategory.id);
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            setIsLoadingSubCategories(true);
            const response = await axiosInstance.get(`/Suhani-Electronics-Backend/f_product_category_main_s.php?cm_id=${categoryId}`);
            if (response.data?.success) {
                setSubCategories(response.data.data);
            } else {
                throw new Error('Failed to fetch subcategories');
            }
        } catch (err) {
            console.error('Error fetching subcategories:', err);
            setError('Failed to load subcategories');
        } finally {
            setIsLoadingSubCategories(false);
        }
    };

    const handleCategoryPress = (category) => {
        setSelectedCategory(category);
        fetchSubCategories(category.id);
    };

    const handleSubcategoryPress = (subcategory) => {
        navigation.navigate('ProductListingScreen', {
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
            categoryId: selectedCategory.id
        });
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    // Render the main UI with shimmer placeholders during loading states
    return (
        <View style={styles.container}>
            {/* Left Panel - Categories */}
            <View style={styles.leftPanel}>
                <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                    {isLoading ? (
                        // Render category shimmer placeholders during loading
                        Array.from({ length: 6 }).map((_, index) => (
                            <CategoryPlaceholder key={`category-placeholder-${index}`} />
                        ))
                    ) : (
                        // Render actual categories when loaded
                        categories.map((category) => (
                            <TouchableOpacity
                                activeOpacity={1}
                                key={category.id}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory?.id === category.id && styles.selectedCategory
                                ]}
                                onPress={() => handleCategoryPress(category)}
                            >
                                <View style={styles.categoryImageContainer}>
                                    <LoadingImage
                                        source={{ uri: `${baseURL}/Category_main/${category.logo}` }}
                                        style={styles.categoryImage}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory?.id === category.id && styles.selectedCategoryText
                                    ]}
                                    numberOfLines={2}
                                >
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}

                    <View style={{ height: 50 }} />
                </ScrollView>
            </View>

            {/* Right Panel - Subcategories */}
            <View style={styles.rightPanel}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#6366f1', padding: 8, textAlign: 'center' }}>
                    {!isLoading && subCategories.length > 0 ? selectedCategory.name : 'Subcategories'}
                </Text>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.subcategoryGridContainer}
                >
                    {isLoading || isLoadingSubCategories ? (
                        // Render subcategory shimmer placeholders during loading
                        <View style={styles.subcategoryGridContainer}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <SubcategoryPlaceholder key={`subcategory-placeholder-${index}`} />
                            ))}
                        </View>
                    ) : (
                        // Render actual subcategories when loaded
                        subCategories.map((subcategory) => (
                            <TouchableOpacity
                                key={subcategory.id}
                                style={styles.subcategoryCard}
                                onPress={() => handleSubcategoryPress(subcategory)}
                            >
                                <View style={styles.subcategoryImageContainer}>
                                    <LoadingImage
                                        source={{
                                            uri: `${baseURL}/Category_sub/${subcategory.logo}`
                                        }}
                                        style={styles.subcategoryImage}
                                    />
                                </View>
                                <Text style={styles.subcategoryText} numberOfLines={2}>
                                    {subcategory.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Error dialog if needed */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchCategories}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default CategoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6366f1',
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 10,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#6366f1',
        borderRadius: 12,
        elevation: 2,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Image loading styles
    imageContainer: {
        position: 'relative',
        overflow: 'hidden',
    },
    loaderContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        zIndex: 1,
    },

    leftPanel: {
        marginTop: 15,
        width: '30%',
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    rightPanel: {
        width: '70%',
        backgroundColor: '#fff',
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    categoryList: {
        flex: 1,
    },
    categoryItem: {
        padding: 3,
        alignItems: 'center',
        marginHorizontal: 5,
        marginVertical: 4,
        borderRadius: 12,
    },
    categoryImageContainer: {
        backgroundColor: '#f1f5f9',
        padding: 1,
        borderRadius: 12,
    },
    categoryImage: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        borderRadius: 7,
    },
    selectedCategory: {
        backgroundColor: '#e0e7ff',
    },
    categoryText: {
        fontSize: 15,
        marginLeft: 10,
        color: '#334155',
    },
    selectedCategoryText: {
        color: '#4f46e5',
        fontWeight: '600',
    },

    subcategoryGridContainer: {
        paddingLeft: 5,
        paddingRight: 7,
        justifyContent: 'space-between',
        alignContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    subcategoryCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
        marginBottom: 8,
    },
    subcategoryImageContainer: {
        backgroundColor: '#f1f5f9',
        padding: 10,
        borderRadius: 12,
        marginBottom: 8,
    },
    subcategoryImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        resizeMode: 'center',
    },
    subcategoryText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#334155',
        fontWeight: '500',
    },
});