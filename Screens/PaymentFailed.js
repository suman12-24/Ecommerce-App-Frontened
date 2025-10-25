import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import appNameController from './Model/appNameController';

const {width, height} = Dimensions.get('window');

const PaymentFailed = ({navigation}) => {
  // Enhanced animations
  const backgroundOpacity = new Animated.Value(0);
  const circleSize = new Animated.Value(0);
  const iconOpacity = new Animated.Value(0);
  const messageOpacity = new Animated.Value(0);
  const messageTranslateY = new Animated.Value(20);
  const buttonContainerOpacity = new Animated.Value(0);
  const buttonContainerTranslateY = new Animated.Value(30);
  const primaryButtonScale = new Animated.Value(0.95);
  const supportOpacity = new Animated.Value(0);
  const supportTranslateY = new Animated.Value(20);

  useEffect(() => {
    // More sophisticated animation sequence
    Animated.sequence([
      // Fade in background first
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      // Grow and bounce the error circle
      Animated.spring(circleSize, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),

      // Fade in the X icon with slight delay
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Bring in message with slight upward motion
      Animated.parallel([
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(messageTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // Bring in buttons
      Animated.parallel([
        Animated.timing(buttonContainerOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonContainerTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(primaryButtonScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),

      // Finally bring in support text
      Animated.parallel([
        Animated.timing(supportOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(supportTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium gradient background */}
      <Animated.View style={[styles.background, {opacity: backgroundOpacity}]}>
        <LinearGradient
          colors={['#fff', '#f2f2f2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradient}
        />

        {/* Subtle pattern overlay */}
        <View style={styles.patternOverlay} />
      </Animated.View>

      <View style={styles.contentContainer}>
        {/* Enhanced animated failure icon with pulse effect */}
        <View style={styles.iconOuterContainer}>
          <Animated.View
            style={[
              styles.iconPulse,
              {
                opacity: iconOpacity,
                transform: [{scale: circleSize}],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.iconBackground,
              {
                transform: [{scale: circleSize}],
              },
            ]}>
            <Animated.View style={{opacity: iconOpacity}}>
              <FontAwesome name="times" size={44} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Message content with enhanced styling */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: messageOpacity,
              transform: [{translateY: messageTranslateY}],
            },
          ]}>
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.message}>
            We couldn't process your transaction at this time. Please verify
            your payment details and try again.
          </Text>
          <View style={styles.errorCodeContainer}>
            <Text style={styles.errorCode}>Error Code: PYM-1082</Text>
          </View>
        </Animated.View>

        {/* Enhanced action buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonContainerOpacity,
              transform: [{translateY: buttonContainerTranslateY}],
            },
          ]}>
          <Animated.View style={{transform: [{scale: primaryButtonScale}]}}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('CartScreen')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#0baf9a', '#0baf9a']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.buttonGradient}>
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced support section */}
        <Animated.View
          style={[
            styles.supportContainer,
            {
              opacity: supportOpacity,
              transform: [{translateY: supportTranslateY}],
            },
          ]}>
          <View style={styles.supportLine} />
          <Text style={styles.supportText}>
            Need assistance with your payment?
          </Text>
          <TouchableOpacity>
            <Text style={styles.supportLink}>Contact Customer Support</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  patternOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.05,
    backgroundColor: 'transparent',
    backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconOuterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  iconBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  messageContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: width * 0.85,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#404040',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  message: {
    fontSize: 16,
    lineHeight: 26,
    color: '#404040',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '400',
  },
  errorCodeContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  errorCode: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: width * 0.85,
    marginTop: 20,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#3A66FF',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 14,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  supportContainer: {
    marginTop: 50,
    alignItems: 'center',
    width: '100%',
  },
  supportLine: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 20,
  },
  supportText: {
    fontSize: 14,
    color: '#A0A5BD',
    marginBottom: 8,
  },
  supportLink: {
    color: appNameController.statusBarColor,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default PaymentFailed;
