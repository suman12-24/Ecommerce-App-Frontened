import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import RenderHtml from 'react-native-render-html';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import appNameController from './Model/appNameController';
import {useTranslation} from 'react-i18next';
const PrivacyPolicy = ({navigation}) => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [error, setError] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const scrollViewRef = useRef(null);
  const scrollButtonOpacity = useRef(new Animated.Value(0)).current;

  const {width} = Dimensions.get('window');

  useEffect(() => {
    fetchPrivacyPolicy();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
    return true; // Prevents default behavior
  };

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        '/Suhani-Electronics-Backend/f_privacy_policy.php',
      );

      console.log('API Response:', JSON.stringify(response.data)); // For debugging

      if (
        response.data ||
        response.data.message == 'Privacy Policy retrieved successfully' ||
        response.data.data ||
        response.data.data.length > 0
      ) {
        setPrivacyPolicy(response.data.data[0].description || '');
        console.log(
          'Privacy Policy Content:',
          response?.data?.data[0]?.description,
        ); // Log the actual content
      } else {
        setError('Failed to load privacy policy');
      }
    } catch (err) {
      console.error('Error fetching privacy policy:', err);
      setError('An error occurred while loading the privacy policy');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = event => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    if (scrollOffset > 200 && !showScrollToTop) {
      setShowScrollToTop(true);
      Animated.timing(scrollButtonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (scrollOffset <= 200 && showScrollToTop) {
      setShowScrollToTop(false);
      Animated.timing(scrollButtonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={appNameController.activityIndicatorColor}
          />
          <Text style={styles.loadingText}>{t('loadingPriPoli')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F56565" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPrivacyPolicy}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!privacyPolicy) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="info-outline" size={48} color="#718096" />
          <Text style={styles.notFoundText}>{t('priPoliNotAvi')}</Text>
        </View>
      );
    }

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <View style={styles.card}>
          <RenderHtml
            contentWidth={width - 64}
            source={{html: privacyPolicy}}
            tagsStyles={{
              h1: {
                color: '#2D3748',
                fontSize: 24,
                marginBottom: 16,
                fontWeight: 'bold',
                fontFamily: 'System',
              },
              h2: {
                color: '#4A5568',
                fontSize: 20,
                marginBottom: 12,
                fontWeight: 'bold',
                fontFamily: 'System',
              },
              p: {
                color: '#4A5568',
                fontSize: 16,
                lineHeight: 24,
                marginBottom: 16,
                fontFamily: 'System',
              },
              li: {
                color: '#4A5568',
                fontSize: 16,
                lineHeight: 24,
                marginBottom: 8,
                fontFamily: 'System',
              },
              ul: {marginBottom: 16, paddingLeft: 16},
              ol: {marginBottom: 16, paddingLeft: 16},
              a: {color: '#0ba893', textDecorationLine: 'underline'},
              strong: {color: '#2D3748', fontWeight: 'bold'},
            }}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={appNameController.statusBarColor}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation && navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{t('privacyPolicy')}</Text>
          <View style={styles.iconPlaceholder} />
        </View>
        {renderContent()}

        <Animated.View
          style={[styles.scrollToTopButton, {opacity: scrollButtonOpacity}]}>
          <TouchableOpacity onPress={scrollToTop} activeOpacity={0.8}>
            <View style={styles.scrollToTopButtonInner}>
              <MaterialIcons name="keyboard-arrow-up" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={{height: 10}} />
      </View>
    </>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: '#0ba893',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#0ba893',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  iconPlaceholder: {
    width: 30,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#F56565',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0ba893',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notFoundText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 16,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 10,
  },
  scrollToTopButtonInner: {
    backgroundColor: '#0ba893',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
