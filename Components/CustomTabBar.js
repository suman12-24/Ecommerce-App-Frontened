import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    interpolate,
    runOnJS
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const ICON_SIZE = 22;
const CIRCLE_SIZE = ICON_SIZE + 16;
const STAR_SIZE = 17;

// Star component for the animation
const AnimatedStar = ({ delay, duration, centerX }) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(1);
    const rotate = useSharedValue(0);

    useEffect(() => {
        const randomX = Math.random() * 90 - 30; // Random value between -30 and 30

        // Animation sequence
        scale.value = withSequence(
            withTiming(0, { duration: 0 }),
            withDelay(delay, withTiming(1, { duration: duration * 0.3 })),
            withDelay(duration * 0.6, withTiming(0, { duration: duration * 0.1 }))
        );

        translateY.value = withDelay(
            delay,
            withTiming(-60, { duration: duration })
        );

        translateX.value = withDelay(
            delay,
            withTiming(randomX, { duration: duration })
        );

        rotate.value = withDelay(
            delay,
            withTiming(Math.random() * 360, { duration: duration })
        );
    }, [delay, duration]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { translateX: translateX.value },
                { scale: scale.value },
                { rotate: `${rotate.value}deg` }
            ],
            opacity: scale.value,
            position: 'absolute',
            left: centerX - STAR_SIZE / 2,
            bottom: 40, // Position above the tab
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            <Ionicons name="star" size={STAR_SIZE} color="#FFD700" />
        </Animated.View>
    );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { t } = useTranslation();
    const translateX = useSharedValue(0);
    const [tabLayouts, setTabLayouts] = useState([]);
    const [showStars, setShowStars] = useState(false);
    const [cartTabLayout, setCartTabLayout] = useState(null);

    const iconScales = useRef(state.routes.map(() => useSharedValue(1))).current;
    const iconRotations = useRef(state.routes.map(() => useSharedValue(0))).current;
    const cartBounce = useSharedValue(1);

    // 🛒 Get cart items count from Redux
    const cartItems = useSelector((state) => state.cart.items);
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // For tracking previous cart count to detect changes
    const prevCartCountRef = useRef(cartCount);

    // ❤️ Get wishlist count from Redux
    const wishList = useSelector((state) => state.wishList);
    const wishListCount = wishList.length;

    // Create star animation when cart count changes
    useEffect(() => {
        if (cartCount > prevCartCountRef.current) {
            cartBounce.value = withSequence(
                withTiming(1.4, { duration: 150 }),
                withTiming(1, { duration: 150 })
            );

            // Trigger star animation
            setShowStars(true);
            setTimeout(() => {
                setShowStars(false);
            }, 1500); // Animation duration plus a bit extra
        }
        prevCartCountRef.current = cartCount;
    }, [cartCount]);

    React.useEffect(() => {
        const selectedTabLayout = tabLayouts[state.index];
        if (selectedTabLayout) {
            translateX.value = selectedTabLayout.x + selectedTabLayout.width / 2 - CIRCLE_SIZE / 2;
        }

        iconScales.forEach((scale, index) => {
            scale.value = withSpring(state.index === index ? 1.2 : 1, { damping: 15 });
        });

        iconRotations.forEach((rotation, index) => {
            if (state.index === index) {
                rotation.value = withSpring(1);

                setTimeout(() => {
                    rotation.value = withTiming(0, { duration: 300 });
                }, 300);
            }
        });
    }, [state.index, tabLayouts]);

    const handleTabLayout = (e, index, routeName) => {
        const { x, width, y, height } = e.nativeEvent.layout;
        setTabLayouts((prevLayouts) => {
            const newLayouts = [...prevLayouts];
            newLayouts[index] = { x, width };
            return newLayouts;
        });

        // Store cart button position and dimensions for star animation
        if (routeName === 'Cart') {
            setCartTabLayout({ x, width, y, height, centerX: x + width / 2 });
        }
    };

    // Generate random stars for animation
    const renderStars = () => {
        if (!showStars || !cartTabLayout) return null;

        return Array.from({ length: 8 }).map((_, index) => (
            <AnimatedStar
                key={index}
                delay={index * 50}
                duration={800}
                centerX={cartTabLayout.centerX}
            />
        ));
    };

    const cartIconAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: cartBounce.value }],
        };
    });

    return (
        <View style={styles.floatingContainer}>
            <LinearGradient
                colors={['#0baf9a', '#0ba893']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.tabBarContainer}
            >
                <Animated.View
                    style={[
                        styles.circleIndicator,
                        useAnimatedStyle(() => ({
                            transform: [{ translateX: translateX.value }],
                        })),
                    ]}
                />

                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel || route.name;
                    const isFocused = state.index === index;

                    const getIconName = (routeName, isFocused) => {
                        switch (routeName) {
                            case t('home'):
                                return isFocused ? 'home' : 'home-outline';
                            case 'Account':
                                return isFocused ? 'person' : 'person-outline';
                            case t('category'):
                                return isFocused ? 'grid' : 'grid-outline';
                            case 'Search':
                                return isFocused ? 'search' : 'search-outline';
                            case t('cart'):
                                return isFocused ? 'cart' : 'cart-outline';
                            case t('offer'):
                                return isFocused ? 'gift' : 'gift-outline';
                            case t('wishlist'):
                                return isFocused ? 'heart' : 'heart-outline';
                            case 'Settings':
                                return isFocused ? 'settings' : 'settings-outline';
                            default:
                                return 'ellipse-outline';
                        }
                    };

                    const onPress = () => {
                        if (route.name === 'Search') {
                            navigation.navigate('SearchScreen');
                        } else if ([t('home'), `${t('cart')}`, `${t('category')}`, 'Account', `${t('wishlist')}`, `${t('offer')}`].includes(route.name)) {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: route.name }],
                            });
                        } else {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={styles.tabButton}
                            onPress={onPress}
                            onLayout={(e) => handleTabLayout(e, index, route.name)}
                        >
                            <Animated.View
                                style={[
                                    styles.iconContainer,
                                    useAnimatedStyle(() => ({
                                        transform: [
                                            { scale: iconScales[index].value },
                                            { rotateZ: `${interpolate(iconRotations[index].value, [0, 1], [0, 15])}deg` },
                                        ],
                                    })),
                                    route.name === `${t('cart')}` && cartIconAnimatedStyle
                                ]}
                            >
                                <Ionicons
                                    name={getIconName(route.name, isFocused)}
                                    size={ICON_SIZE}
                                    color={isFocused ? '#FFF' : '#F1F1F1'}
                                />
                                {/* 🛒 Add cart badge for Cart icon */}
                                {route.name === `${t('cart')}` && cartCount > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>{cartCount}</Text>
                                    </View>
                                )}
                                {/* ❤️ Add wishlist badge for Wishlist icon */}
                                {route.name === `${t('wishlist')}` && wishListCount > 0 && (
                                    <View style={styles.wishListBadge}>
                                        <Text style={styles.wishListBadgeText}>{wishListCount}</Text>
                                    </View>
                                )}
                            </Animated.View>
                            <Text style={[styles.label, isFocused && { color: '#FFF', fontWeight: '500', fontSize: 14 }]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </LinearGradient>

            {/* Stars animation container - Now positioned dynamically */}
            <View style={styles.starsContainer}>
                {renderStars()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    tabBarContainer: {
        flexDirection: 'row',
        height: 60,
        position: 'relative',
        paddingHorizontal: 5,
        paddingBottom: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        width: '100%'
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        color: '#F1F1F1',
        marginTop: 5,
    },
    circleIndicator: {
        position: 'absolute',
        bottom: 28,
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        opacity: 0.2,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadge: {
        position: 'absolute',
        right: -8,
        top: -3,
        backgroundColor: 'red',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    wishListBadge: {
        position: 'absolute',
        right: -8,
        top: -3,
        backgroundColor: 'red',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wishListBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    starsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    }
});

export default CustomTabBar;