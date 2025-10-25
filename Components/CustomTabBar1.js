import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 4;
const ICON_SIZE = 22;
const CIRCLE_SIZE = ICON_SIZE + 16;

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const translateX = useSharedValue(0);
    const [tabLayouts, setTabLayouts] = useState([]);
    const iconScales = state.routes.map(() => useSharedValue(1)); // Array of animated values for icon scale

    React.useEffect(() => {
        const selectedTabLayout = tabLayouts[state.index];
        if (selectedTabLayout) {
            translateX.value = selectedTabLayout.x + selectedTabLayout.width / 2 - CIRCLE_SIZE / 2;
        }

        // Animate the selected icon
        iconScales.forEach((scale, index) => {
            scale.value = withSpring(state.index === index ? 1.2 : 1, { damping: 15 });
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
            <View style={styles.tabBarContainer}>
                <Animated.View
                    style={[
                        styles.circleIndicator,
                        useAnimatedStyle(() => ({
                            transform: [{ translateX: withTiming(translateX.value, { duration: 200 }) }],
                        })),
                    ]}
                />

                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel || route.name;
                    const isFocused = state.index === index;

                    // Define icons based on the route name
                    const getIconName = (routeName, isFocused) => {
                        switch (routeName) {
                            case 'Home':
                                return isFocused ? 'home' : 'home-outline';
                            case 'Account':
                                return isFocused ? 'person' : 'person-outline';
                            case 'Menu':
                                return isFocused ? 'grid' : 'grid-outline';
                            case 'Cart':
                                return isFocused ? 'cart' : 'cart-outline';
                            case 'Wishlist':
                                return isFocused ? 'heart' : 'heart-outline';
                            case 'Settings':
                                return isFocused ? 'settings' : 'settings-outline';
                            default:
                                return 'ellipse-outline'; // Default icon
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={styles.tabButton}
                            onPress={() => navigation.navigate(route.name)}
                            onLayout={(e) => handleTabLayout(e, index)}
                        >
                            <Animated.View
                                style={useAnimatedStyle(() => ({
                                    transform: [{ scale: iconScales[index].value }],
                                }))}
                            >
                                <Ionicons
                                    name={getIconName(route.name, isFocused)}
                                    size={ICON_SIZE}
                                    color={isFocused ? '#007AFF' : '#A0A0A0'}
                                />
                            </Animated.View>
                            <Text style={[styles.label, isFocused && { color: '#007AFF' }]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    tabBarContainer: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: 'white',
        elevation: 5,
        borderRadius: 20,
        position: 'relative',
        paddingHorizontal: 5,
        paddingBottom: 3,
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
        color: '#A0A0A0',
        marginTop: 4,
    },
    circleIndicator: {
        position: 'absolute',
        bottom: 28,
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        backgroundColor: '#007AFF',
        borderRadius: CIRCLE_SIZE / 2,
        opacity: 0.2,
    },
});

export default CustomTabBar;
