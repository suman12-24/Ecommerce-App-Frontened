import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ActivityIndicator, TouchableOpacity, ToastAndroid, Clipboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axiosInstance from '../../Axios_BaseUrl_Token_SetUp/axiosInstance';

const { width } = Dimensions.get('window');

const DotPattern = () => {
    const dots = [];
    const size = 7;
    const gap = 20;

    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 12; j++) {
            dots.push(
                <View
                    key={`${i}-${j}`}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        position: 'absolute',
                        top: j * gap,
                        left: i * gap,
                    }}
                />
            );
        }
    }

    return <View style={{ position: 'absolute', top: 0, left: 0 }}>{dots}</View>;
};

// Dotted Divider Component
const DottedDivider = () => {
    const dotSize = 2;
    const gap = 6;
    const dots = [];
    const totalWidth = width - 40; // Same as card width
    const numberOfDots = Math.floor(totalWidth / (dotSize + gap));

    for (let i = 0; i < numberOfDots; i++) {
        dots.push(
            <View
                key={`divider-dot-${i}`}
                style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    marginRight: i < numberOfDots - 1 ? gap : 0,
                }}
            />
        );
    }

    return (
        <View style={styles.dividerContainer}>
            {dots}
        </View>
    );
};

const DiscountCoupon = ({ coupon }) => {
    // Handle code copying
    const copyToClipboard = () => {
        Clipboard.setString(coupon.code);
        ToastAndroid.show('Coupon code copied!', ToastAndroid.SHORT);
    };

    // Format code with ellipsis if needed
    const formatCode = (code) => {
        if (code.length > 15) {
            return code.slice(0, 15) + '...';
        }
        return code;
    };

    const getValidDate = () => {
        try {
            const dateParts = coupon.date.split('-');
            const formattedDate = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
            return `Valid until ${formattedDate}`;
        } catch (e) {
            return `Valid until ${coupon.date}`;
        }
    };

    // Format discount text
    const getDiscountText = () => {
        // If max_disc exists, show it formatted as currency
        if (coupon.max_disc) {
            return `Up to ₹${parseFloat(coupon.max_disc).toFixed(0)} OFF`;
        }
        return '';
    };

    // Format minimum value text
    const getMinValueText = () => {
        if (coupon.min_value) {
            return `Min. order: ₹${parseFloat(coupon.min_value).toFixed(0)}`;
        }
        return '';
    };

    // Determine gradient colors based on coupon type
    const getGradientColors = () => {
        return ['#3DD598', '#3BB2C3']; // Green-teal for all coupons
    };

    return (
        <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
        >
            <DotPattern />

            {/* Left notch */}
            <View style={[styles.notch, styles.leftNotch]} />

            {/* Right notch */}
            <View style={[styles.notch, styles.rightNotch]} />

            {/* Dotted Divider */}
            <DottedDivider />

            {/* Content */}
            <View style={styles.contentContainer}>
                {/* Top part of coupon - above the dotted line */}
                <View style={styles.topContent}>
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeText}>{formatCode(coupon.code)}</Text>
                        <TouchableOpacity
                            onPress={copyToClipboard}
                            style={styles.copyButton}
                        >
                            <Text style={styles.copyText}>Tap to copy</Text>
                        </TouchableOpacity>
                    </View>
                    {coupon.max_disc && (
                        <Text style={{
                            marginLeft: 12,

                            fontSize: 18,
                            color: 'white',
                            fontWeight: '500',
                            letterSpacing: 0.3,
                        }}>{getDiscountText()}</Text>
                    )}
                </View>

                {/* Bottom part of coupon - below the dotted line */}

                {coupon.description && (
                    <Text style={styles.descriptionText} numberOfLines={2}>{coupon.description}</Text>
                )}

                <View style={styles.infoRow}>
                    {coupon.min_value && (
                        <Text style={styles.minValueText}>{getMinValueText()}</Text>
                    )}
                    <Text style={styles.validText}>{getValidDate()}</Text>
                </View>
            </View>

        </LinearGradient>
    );
};

const AllCoupans = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/Suhani-Electronics-Backend/f_offer.php');

            if (response.data && response.data.success && response.data.data) {
                setCoupons(response.data.data);
            } else {
                setError('No coupons found');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch coupons');
            setLoading(false);
            console.error('Error fetching coupons:', err);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3DD598" />
                <Text style={styles.loadingText}>Loading Coupons...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Available Coupons</Text>
            <FlatList
                data={coupons}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <DiscountCoupon coupon={item} />}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    headerText: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 5,
        alignSelf: 'center',
        color: '#333',
    },
    listContainer: {
        paddingBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF6B6B',
        textAlign: 'center',
    },
    card: {
        width: width - 20,
        height: 160, // Made it a bit taller to accommodate more content
        borderRadius: 12,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        padding: 12,
        overflow: 'hidden',
    },
    notch: {
        position: 'absolute',
        height: 24,
        width: 24,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
    },
    leftNotch: {
        left: -12,
        top: '50%',
        marginTop: -12,
    },
    rightNotch: {
        right: -12,
        top: '50%',
        marginTop: -12,
    },
    dividerContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        top: '55%',
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topContent: {
        marginBottom: 5,
    },

    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    codeText: {
        marginLeft: 7,
        fontSize: 23,
        fontWeight: '700',
        color: 'white',
        letterSpacing: 1,
        opacity: 0.9,
    },
    copyButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 4,

    },
    copyText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },

    descriptionText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '400',
        marginTop: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    minValueText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    validText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '400',
    },
});

export default AllCoupans;