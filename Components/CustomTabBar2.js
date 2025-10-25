import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const ICON_SIZE = 22;
const CIRCLE_SIZE = ICON_SIZE + 16;

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const translateX = useSharedValue(0);
    const [tabLayouts, setTabLayouts] = useState([]);

    const iconScales = useRef(state.routes.map(() => useSharedValue(1))).current;
    const iconRotations = useRef(state.routes.map(() => useSharedValue(0))).current;

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

    const handleTabLayout = (e, index) => {
        const { x, width } = e.nativeEvent.layout;
        setTabLayouts((prevLayouts) => {
            const newLayouts = [...prevLayouts];
            newLayouts[index] = { x, width };
            return newLayouts;
        });
    };

    return (
        <View style={styles.floatingContainer}>
            <LinearGradient
                colors={['#11d4ad', '#0da386']} // 🎨 Adjust gradient colors as needed
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
                            case 'Home':
                                return isFocused ? 'home' : 'home-outline';
                            case 'Account':
                                return isFocused ? 'person' : 'person-outline';
                            case 'Search':
                                return isFocused ? 'search' : 'search-outline';
                            case 'Cart':
                                return isFocused ? 'cart' : 'cart-outline';
                            case 'Wishlist':
                                return isFocused ? 'heart' : 'heart-outline';
                            case 'Settings':
                                return isFocused ? 'settings' : 'settings-outline';
                            default:
                                return 'ellipse-outline';
                        }
                    };

                    return (
                        // <TouchableOpacity
                        //     key={route.key}
                        //     style={styles.tabButton}
                        //     onPress={() => navigation.navigate(route.name)}
                        //     onLayout={(e) => handleTabLayout(e, index)}
                        // >

                        <TouchableOpacity
                            key={route.key}
                            style={styles.tabButton}
                            onPress={() => {
                                if (['Home', 'Search', 'Cart', 'Account'].includes(route.name)) {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: route.name }], // 🔹 Reset for these tabs
                                    });
                                } else {
                                    navigation.navigate(route.name);
                                }
                            }}
                            onLayout={(e) => handleTabLayout(e, index)}
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
                                ]}
                            >
                                <Ionicons
                                    name={getIconName(route.name, isFocused)}
                                    size={ICON_SIZE}
                                    color={isFocused ? '#FFF' : '#F1F1F1'}
                                />
                            </Animated.View>
                            <Text style={[styles.label, isFocused && {
                                color: '#FFF', fontWeight: '500',

                                fontSize: 14
                            }]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </LinearGradient>
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
});

export default CustomTabBar;
