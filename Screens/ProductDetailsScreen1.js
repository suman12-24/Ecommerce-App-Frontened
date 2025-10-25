import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Share, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather'
const { width, height } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const [isFavorite, setIsFavorite] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    const toggleFavorite = () => setIsFavorite(!isFavorite);
    const toggleDescription = () => setShowFullDescription(!showFullDescription);

    const shareProduct = async () => {
        try {
            await Share.share({
                message: `Check out this product on Flipkart: ${item.name}\nPrice: ₹${item.price}\n${item.description}`,
            });
        } catch (error) {
            console.log('Error sharing product:', error);
        }
    };

    return (
        <View style={{
            flex: 1, backgroundColor: '#fff',
        }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 80, }}>
                {/* Image Section */}
                <View style={{
                    height: width,
                    backgroundColor: '#f7f7f7', position: 'relative',
                }}>
                    <Image source={{ uri: item.image }} style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain',
                    }} />
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 15,
                            left: 10,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            borderRadius: 20,
                            padding: 8,
                        }}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={{
                        position: 'absolute',
                        top: 15,
                        right: 20,
                        gap: 10,
                    }}>
                        <TouchableOpacity onPress={toggleFavorite} style={styles.iconButton}>
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorite ? "#ff1a1a" : "#000"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={shareProduct} style={styles.iconButton}>
                            <Ionicons name="share-social-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Product Impressions */}
                <View style={{
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#e6e6ff',
                    padding: 12
                }}>
                    <Text style={{
                        fontSize: 15,
                        color: '#404040',
                        fontWeight: '400',
                    }}>430 people ordered in the last 30 days</Text>
                </View>
                {/* Product Info */}
                <View style={{ padding: 16 }}>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: '500',
                        marginBottom: 8,
                        color: '#212121',
                    }}>{item.title}</Text>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginVertical: 8,
                    }}>
                        <View style={{
                            backgroundColor: '#26a541',
                            borderRadius: 4,
                            paddingVertical: 2,
                            paddingHorizontal: 6,
                        }}>
                            <Text style={{
                                color: '#fff',
                                fontSize: 14,
                                fontWeight: '500',
                            }}>4.5 ★</Text>
                        </View>
                        <Text style={{
                            color: '#757575',
                            fontSize: 14,
                        }}>12,345 Ratings</Text>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        marginVertical: 8,
                    }}>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#212121',
                        }}>₹{item.price}</Text>
                        <Text style={{
                            fontSize: 16,
                            color: '#757575',
                            textDecorationLine: 'line-through',
                        }}>₹{item.originalPrice}</Text>
                        <Text style={{
                            fontSize: 16,
                            color: '#26a541',
                            fontWeight: '500',
                        }}>{item.discount}% off</Text>
                    </View>
                    <Text style={{
                        color: '#26a541',
                        fontSize: 14,
                        marginVertical: 8,
                    }}>Bank OfferExtra ₹500 discount on HDFC Bank Credit Cards</Text>
                    {/* Delivery Info */}
                    <View style={{
                        flexDirection: 'row',
                        gap: 12,
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderTopWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: '#eee',
                        marginVertical: 12,
                    }}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 14,
                                color: '#212121',
                            }}>Delivery by 3 Jul, Thursday</Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#26a541',
                            }}>Free Delivery</Text>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginVertical: 10,
                        paddingHorizontal: 4,
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#212121',
                        }}>Deliver to: Kolkata - 700123</Text>
                        <TouchableOpacity style={{
                            paddingVertical: 5,
                            paddingHorizontal: 10,
                            backgroundColor: '#2874f0',
                            borderRadius: 20,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                color: '#fff',
                            }}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Description with Read More */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text
                            style={{
                                fontSize: 14,
                                color: '#616161',
                                lineHeight: 20,
                            }}
                            numberOfLines={showFullDescription ? undefined : 3}
                        >
                            {item.description}
                        </Text>
                        <TouchableOpacity onPress={toggleDescription}>
                            <Text style={styles.readMore}>
                                {showFullDescription ? 'Read Less' : 'Read More'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Specifications */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Specifications</Text>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Brand</Text>
                            <Text style={styles.specValue}>{item.brand}</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Color</Text>
                            <Text style={styles.specValue}>{item.color}</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Category</Text>
                            <Text style={styles.specValue}>{item.category}</Text>
                        </View>
                    </View>

                    {/* 7 Days Replacement and Cash on Delivery */}
                    <View style={{
                        marginVertical: 8,
                        flexDirection: 'row',
                        backgroundColor: '#f2f2f2',
                        paddingTop: 12,
                        paddingBottom: 12
                    }}>
                        <View style={styles.infoRow}>
                            <Ionicons name="refresh-outline" size={24} color="#26a541" />
                            <Text style={styles.infoText}>7 Days Replacement</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="cash-outline" size={24} color="#26a541" />
                            <Text style={styles.infoText}>Cash on Delivery</Text>
                        </View>
                    </View>

                    {/* Customer Reviews */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Customer Reviews</Text>
                        <View style={styles.reviewContainer}>
                            <Text style={styles.reviewText}>"Great product, highly recommend!"</Text>
                            <Text style={styles.reviewAuthor}>- John Doe</Text>
                        </View>
                        <View style={styles.reviewContainer}>
                            <Text style={styles.reviewText}>"Good value for money. Satisfied with the purchase."</Text>
                            <Text style={styles.reviewAuthor}>- Jane Smith</Text>
                        </View>
                        <Text style={styles.readMore}>See all reviews</Text>
                    </View>

                    {/* Similar Products */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Similar Products</Text>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            {/* You can create a map for similar products */}
                            <View style={styles.similarProductContainer}>
                                <Image source={{ uri: item.image }} style={styles.similarProductImage} />
                                <Text style={styles.similarProductName}>Product 1</Text>
                            </View>
                            <View style={styles.similarProductContainer}>
                                <Image source={{ uri: item.image }} style={styles.similarProductImage} />
                                <Text style={styles.similarProductName}>Product 2</Text>
                            </View>
                            <View style={styles.similarProductContainer}>
                                <Image source={{ uri: item.image }} style={styles.similarProductImage} />
                                <Text style={styles.similarProductName}>Product 3</Text>
                            </View>
                        </ScrollView>
                    </View>

                    {/* FAQ Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                        <View style={styles.faqContainer}>
                            <Text style={styles.faqQuestion}>Q: Is this product durable?</Text>
                            <Text style={styles.faqAnswer}>A: Yes, the product is made of high-quality materials and is built to last.</Text>
                        </View>
                        <View style={styles.faqContainer}>
                            <Text style={styles.faqQuestion}>Q: Can I return this item?</Text>
                            <Text style={styles.faqAnswer}>A: Yes, you can return the item within 30 days if you're not satisfied.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Footer Buttons */}
            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                flexDirection: 'row',
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderColor: '#eee',
                paddingVertical: 8,
                paddingHorizontal: 30,
            }}>
                <TouchableOpacity
                    style={[styles.footerButton, styles.addToCart]}
                    onPress={() => alert('Added to Cart')}
                >
                    <View style={styles.footerButtonText}>
                        <Ionicons name="cart-outline" size={22} color="#000" style={styles.iconStyle} />
                        <Text style={styles.buttonText}>Add to Cart</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.footerButton, styles.buyNow]}
                    onPress={() => navigation.navigate('OrderSummaryPage')}
                >
                    <View style={styles.footerButtonText}>
                        <Feather name="shopping-bag" size={22} color="#000" style={styles.iconStyle} />
                        <Text style={styles.buttonText}>Buy Now</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding: 8,
    },
    section: {
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#212121',
        marginBottom: 8,
    },
    readMore: {
        color: '#2874f0',
        fontSize: 14,
        marginTop: 4,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    specLabel: {
        color: '#616161',
        fontSize: 14,
    },
    specValue: {
        color: '#212121',
        fontSize: 14,
        fontWeight: '500',
    },

    footerButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    addToCart: {
        backgroundColor: '#fed813',
        marginRight: 20,
        borderRadius: 50,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buyNow: {
        backgroundColor: '#ffa51d',
        borderRadius: 50,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '400',
        color: '#000',
    },
    footerButtonText: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconStyle: {
        marginRight: 8,
    },
    reviewContainer: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    reviewText: {
        fontSize: 14,
        color: '#616161',
    },
    reviewAuthor: {
        fontSize: 12,
        color: '#999',
    },
    similarProductContainer: {
        marginRight: 20,
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
    },
    similarProductImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    similarProductName: {
        fontSize: 14,
        color: '#212121',
    },
    faqContainer: {
        marginVertical: 8,
    },
    faqQuestion: {
        fontSize: 14,
        color: '#212121',
        fontWeight: 'bold',
    },
    faqAnswer: {
        fontSize: 14,
        color: '#616161',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 8
    },
    infoText: {
        fontSize: 15,
        color: '#212121',
        fontWeight: '500'
    },

});

export default ProductDetailsScreen;

