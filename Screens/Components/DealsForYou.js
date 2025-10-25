import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axiosInstance, { baseURL } from '../../Axios_BaseUrl_Token_SetUp/axiosInstance';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
const ShimmerPlaceholder = ({ width, height, style }) => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
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

const DealsForYou = () => {
    const [favorites, setFavorites] = useState({});
    const [products, setProducts] = useState([]);
    const {t}=useTranslation();
    const[banner,setBanner]=useState({});
  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

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
            const response = await axiosInstance.get('/Suhani-Electronics-Backend/f_product_group.php');
    
            if (response.data?.success && response.data?.data?.[0]?.products || response.data?.data?.[0]?.tag_group) {
                // Transforming products
                const transformedProducts = response.data.data[0].products.map(item => ({
                    id: item.id,
                    image: `${baseURL}/Product_image/${item.img_1}`,
                    title: item.name,
                    price: `₹${item.selling_price.toLocaleString()}`,
                    originalPrice: `₹${item.regular_price.toLocaleString()}`,
                    discount: calculateDiscount(item.regular_price, item.selling_price),
                    description: parseDescription(item.description),
                    rating: parseFloat(item.rating),
                    stock: parseInt(item.stock),
                    date: item.date
                }));
                setProducts(transformedProducts);
    
                // Handling tag_group as an object
                const tagGroup = response.data.data[0].tag_group;
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
    

    const calculateDiscount = (regular, selling) => {
        const regularPrice = parseFloat(regular);
        const sellingPrice = parseFloat(selling);
        if (regularPrice > sellingPrice) {
            const discount = ((regularPrice - sellingPrice) / regularPrice) * 100;
            return `${Math.round(discount)}% Off`;
        }
        return null;
    };

    const parseDescription = (description) => {
        try {
            const parsedDesc = JSON.parse(description);
            return Object.keys(parsedDesc)[0] || '';
        } catch (e) {
            return description;
        }
    };

    const toggleFavorite = (id) => {
        setFavorites((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleAddToCart = (product) => {
        
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
            <Text style={styles.header}>{banner.title}</Text>
  
            <FlatList
                data={products}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate('ProductDetailsScreen', { item })}
                        style={styles.card}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.productImage}
                        />
                        {item.discount && (
                            <View style={styles.discountSticker}>
                                <Text style={styles.discountText}>{item.discount}</Text>
                            </View>
                        )}
                        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.productPrice}>{item.price}</Text>
                            {item.originalPrice !== item.price && (
                                <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                            )}
                        </View>
                        <View style={styles.ratingContainer}>
                            {renderStars(item.rating)}
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.addToCartButton}
                                onPress={() => handleAddToCart(item)}
                            >
                                <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                                <Text style={styles.buttonText}>{t('addToCart')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => toggleFavorite(item.id)}
                                style={styles.favoriteIcon}
                            >
                                <FontAwesome
                                    name={favorites[item.id] ? 'heart' : 'heart-o'}
                                    size={24}
                                    color={favorites[item.id] ? 'red' : 'gray'}
                                />
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
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
        height: 150,
        resizeMode: 'contain',
    },
    discountSticker: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'red',
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
        backgroundColor: '#0fbd9a',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    buttonText: {
        paddingLeft: 5,
        color: '#fff',
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
        height: 150,  // Adjust this value based on your needs
        borderRadius: 8,
    },
});

export default DealsForYou;

