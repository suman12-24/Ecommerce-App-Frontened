import { ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance'
import { useRoute } from '@react-navigation/native'
// Import icons from React Native Vector Icons package
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTranslation } from 'react-i18next'
// Primary color constant for consistent styling
const PRIMARY_COLOR = '#0ba893';

const InputField = ({ label, icon, ...props }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrapper}>
            <Icon name={icon} size={20} color={PRIMARY_COLOR} style={styles.inputIcon} />
            <TextInput
                style={styles.inputWithIcon}
                placeholderTextColor="#999"
                {...props}
            />
        </View>
    </View>
)

const EditCustomerAddress = ({ navigation }) => {
    const { t } = useTranslation();
    const route = useRoute();
    const { address, navigationName } = route.params; // Get the selected address
    const [isLoading, setIsLoading] = useState(false);
    const [isPinLoading, setIsPinLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_id: address?.user_id || '',  // Default user_id if not provided
        name: address?.name || '',
        mobile: address?.mobile || '',
        address: address?.address || '',
        landmark: address?.landmark || '',
        city: address?.city || '',
        state: address?.state || '',
        pin: address?.pin || '',
        // status: address?.status || ''
    });

    // Function to fetch city and state from PIN code
    const fetchPinCodeDetails = async (pincode) => {
        if (pincode.length === 6) {
            try {
                setIsPinLoading(true);
                const response = await axiosInstance.get(`/Suhani-Electronics-Backend/f_pincode.php?pincode=${pincode}`);

                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    // Extract the first result from the data array
                    const pinData = response.data.data[0];

                    setFormData({
                        ...formData,
                        city: pinData.district || '', // Using district as city
                        state: pinData.state || ''
                    });
                } else {
                    Alert.alert('PIN Code Error', 'PIN code not found or not available');
                    // Clear city and state when PIN is invalid
                    setFormData({
                        ...formData,
                        city: '',
                        state: ''
                    });
                }
            } catch (error) {
                console.error('Error fetching PIN code details:', error);
                Alert.alert('Error', 'Failed to fetch location details for this PIN code');
                // Clear city and state on error
                setFormData({
                    ...formData,
                    city: '',
                    state: ''
                });
            } finally {
                setIsPinLoading(false);
            }
        }
    };

    // Handle PIN input change
    const handlePinChange = (text) => {
        const newPin = text.replace(/[^0-9]/g, '');
        setFormData({ ...formData, pin: newPin });

        // Clear city and state when PIN is changed and not 6 digits
        if (newPin.length !== 6) {
            setFormData(prev => ({
                ...prev,
                pin: newPin,
                city: '',
                state: ''
            }));
        }
    };

    // Effect to trigger PIN code lookup when 6 digits are entered
    useEffect(() => {
        if (formData.pin.length === 6) {
            fetchPinCodeDetails(formData.pin);
        }
    }, [formData.pin]);

    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.mobile || !formData.address || !formData.city || !formData.state || !formData.pin) {
                Alert.alert('Missing Information', 'Please fill all required fields');
                return;
            }
            setIsLoading(true);
            const response = await axiosInstance.put('/Suhani-Electronics-Backend/f_address_edit.php', {
                id: address?.id, // Ensure address_id is passed for editing
                ...formData
            });

            if (response.data.success) {
                Alert.alert(`${t('sucess')}`, `${t('addressSavedSucess')}`);
                navigationName == 'SelectDeliveryAddress' ? navigation.navigate("BottomTabNavigator", {
                    screen: `${t('cart')}`,
                    params: {
                        screen: "SelectDeliveryAddress"
                    }
                }) :
                    navigation.goBack();
            } else {
                Alert.alert('Error', response.data.message || 'Failed to update address');
            }
        } catch (error) {
            console.error('Error updating address:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Icon name="edit-location" size={30} color="#fff" />
                        </View>
                        <Text style={styles.title}>{t('editAddress')}</Text>
                        <Text style={styles.subtitle}>{t('updateDeliveryAddress')}</Text>
                    </View>

                    <View style={styles.card}>
                        <InputField
                            label={t('fullName')}
                            icon="person"
                            placeholder={t('fullName')}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            autoCapitalize="words"
                            autoCorrect={true}
                        />

                        <InputField
                            label={t('mobNum')}
                            icon="phone"
                            placeholder={t('mobNum')}
                            value={formData.mobile}
                            onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                            keyboardType="phone-pad"
                            maxLength={10}
                            autoCorrect={true}
                        />

                        <InputField
                            label={t('address')}
                            // icon="home"
                            placeholder={t('address')}
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            multiline
                            numberOfLines={3}
                            style={[styles.inputWithIcon, styles.textArea]}
                            autoCorrect={true}
                        />

                        <InputField
                            label={t('landMark')}
                            icon="place"
                            placeholder={t('landMark')}
                            value={formData.landmark}
                            onChangeText={(text) => setFormData({ ...formData, landmark: text })}
                            autoCapitalize="words"
                            autoCorrect={true}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <InputField
                                    label={t('pinCode')}
                                    icon="pin"
                                    placeholder={t('pinCode')}
                                    value={formData.pin}
                                    onChangeText={handlePinChange}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoCorrect={true}
                                />
                                {isPinLoading && (
                                    <View style={styles.pinLoaderContainer}>
                                        <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                                        <Text style={styles.pinLoaderText}>{t('fetchingDetails')}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.halfWidth}>
                                <InputField
                                    label={t('city')}
                                    icon="location-city"
                                    placeholder={t('city')}
                                    value={formData.city}
                                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <InputField
                            label={t('state')}
                            icon="map"
                            placeholder={t('state')}
                            value={formData.state}
                            onChangeText={(text) => setFormData({ ...formData, state: text })}
                            editable={false}
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                            disabled={isLoading}

                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) :
                                (
                                    <>
                                        <Icon name="check" size={20} color="#fff" style={styles.buttonIcon} />
                                        <Text style={styles.buttonText}>{t('updateAddress')}</Text>
                                    </>
                                )}
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 10 }} />
            </ScrollView>
        </SafeAreaView>
    )
}

export default EditCustomerAddress

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        padding: 12,
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        marginVertical: 5,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: PRIMARY_COLOR,
    },
    inputContainer: {
        marginBottom: 10,
    },
    label: {
        fontSize: 17,
        fontWeight: '600',
        color: '#444',
        marginBottom: 5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
    },
    inputIcon: {
        padding: 10,
    },
    inputWithIcon: {
        flex: 1,
        padding: 8,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    button: {
        backgroundColor: PRIMARY_COLOR,
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: PRIMARY_COLOR,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 2,
        minHeight: 50
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    pinLoaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginLeft: 8,
    },
    pinLoaderText: {
        fontSize: 12,
        color: PRIMARY_COLOR,
        marginLeft: 4,
    }
})