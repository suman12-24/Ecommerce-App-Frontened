import { StyleSheet, Text, View, Animated, TouchableOpacity, Easing } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
const EnhancedWishlistButton = ({ size = 24, color = 'red', onToggle, isLiked, isLoggedIn = true }) => {
    const [liked, setLiked] = useState(isLiked);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Create 8 ray animations - one for each direction
    const rayAnims = Array(8).fill().map(() => useRef(new Animated.Value(0)).current);

    // Update liked state when isLiked prop changes
    useEffect(() => {
        setLiked(isLiked);
    }, [isLiked]);

    // Toggle like state and trigger animation
    const toggleLike = () => {
        if (!isLoggedIn) {
            if (onToggle) {
                onToggle(false);
            }
            return;
        }

        const newLikedState = !liked;
        setLiked(newLikedState);

        if (newLikedState) {
            // Heart pulse animation - more dramatic
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.5,  // Larger scale for more prominence
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.elastic(1.2)),
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();

            // Ray animations with staggered effect
            rayAnims.forEach((anim, index) => {
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 800,  // Longer duration for more visible effect
                    delay: index * 30,  // Stagger the animations
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }).start(() => {
                    // Reset the animation after completion for potential replay
                    setTimeout(() => {
                        anim.setValue(0);
                    }, 100);
                });
            });
        }

        if (onToggle) {
            onToggle(newLikedState);
        }
    };

    // Render rays around the heart
    const renderRays = () => {
        return rayAnims.map((anim, index) => {
            const angle = (index * 45) * (Math.PI / 180); // Convert to radians
            const translateX = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, Math.cos(angle) * size * 1.2],
            });
            const translateY = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, Math.sin(angle) * size * 1.2],
            });
            const opacity = anim.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 1, 0.7, 0],
            });
            const scaleRay = anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1.5, 1],
            });

            // Different ray designs based on position
            const isMainAxis = index % 2 === 0;
            const rayStyle = isMainAxis ?
                { width: 8, height: 3, borderRadius: 1.5 } :
                { width: 4, height: 4, borderRadius: 2 };

            return (
                <Animated.View
                    key={index}
                    style={[
                        styles.ray,
                        rayStyle,
                        {
                            backgroundColor: color,
                            transform: [
                                { translateX },
                                { translateY },
                                { scale: scaleRay },
                            ],
                            opacity,
                        },
                    ]}
                />
            );
        });
    };

    return (
        <View style={styles.wishlistContainer}>
            {liked && renderRays()}
            <TouchableOpacity onPress={toggleLike} activeOpacity={0.7}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <AntDesign
                        name={liked ? "heart" : "hearto"}
                        size={size}
                        color={color}
                        style={styles.heartIcon}
                    />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

export default EnhancedWishlistButton

const styles = StyleSheet.create({
    wishlistContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        position: 'relative',
    },
    ray: {
        position: 'absolute',
        backgroundColor: 'red',
        // Default style will be overridden for each ray
    },
    heartIcon: {
        // Add shadow to make heart more prominent
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    }
})