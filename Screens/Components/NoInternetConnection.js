import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
const {width, height} = Dimensions.get('window');

const NoInternetConnection = ({onRetry}) => {
  const {t} = useTranslation();
  // Animation values
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Subtle pulse animation for the retry button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Bounce animation for troubleshooting tip
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Fade in animation with slight delay for staggered effect
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const bounceInterpolation = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRetry = () => {
    // Start rotation animation
    setIsRetrying(true);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
      onRetry();
      setTimeout(() => setIsRetrying(false), 500);
    });
  };

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <LinearGradient
        colors={['#e8fffe', '#f5fffd', '#ffffff']}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      <View style={styles.card}>
        <View style={styles.contentContainer}>
          <View style={styles.animationContainer}>
            <LottieView
              autoPlay
              loop
              resizeMode="center"
              source={require('../../Assets/Animation/no_internet.json')}
              style={styles.animation}
            />
          </View>

          <Text style={styles.title}>{t('noConnection')}</Text>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.message}>{t('notToConnectSurver')}</Text>

          <Animated.View
            style={[
              styles.retryButtonContainer,
              {transform: [{scale: pulseAnim}]},
            ]}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
              disabled={isRetrying}>
              <LinearGradient
                colors={['#0baf9a', '#09c7ae', '#07e0c5']}
                style={styles.buttonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                {isRetrying ? (
                  <Animated.View
                    style={{transform: [{rotate: rotateInterpolation}]}}>
                    <Ionicons name="sync-outline" size={24} color="#fff" />
                  </Animated.View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons
                      name="refresh-outline"
                      size={20}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.retryText}>{t('tryAgain')}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{transform: [{translateY: bounceInterpolation}]}}>
            <TouchableOpacity style={styles.helpLink}>
              <Text style={styles.helpText}>{t('needHelp')}</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color="#0baf9a"
                style={styles.helpIcon}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: width * 0.9,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#0baf9a',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(11, 175, 154, 0.1)',
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  animationContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(11, 175, 154, 0.05)',
    borderRadius: 16,
    padding: 10,
  },
  animation: {
    width: width * 0.5,
    height: height * 0.2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0baf9a',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '70%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(11, 175, 154, 0.2)',
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0baf9a',
    marginHorizontal: 10,
  },
  message: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButtonContainer: {
    marginBottom: 25,
    width: width * 0.6,
  },
  retryButton: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#0baf9a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  helpText: {
    color: '#6b7280',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  helpIcon: {
    marginLeft: 5,
  },
});

export default NoInternetConnection;
