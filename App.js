import 'react-native-gesture-handler';
import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  View,
  Linking,
  Platform,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import Navigation from './Navigation_Manager/Navigation';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './redux/store';
import appNameController from './Screens/Model/appNameController';
import {I18nextProvider} from 'react-i18next';
import i18n, {getSavedLanguage} from './localization/i18n';
import NetworkProvider from './Screens/Components/NetworkProvider';
import {CommonActions} from '@react-navigation/native';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef(null);
  const initialURL = useRef(null);

  const handleDeepLink = event => {
    const url = event?.url || event;
    if (!url) return;

    console.log('Deep link received:', url);

    try {
      const regex = /[?&]id=([^&]+)/;
      const match = url.match(regex);
      const productId = match ? match[1] : null;

      console.log('Extracted product ID:', productId);

      // Inside handleDeepLink:
      if (productId && navigationRef.current) {
        console.log('Navigating to product details with direct dispatch...');

        navigationRef.current.dispatch(
          CommonActions.navigate({
            name: 'ProductDetailsScreen',
            params: {
              item: {id: productId},
              fromDeepLink: true,
            },
          }),
        );
      }
    } catch (error) {
      console.log('Error processing deep link:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load saved language
        const savedLanguage = await getSavedLanguage();
        await i18n.changeLanguage(savedLanguage);

        // Handle initial URL for both platforms
        const initialUrl = await Linking.getInitialURL();
        console.log('Initial URL on app start:', initialUrl);
        if (initialUrl) {
          initialURL.current = initialUrl;
        }
      } catch (error) {
        console.log('Error during app initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Set up deep link event listener for when app is already running
    const linkingSubscription = Linking.addEventListener('url', event => {
      console.log('URL event received while app running:', event);
      handleDeepLink(event);
    });

    return () => {
      linkingSubscription.remove();
    };
  }, []);

  // Handle initial URL after app is loaded and navigation is ready
  useEffect(() => {
    if (!isLoading && initialURL.current && navigationRef.current) {
      // Small delay to ensure navigation is fully initialized
      console.log('App loaded, handling initial URL:', initialURL.current);
      setTimeout(() => {
        handleDeepLink(initialURL.current);
        initialURL.current = null;
      }, 1000); // Increased delay for better reliability
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NetworkProvider>
            <GestureHandlerRootView style={styles.container}>
              <SafeAreaView style={styles.safeArea}>
                <StatusBar
                  barStyle={'light-content'}
                  backgroundColor={appNameController.statusBarColor}
                />
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={appNameController.textColor}
                  />
                </View>
              </SafeAreaView>
            </GestureHandlerRootView>
          </NetworkProvider>
        </PersistGate>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <NetworkProvider>
            <GestureHandlerRootView style={styles.container}>
              <SafeAreaView style={styles.safeArea}>
                <StatusBar
                  barStyle={'light-content'}
                  backgroundColor={appNameController.statusBarColor}
                />
                <Navigation ref={navigationRef} />
              </SafeAreaView>
            </GestureHandlerRootView>
          </NetworkProvider>
        </I18nextProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: appNameController.statusBarColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
