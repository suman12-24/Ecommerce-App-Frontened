import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Animated, Dimensions, StatusBar, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance, { baseURL } from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import appNameController from './Model/appNameController';
import SearchBarComponent from './Components/SearchBarComponent';
import { Translation, useTranslation } from 'react-i18next';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.28;

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
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isLoading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading]);

    return (
        <View style={[styles.imageContainer, { width: style.width, height: style.height, borderRadius: style.borderRadius }]}>
            {isLoading && (
                <View style={[styles.loaderContainer, { width: style.width, height: style.height }]}>
                    <ActivityIndicator size="small" color={appNameController.activityIndicatorColor} />
                </View>
            )}
            <Animated.Image
                source={source}
                style={[style, { opacity: fadeAnim }]}
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
                height={80}
                style={{ borderRadius: 16 }}
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
                width={100}
                height={100}

                style={{
                    marginTop: 5,
                    borderRadius: 20, marginBottom: 5,
                    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
                }}
            />
            <ShimmerPlaceholder
                width={100}
                height={16}
                style={{ borderRadius: 4, marginBottom: 4, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', }}
            />
            <ShimmerPlaceholder
                width={70}
                height={14}
                style={{
                    borderRadius: 4, justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
                    marginBottom: 5
                }}
            />
        </View>
    );
};

const CategoryScreen = () => {
    const {t}=useTranslation();
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
    const [error, setError] = useState(null);
    const scrollViewRef = useRef(null);

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

    const handleCategoryPress = (category, index) => {
        setSelectedCategory(category);
        fetchSubCategories(category.id);

        // Scroll to the selected category
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                y: index * 100,
                animated: true,
            });
        }

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
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor('transparent');
            StatusBar.setTranslucent(true);
        }
    }, []);

    // Render the main UI with shimmer placeholders during loading states
    return (
        <>
          <StatusBar 
                barStyle="light-content"
                translucent={false}
                backgroundColor={appNameController.statusBarColor}
                />
        <View style={styles.container}>
        <SearchBarComponent/>
            <View style={styles.contentContainer}>
            
                {/* Left Panel - Categories */}
                <View style={styles.leftPanel}>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.categoryList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
                    >
                        {isLoading ? (
                            // Render category shimmer placeholders during loading
                            Array.from({ length: 8 }).map((_, index) => (
                                <CategoryPlaceholder key={`category-placeholder-${index}`} />
                            ))
                        ) : (
                            // Render actual categories when loaded
                            categories.map((category, index) => (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    key={category.id}
                                    style={[
                                        styles.categoryItem,
                                        selectedCategory?.id === category.id && styles.selectedCategory
                                    ]}
                                    onPress={() => handleCategoryPress(category, index)}
                                >
                                    <View style={[
                                        styles.categoryImageContainer,
                                        selectedCategory?.id === category.id && styles.selectedCategoryImageContainer
                                    ]}>
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
                    </ScrollView>
                </View>

                {/* Right Panel - Subcategories */}
                <View style={styles.rightPanel}>
                    <LinearGradient
                        colors={['#edf8f8', '#edf8f8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.subcategoryHeader}
                    >
                        <Text style={styles.subcategoryHeaderText}>
                            {!isLoading && selectedCategory ? selectedCategory.name : `${t('subCat')}`}
                        </Text>
                    </LinearGradient>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.subcategoryGridContainer}
                    >
                        {isLoading || isLoadingSubCategories ? (
                            // Render subcategory shimmer placeholders during loading
                            <View style={styles.subcategoryGridContainer}>
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <SubcategoryPlaceholder key={`subcategory-placeholder-${index}`} />
                                ))}
                            </View>
                        ) : subCategories.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <Image
                                    // source={require('../assets/empty-box.png')} // Add this image to your assets
                                    style={styles.emptyStateImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.emptyStateText}>{t('noSubcatFound')}</Text>
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
                                        <LinearGradient
                                            colors={['transparent', 'transparent']}
                                            style={styles.subcategoryGradient}
                                        />
                                    </View>
                                    <Text style={styles.subcategoryText} numberOfLines={2}>
                                        {subcategory.name}
                                    </Text>
                                    <View style={styles.subcategoryBadge}>
                                        <Text style={styles.subcategoryBadgeText}>{t('explore')}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>

            {/* Error dialog if needed */}
            {error && (
                <View style={styles.errorContainer}>
                    <View style={styles.errorDialog}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={fetchCategories}
                        >
                            <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
        </>
    );
};

export default CategoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
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
        color: appNameController.textColor
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10,
    },
    errorDialog: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
        backgroundColor: appNameController.activityIndicatorColor,
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
        width: '30%',
        backgroundColor: appNameController.selectedCategoryBackgroundColor,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    rightPanel: {
        width: '70%',
        backgroundColor: '#f8fafc',
    },
    categoryList: {
        flex: 1,
    },
    categoryItem: {
        padding: 5,
        alignItems: 'center',
        marginHorizontal: 5,
        marginVertical: 5,
        borderRadius: 16,
    },
    selectedCategory: {
        backgroundColor: '#fff'
    },
    categoryImageContainer: {
        backgroundColor: '#f1f5f9',
        padding: 5,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    selectedCategoryImageContainer: {
        backgroundColor: '#fff'
    },
    categoryImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 13,
        marginTop: 5,
        textAlign: 'center',
        color: '#334155',
        fontWeight: '500',
    },
    selectedCategoryText: {
        color: appNameController.subCategoryTextColor,
        fontWeight: '700',
    },
    subcategoryHeader: {
        padding: 10,
        borderBottomWidth: 0.4,
        borderBottomColor: '#e2e8f0',
    },
    subcategoryHeaderText: {
        fontSize: 18,
        fontWeight: '700',
        color: appNameController.subCategoryTextColor,
        textAlign: 'center',
    },
    subcategoryGridContainer: {
        padding: 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    subcategoryCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    subcategoryImageContainer: {
        height: 130,
        position: 'relative',
    },
    subcategoryImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
       
    },
    subcategoryGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
    },
    subcategoryText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#334155',
        fontWeight: '600',
        padding: 8,
        paddingBottom: 40,
    },
    subcategoryBadge: {
        position: 'absolute',
        bottom: 5,
        left: 10,
        right: 10,
        backgroundColor: appNameController.statusBarColor,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 20,
        alignItems: 'center',
    },
    subcategoryBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateImage: {
        width: 120,
        height: 120,
        marginBottom: 16,
        opacity: 0.7,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
});