import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, StatusBar } from 'react-native'
import React, { useState } from 'react'
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance'
import { useRoute } from '@react-navigation/native'

const InputField = ({ label, ...props }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            placeholderTextColor="#999"
            {...props}
        />
    </View>
)

const EditCustomerAddress = ({ navigation }) => {
    const route = useRoute();
    const { address } = route.params; // Get the selected address

    console.log("Editing Address:", address); // Debugging
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


    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.mobile || !formData.address || !formData.city || !formData.state || !formData.pin) {
                Alert.alert('Missing Information', 'Please fill all required fields');
                return;
            }

            const response = await axiosInstance.put('/Suhani-Electronics-Backend/f_address_edit.php', {
                id: address?.id, // Ensure address_id is passed for editing
                ...formData
            });

            if (response.data.success) {
                Alert.alert('Success', 'Your address has been updated successfully');
                navigation.goBack();
            } else {
                Alert.alert('Error', response.data.message || 'Failed to update address');
            }
        } catch (error) {
            console.error('Error updating address:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Address</Text>
                        <Text style={styles.subtitle}>Please fill in your delivery address details</Text>
                    </View>

                    <View style={styles.card}>
                        <InputField
                            label="Full Name"

                            placeholder="Enter your full name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        <InputField
                            label="Mobile Number"
                            placeholder="Enter your mobile number"
                            value={formData.mobile}
                            onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />

                        <InputField
                            label="Address"
                            placeholder="Enter your complete address"
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            multiline
                            numberOfLines={3}
                            style={[styles.input, styles.textArea]}
                        />

                        <InputField
                            label="Landmark (Optional)"
                            placeholder="Enter a nearby landmark"
                            value={formData.landmark}
                            onChangeText={(text) => setFormData({ ...formData, landmark: text })}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <InputField
                                    label="City"
                                    placeholder="Enter city"
                                    value={formData.city}
                                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <InputField
                                    label="PIN Code"
                                    placeholder="Enter PIN"
                                    value={formData.pin}
                                    onChangeText={(text) => setFormData({ ...formData, pin: text })}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                        </View>

                        <InputField
                            label="State"
                            placeholder="Enter state"
                            value={formData.state}
                            onChangeText={(text) => setFormData({ ...formData, state: text })}
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Save Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 70 }} />
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
        alignContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 8,
    },
    label: {
        fontSize: 17,
        fontWeight: '600',
        color: '#444',
        marginBottom: 5,
    },
    input: {
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 8,
        fontSize: 15,
        backgroundColor: '#f9f9f9',
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
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#2196F3',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
})

