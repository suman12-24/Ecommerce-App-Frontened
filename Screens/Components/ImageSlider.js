import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Image, Animated, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import axiosInstance, { baseURL } from '../../Axios_BaseUrl_Token_SetUp/axiosInstance';

const { width } = Dimensions.get('window');

const ImageSlider = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        if (images.length === 0) return;
        restartProgressBar();

        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }, 2000);

        return () => clearInterval(interval);
    }, [currentIndex, images]);

    const fetchBanners = async () => {
        try {
            const response = await axiosInstance.get('/Suhani-Electronics-Backend/f_banner.php');
            if (response.data?.success && Array.isArray(response.data.data)) {
                const bannerImages = response.data.data.map(item => `${baseURL}/Banner_upload/` + item.banner);
                setImages(bannerImages);
            } else {
                console.error('Invalid response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const restartProgressBar = () => {
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
        }).start();
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <FlatList
                    data={[1, 2, 3]} // Placeholder items for shimmer effect
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.toString()}
                    renderItem={() => (
                        <ShimmerPlaceholder style={styles.image} shimmerColors={['#ebebeb', '#c5c5c5', '#ebebeb']} />
                    )}
                />
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.image} />
                        )}
                    />
                    <View style={styles.progressContainer}>
                        {images.map((_, index) => (
                            <View key={index} style={styles.progressWrapper}>
                                {index === currentIndex ? (
                                    <View style={styles.activeProgressWrapper}>
                                        <Animated.View
                                            style={[
                                                styles.activeProgressBar,
                                                {
                                                    width: progressAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['20%', '100%']
                                                    })
                                                }
                                            ]}
                                        />
                                    </View>
                                ) : (
                                    <View style={styles.inactiveDot} />
                                )}
                            </View>
                        ))}
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 210,
        marginTop: 10
    },

    image: {
        width: width * 0.95,
        marginHorizontal: 7,
        height: '85%',
        resizeMode: 'cover',
        borderRadius: 10
    },
    progressContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 15,
        top: '65%',
        width: '70%',
        marginRight: '20%',
        marginLeft: '33%'
    },
    progressWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    inactiveDot: {
        width: 9,
        height: 9,
        backgroundColor: 'gray',
        borderRadius: 9 / 2,
    },
    activeProgressWrapper: {
        width: 40,
        height: 7,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    activeProgressBar: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 3,
    }
});

export default ImageSlider;
