import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import axiosInstance from '../../Axios_BaseUrl_Token_SetUp/axiosInstance';
import appNameController from '../Model/appNameController';

const { height } = Dimensions.get('window');

const CouponBottomSheet = ({ isVisible, onClose, onApplyCoupon, totalAmount }) => {
    const [coupons, setCoupons] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isVisible) {
            fetchCoupons();
        }
    }, [isVisible]);

    const fetchCoupons = async () => {
        try {
            const response = await axiosInstance.get('/Suhani-Electronics-Backend/f_offer.php');
            if (response.data && response.data.success && response.data.data) {
                setCoupons(response.data.data.filter(c => c.status === 1 && c.coupon_delete === 0));
            } else {
                setError('No coupons found');
            }
        } catch (err) {
            setError('Failed to fetch coupons');
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.handle} />
            <View style={styles.header}>
                <Text style={styles.title}>Available Coupons</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            style={styles.modal}
            // swipeDirection={['down']}
            // onSwipeComplete={onClose}
            backdropOpacity={0.5}
            animationIn="slideInUp"
            animationOut="slideOutDown"
        >
            <View style={styles.container}>
                {renderHeader()}
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={coupons}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.listContent}
                        style={styles.flatListStyle}
                        renderItem={({ item }) => {
                            const isApplicable = totalAmount >= parseFloat(item.min_value);

                            return (
                                <View style={styles.couponItem}>
                                    <View style={styles.couponLeft}>
                                        <Text style={styles.discountText}>₹{item.max_disc || 'N/A'}</Text>
                                        <Text style={styles.discountLabel}>OFF</Text>
                                    </View>
                                    <View style={styles.couponRight}>
                                        <View style={styles.couponRightTop}>
                                            <Text style={styles.couponCode}>{item.code}</Text>
                                            <TouchableOpacity
                                                onPress={() => isApplicable && onApplyCoupon(item)}
                                                style={[
                                                    styles.applyButton,
                                                    !isApplicable && styles.disabledButton
                                                ]}
                                                disabled={!isApplicable}
                                            >
                                                <Text style={[
                                                    styles.applyButtonText,
                                                    !isApplicable && styles.disabledButtonText
                                                ]}>
                                                    {isApplicable ? 'APPLY' : 'NOT ELIGIBLE'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={styles.couponDescription}>{item.description}</Text>
                                        <Text style={styles.couponExpiry}>
                                            Minimum Order: ₹{item.min_value}
                                        </Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0
    },
    container: {
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 10,
            },
        })
    },
    headerContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        alignItems: 'center'
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginBottom: 15
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333'
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        padding: 5
    },
    closeText: {
        fontSize: 24,
        color: '#666',
        fontWeight: '300'
    },
    listContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 30
    },
    flatListStyle: {
        flexGrow: 1,
        maxHeight: height * 0.6 // Limit height to 60% of screen
    },
    couponItem: {
        flexDirection: 'row',
        marginBottom: 15,
        borderRadius: 12,
        backgroundColor: 'white',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
        overflow: 'hidden'
    },
    couponLeft: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        width: '25%'
    },
    discountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff3333'
    },
    discountLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff3333'
    },
    couponRight: {
        padding: 15,
        flex: 1
    },
    couponRightTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    couponCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    couponDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5
    },
    couponExpiry: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10
    },
    applyButton: {
        backgroundColor: appNameController.applyCoupon,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6
    },
    disabledButton: {
        backgroundColor: '#e0e0e0'
    },
    applyButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    disabledButtonText: {
        color: '#999'
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorText: {
        color: '#d9534f',
        fontSize: 16
    }
});

export default CouponBottomSheet;