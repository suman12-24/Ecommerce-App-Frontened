import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const MakePaymentScreen = ({ route }) => {
    // Extract the payment URL from navigation parameters
    const { payment_url } = route.params;

    return (
        <View style={{ flex: 1 }}>
            <WebView
                source={{ uri: payment_url }}
                startInLoadingState={true}
                renderLoading={() => <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />}
            />
        </View>
    );
};

export default MakePaymentScreen;
