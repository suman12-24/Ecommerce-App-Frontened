import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Defs, Stop, RadialGradient } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const { width } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PaymentSuccess = ({ route }) => {
  const { t } = useTranslation();
  const { userId } = useSelector(state => state.auth);
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // Get transaction details from route params
  const orderId = route.params?.orderId || 'null';
  const amount = route.params?.totalAmount || 'null';

  const date = route.params?.date || new Date().toLocaleDateString();
  const paymentMethod =
    route.params?.paymentMethod || 'Cash On Delivery';

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    // Checkmark animation
    setTimeout(() => {
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 400);

    // Pulse animation for the success icon
    const startPulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => startPulseAnimation());
    };

    startPulseAnimation();
  }, []);

  // Handle hardware back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleGoHome();
        return true; // Prevent default behavior (exit app)
      };

      // Add back button listener
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Set up navigation options to handle the header back button
      navigation.setOptions({
        headerLeft: () => null, // Remove back button if you don't want it to show
        // Or customize the back button:
        // headerLeft: () => (
        //   <TouchableOpacity onPress={handleGoHome}>
        //     <Icon name="arrow-back" size={24} color="#000" />
        //   </TouchableOpacity>
        // ),
        gestureEnabled: false, // Disable swipe back gesture if needed
      });

      // Clean up when component unmounts or loses focus
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation]),
  );

  const handleGoHome = () => {
    navigation.navigate(t('home'));
  };

  const handleViewOrder = () =>
    navigation.navigate('AccountStack', {
      screen: 'IndividualProductOrderDetails',
      params: {
        orderId,
        userId,
      },
    });

  // Checkmark animation values
  const strokeDashoffset = checkmarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  // Confetti animation values
  const confettiTranslateY = confettiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const confettiOpacity = confettiAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.6, 0],
  });

  // Generate confetti elements
  const renderConfetti = count => {
    const confettiElements = [];
    const colors = [
      '#FFD700',
      '#FF6B6B',
      '#4CAF50',
      '#2196F3',
      '#9C27B0',
      '#FF9800',
    ];

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 10 + 5;
      const left = `${Math.random() * 100}%`;
      const delay = Math.random() * 1000;
      const rotation = Math.random() * 360;
      const color = colors[Math.floor(Math.random() * colors.length)];

      confettiElements.push(
        <Animated.View
          key={i}
          style={[
            styles.confetti,
            {
              width: size,
              height: size,
              left: left,
              backgroundColor: color,
              transform: [
                {
                  translateY: Animated.add(
                    confettiTranslateY,
                    new Animated.Value(-Math.random() * 100),
                  ),
                },
                { rotate: `${rotation}deg` },
              ],
              opacity: confettiOpacity,
            },
          ]}
        />,
      );
    }

    return confettiElements;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView>
        <LinearGradient
          colors={['#0baf9a', '#0ba893']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}>
          <Animated.View
            style={[
              styles.successIconContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
              },
            ]}>
            <View style={styles.iconOuterCircle}>
              <View style={styles.iconInnerCircle}>
                <LottieView
                  autoPlay
                  loop
                  source={require('../Assets/Animation/paymentsucess.json')}
                  style={{
                    width: 130,
                    height: 130,
                  }}
                />
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text style={styles.title}>{t('paymentSucess')}</Text>
          <Text style={styles.message}>{t('purchaseSucessfull')}</Text>

          <View style={styles.detailsCard}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>{t('amountPaid')}</Text>
              <Text style={styles.amountValue}>{amount}</Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>💳</Text>
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>{t('paymentMethod')}</Text>
                  <Text style={styles.detailValue}>{paymentMethod}</Text>
                </View>
              </View>


              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>📅</Text>
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{date}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewOrder}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#0baf9a', '#0ba893']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}>
              <Text style={styles.primaryButtonText}>
                {t('viewOrderDetail')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.6}>
            <Text style={styles.secondaryButtonText}>{t('returnToHome')}</Text>
          </TouchableOpacity>

          <View style={styles.confettiContainer}>{renderConfetti(30)}</View>
        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    height: 200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  iconOuterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
    marginTop: -65,
    paddingTop: 40,
    paddingHorizontal: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0ba893',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#546E7A',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  amountContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  amountLabel: {
    fontSize: 16,
    color: '#0ba893',
    marginBottom: 5,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0ba893',
  },
  detailsContainer: {
    padding: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#78909C',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37474F',
    letterSpacing: 0.2,
  },
  primaryButton: {
    width: '100%',
    height: 55,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#0ba893',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0ba893',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#0ba893',
    fontSize: 15,
    fontWeight: '600',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 4,
    top: -20,
  },
});
