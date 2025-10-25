import { StyleSheet, Text, View, FlatList, Pressable, Animated, Image } from 'react-native';
import React, { useState, useRef } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
const MenuScreen = () => {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    const menuCategories = [
        {
            id: 1,
            name: 'Featured Electronics',
            subCategories: [
                { name: 'New Arrivals', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Best Sellers', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Deals', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
            ],
        },

        {
            id: 2,
            name: 'Computers',
            subCategories: [
                { name: 'Laptops', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Desktop PCs', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Computer Parts', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
            ],
        },

        {
            id: 3,
            name: 'Mobile Devices',
            subCategories: [
                { name: 'Smartphones', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Tablets', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Accessories', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
            ],
        },

        {
            id: 4,
            name: 'Gaming',
            subCategories: [
                { name: 'Consoles', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Video Games', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Gaming Accessories', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
            ],
        },

        {
            id: 5,
            name: 'Home Electronics',
            subCategories: [
                { name: 'TVs', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Audio Systems', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
                { name: 'Smart Home', image: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' },
            ],
        },
    ];
    const handleCategoryPress = (category) => {
        setSelectedCategory(category);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();
    };

    const renderCategoryItem = ({ item }) => (
        <Pressable
            style={[
                styles.categoryItem,
                selectedCategory?.id === item.id && styles.selectedCategory,
            ]}
            onPress={() => handleCategoryPress(item)}
        >
            <Text style={[
                styles.categoryText,
                selectedCategory?.id === item.id && styles.selectedCategoryText
            ]}>
                {item.name}
            </Text>
        </Pressable>
    );

    const renderSubCategoryItem = ({ item }) => (
        <Animated.View
            style={[
                styles.subCategoryItem,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.subCategoryImage}
                resizeMode="cover"
                onError={(e) => e.target.setNativeProps({ src: 'https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg' })} // Fallback image
            />
            <Text style={styles.subCategoryText}>{item.name}</Text>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('electroStore')}</Text>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#2874F0" />
            </View>

            <View style={styles.content}>
                {/* Left Panel - Categories */}
                <View style={styles.categoriesContainer}>
                    <FlatList
                        data={menuCategories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                {/* Right Panel - Subcategories */}
                <View style={styles.subCategoriesContainer}>
                    {selectedCategory ? (
                        <>
                            <Text style={styles.selectedCategoryTitle}>
                                {selectedCategory.name}
                            </Text>
                            <FlatList
                                data={selectedCategory.subCategories}
                                renderItem={renderSubCategoryItem}
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={3}
                                columnWrapperStyle={styles.columnWrapper}
                                showsVerticalScrollIndicator={false}
                            />
                        </>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <MaterialCommunityIcons
                                name="gesture-tap"
                                size={48}
                                color="#BDBDBD"
                            />
                            <Text style={styles.placeholderText}>{t('selectCategoty')}</Text>
                        </View>
                    )}
                </View>
            </View>

        </View>
    );
};

export default MenuScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2874F0',
        marginRight: 8,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    categoriesContainer: {
        width: '25%',
        backgroundColor: '#f8f9fa',
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
    },
    subCategoriesContainer: {
        width: '70%',
        padding: 16,
    },
    categoryItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    selectedCategory: {
        backgroundColor: '#fff',

        borderRightWidth: 4,
        borderRightColor: '#2874F0',
    },
    categoryText: {
        fontSize: 15,
        color: '#424242',
    },
    selectedCategoryText: {
        color: '#2874F0',
        fontWeight: 'bold',
    },
    selectedCategoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 16,
    },
    subCategoryItem: {
        width: '30%',
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
        color: '#424242',
        fontWeight: '500',
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

});

// in this code, make the page with full of content and the right panel with the subcategories and the left panel with the categories..
// and also implement some modern animation 