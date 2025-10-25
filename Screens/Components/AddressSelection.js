import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, FlatList, Animated, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get('window');

const AddressSelection = () => {
    const navigation = useNavigation();
    // Animation setup
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(width)).current;
    const progressAnim = useRef(new Animated.Value(1)).current;

    // Mock data definition (moved before its usage)
    const mockData = {
        addresses: [
            {
                id: 15,
                name: "New",
                address: "Shshhd",
                city: "Jdhe",
                pin: "700050",
                state: "WB",
                mobile: "123456789",
                landmark: "Dhhd",
                status: "1",
                user_id: 1,
                isDefault: true
            },
            {
                id: 16,
                name: "New",
                address: "Shshhd",
                city: "Jdhe",
                pin: "700050",
                state: "WB",
                mobile: "123456789",
                landmark: "Dhhd",
                status: "1",
                user_id: 1,
                isDefault: false
            },
        ],
    };

    // State setup
    const [selectedAddress, setSelectedAddress] = useState(mockData.addresses.find(addr => addr.isDefault) || mockData.addresses[0]);

    // Create addressCardScale animated values for each address
    const [addressCardScale] = useState(() => {
        const scales = {};
        mockData.addresses.forEach(address => {
            scales[address.id] = new Animated.Value(1);
        });
        return scales;
    });

    // Handle address selection
    const handleAddressSelect = (address) => {
        // Animate the previously selected card to scale down
        Animated.timing(addressCardScale[selectedAddress.id], {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
        }).start();

        // Animate the newly selected card to scale up
        Animated.timing(addressCardScale[address.id], {
            toValue: 1.02,
            duration: 200,
            useNativeDriver: true
        }).start();

        setSelectedAddress(address);
    };

    // Go to next step
    const goToNextStep = () => {
        navigation.navigate('ProductOrderSummary');
    };

    // Run animations when component mounts
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();

        // Set initial scale for selected address
        Animated.timing(addressCardScale[selectedAddress.id], {
            toValue: 1.02,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.pageContainer,
                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
            ]}
        >
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Select Delivery Address</Text>
            </View>

            {mockData.addresses.map(address => (
                <Animated.View
                    key={address.id}
                    style={[
                        styles.addressCard,
                        selectedAddress.id === address.id && styles.selectedAddressCard,
                        { transform: [{ scale: addressCardScale[address.id] }] }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.addressCardContent}
                        onPress={() => handleAddressSelect(address)}
                        activeOpacity={0.8}
                    >
                        {address.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                            </View>
                        )}

                        <View style={styles.addressHeader}>
                            <View style={styles.addressNameContainer}>
                                <Ionicons name="person" size={16} color="#2874f0" style={styles.addressIcon} />
                                <Text style={styles.addressName}>{address.name}</Text>
                            </View>
                            {selectedAddress.id === address.id && (
                                <View style={styles.selectedIndicator}>
                                    <MaterialIcons name="check" size={16} color="#fff" />
                                </View>
                            )}
                        </View>

                        <View style={styles.addressDetails}>
                            <View style={styles.addressRow}>
                                <Ionicons name="location" size={16} color="#666" style={styles.addressIcon} />
                                <Text style={styles.addressText}>
                                    {address.address}, {address.landmark}
                                </Text>
                            </View>
                            <View style={styles.addressRow}>
                                <Ionicons name="business" size={16} color="#666" style={styles.addressIcon} />
                                <Text style={styles.addressText}>
                                    {address.city}, {address.state} - {address.pin}
                                </Text>
                            </View>
                            <View style={styles.addressRow}>
                                <Ionicons name="call" size={16} color="#666" style={styles.addressIcon} />
                                <Text style={styles.addressText}>
                                    {address.mobile}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.addressActions}>
                            <TouchableOpacity style={styles.addressActionBtn}>
                                <MaterialIcons name="edit" size={16} color="#2874f0" />
                                <Text style={styles.addressActionBtnText}>EDIT</Text>
                            </TouchableOpacity>
                            {!address.isDefault && (
                                <TouchableOpacity style={styles.addressActionBtn}>
                                    <MaterialIcons name="star-border" size={16} color="#2874f0" />
                                    <Text style={styles.addressActionBtnText}>MAKE DEFAULT</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            ))}

            <TouchableOpacity style={styles.addNewAddressBtn} activeOpacity={0.8}>
                <MaterialIcons name="add-circle-outline" size={20} color="#2874f0" />
                <Text style={styles.addNewAddressBtnText}>ADD A NEW ADDRESS</Text>
            </TouchableOpacity>

            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={goToNextStep}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>DELIVER TO THIS ADDRESS</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default AddressSelection;

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        paddingBottom: 16,
    },
    headerContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        elevation: 2,
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    addressCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
    },
    addressCardContent: {
        padding: 16,
    },
    selectedAddressCard: {
        borderWidth: 1,
        borderColor: '#2874f0',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressIcon: {
        marginRight: 8,
    },
    addressName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212121',
    },
    addressDetails: {
        marginBottom: 12,
    },
    addressRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    addressText: {
        color: '#757575',
        lineHeight: 20,
        flex: 1,
    },
    defaultBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#2874f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomLeftRadius: 8,
    },
    defaultBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    selectedIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2874f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    addressActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    addressActionBtnText: {
        color: '#2874f0',
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    addNewAddressBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    addNewAddressBtnText: {
        color: '#2874f0',
        marginLeft: 8,
        fontWeight: '500',
    },
    navigationButtons: {
        marginHorizontal: 16,
        marginTop: 'auto',
    },
    continueButton: {
        backgroundColor: '#2874f0',
        borderRadius: 4,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontWeight: '500',
        marginRight: 8,
    },
});