import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
  Platform,
  BackHandler,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axiosInstance from '../../Axios_BaseUrl_Token_SetUp/axiosInstance';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
// Create a module-level variable to track if modal has been shown in this session

let hasShownModalThisSession = false;

const AppPopUp = ({onClose}) => {
  const {t} = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Start smaller for more dramatic zoom
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerWidth = useRef(new Animated.Value(100)).current;
  const closeIconRotate = useRef(new Animated.Value(0)).current;

  // References for animations
  const lottieRef = useRef(null);
  const timerAnimRef = useRef(null);

  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (modalVisible) {
          handleCloseModal();
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [modalVisible]);

  const fetchModalData = async () => {
    setLoading(true);
    setError(null);

    // Check if modal has been shown in this session
    if (hasShownModalThisSession) {
      setModalVisible(false);
      setLoading(false);
      if (onClose) onClose();
      return;
    }

    try {
      const response = await axiosInstance.get(
        '/Suhani-Electronics-Backend/f_modal_info.php',
      );

      if (
        response?.data?.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const modalInfo = response.data.data[0];
        setModalData(modalInfo);

        if (modalInfo.status === '1' || modalInfo.status === 1) {
          // Mark as shown in this session
          hasShownModalThisSession = true;
          showModalWithAnimation();
          setTimeRemaining(30);
          startTimer(30);
        } else {
          setModalVisible(false);
          if (onClose) onClose();
        }
      } else if (response?.data?.data) {
        // Fallback for non-array data
        const modalInfo = response.data.data;
        setModalData(modalInfo);

        if (modalInfo.status === '1' || modalInfo.status === 1) {
          // Mark as shown in this session
          hasShownModalThisSession = true;
          showModalWithAnimation();
          setTimeRemaining(30);
          startTimer(30);
        } else {
          setModalVisible(false);
          if (onClose) onClose();
        }
      } else {
        setModalVisible(false);
        if (onClose) onClose();
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to load data. Please try again later.');
      setModalVisible(false);
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  const showModalWithAnimation = () => {
    setModalVisible(true);

    // Hide status bar for immersive experience
    StatusBar.setHidden(true);

    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5); // Start smaller for more dramatic zoom
    closeIconRotate.setValue(0);
    timerWidth.setValue(100); // Reset timer width to 100%

    // Enhanced entrance animations with zoom effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1.2), // Elastic effect for bouncy feel
        useNativeDriver: true,
      }),
    ]).start();

    startPulseAnimation();

    // Rotate close icon for attention
    Animated.timing(closeIconRotate, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.elastic(2),
    }).start();

    // Play lottie animation if exists
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  // New function to start the timer with synchronized countdown and animation
  const startTimer = duration => {
    // Reset timer state
    setTimeRemaining(duration);
    timerWidth.setValue(100);

    // Clear any existing animation
    if (timerAnimRef.current) {
      timerAnimRef.current.stop();
    }

    // Start timer animation
    timerAnimRef.current = Animated.timing(timerWidth, {
      toValue: 0,
      duration: duration * 1000, // duration in ms
      useNativeDriver: false,
      easing: Easing.linear,
    });

    timerAnimRef.current.start();

    // Setup countdown interval synchronized with animation
    let startTime = Date.now();
    let intervalId = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      const newTimeRemaining = duration - elapsedTime;

      if (newTimeRemaining <= 0) {
        clearInterval(intervalId);
        setTimeRemaining(0);
        handleCloseModal();
      } else {
        setTimeRemaining(newTimeRemaining);
      }
    }, 1000);

    // Clean up function
    return () => {
      clearInterval(intervalId);
      if (timerAnimRef.current) {
        timerAnimRef.current.stop();
      }
    };
  };

  useEffect(() => {
    fetchModalData();

    return () => {
      StatusBar.setHidden(false);
      // Clean up timer when component unmounts
      if (timerAnimRef.current) {
        timerAnimRef.current.stop();
      }
    };
  }, []);

  const handleCloseModal = () => {
    // Restore status bar
    StatusBar.setHidden(false);

    // Stop timer animation
    if (timerAnimRef.current) {
      timerAnimRef.current.stop();
    }

    // Enhanced exit animations with zoom out effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5, // Zoom out to match entry animation
        duration: 300,
        useNativeDriver: true,
        easing: Easing.back(2), // Back easing for natural zoom out feel
      }),
    ]).start(() => {
      setModalVisible(false);
      if (onClose) onClose();
    });
  };

  // Render modal content based on API response structure
  const renderModalContent = () => {
    const closeIconInterpolate = closeIconRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.modalContent,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
          isExpanded && styles.expandedModal,
        ]}>
        {/* Close icon in the top-right corner */}
        <Animated.View
          style={[
            styles.closeIconContainer,
            {
              transform: [{rotate: closeIconInterpolate}],
            },
          ]}>
          <TouchableOpacity
            onPress={handleCloseModal}
            hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
            <Icon
              name="close-circle"
              size={32}
              color="red"
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Animated header with gradient */}
        <LinearGradient
          colors={['#fff', '#fff', '#fff']}
          start={{x: 0, y: 0}} // Start from the top
          end={{x: 0, y: 1}} // End at the bottom
          style={styles.headerGradient}>
          <Text style={[styles.modalTitle]}>
            {modalData?.title || `${t('freshNotification')}`}
          </Text>
        </LinearGradient>

        {/* Optional animated icon */}
        <View style={styles.lottieContainer}>
          <LottieView
            ref={lottieRef}
            source={require('../../Assets/Animation/notification.json')}
            style={styles.lottieAnimation}
            autoPlay
            loop
            speed={1.2}
          />
        </View>

        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.modalText} numberOfLines={5}>
              {modalData?.Message ||
                'Welcome to our app! Check back for important announcements and updates. We value your feedback and are constantly working to improve your experience.'}
            </Text>
          </ScrollView>
        </View>

        {/* Timer display with progress bar */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {t('autoClosing')} {timeRemaining}s
          </Text>
          <View style={styles.timerBarContainer}>
            <Animated.View
              style={[
                styles.timerBar,
                {
                  width: timerWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
            activeOpacity={0.7}>
            <LinearGradient
              colors={['#0baf9a', '#0ba893']}
              start={{x: 0, y: 0}} // Top
              end={{x: 0, y: 1}} // Bottom
              style={styles.buttonGradient}>
              <Icon
                name="checkmark-circle-outline"
                size={22}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.closeButtonText}>{t('gotIt')}!</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Learn more button */}
          <TouchableOpacity style={styles.learnMoreButton} activeOpacity={0.7}>
            <LinearGradient
              colors={['#f2f2f2', '#d9d9d9']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.buttonGradient}>
              <Icon
                name="information-circle-outline"
                size={22}
                color="#0077b3"
                style={styles.buttonIcon}
              />
              <Text style={styles.learnMoreButtonText}>{t('learnMore')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={{height: '5%'}} />
      </Animated.View>
    );
  };

  return (
    <Modal
      animationType="none" // Handling animations manually
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}>
      <Animated.View
        style={[
          styles.centeredView,
          {
            opacity: fadeAnim,
          },
        ]}>
        <View
          style={[styles.modalView, isExpanded && styles.expandedModalView]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <LottieView
                source={require('../../Assets/Animation/loading.json')}
                style={styles.loadingAnimation}
                autoPlay
                loop
                speed={1.2}
              />
              <Text style={styles.loadingText}>{t('loading')}...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={50} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchModalData}>
                <Text style={styles.retryButtonText}>{t('retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderModalContent()
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

export default AppPopUp;

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: width * 0.88,
    maxHeight: height * 0.6,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  expandedModalView: {
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalContent: {
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  expandedModal: {
    justifyContent: 'space-between',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    borderRadius: 16,
    padding: 2,
  },
  closeIcon: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerGradient: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  expandButton: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f9f906',
    top: -50,
    right: -50,
    zIndex: -1,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ff9900',
    bottom: -30,
    left: -30,
    zIndex: -1,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(13, 163, 134, 0.15)',
    top: 80,
    left: 30,
    zIndex: -1,
  },
  contentContainer: {
    position: 'relative',
    paddingTop: 10,
  },
  // Corner ribbon styles - matching the image
  cornerRibbonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    overflow: 'visible',
    zIndex: 5,
  },
  cornerRibbon: {
    position: 'absolute',
    top: 22,
    right: -55,
    backgroundColor: '#e53935', // Bright red color
    width: 200,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '45deg'}],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cornerRibbonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  lottieContainer: {
    alignItems: 'center',
    marginVertical: 3,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  scrollContent: {
    maxHeight: height * 0.25,
    paddingHorizontal: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
    color: '#4d4d4d',
  },
  timerContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  timerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  timerBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    backgroundColor: '#0ba893',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  closeButton: {
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    flex: 1,
  },
  learnMoreButton: {
    marginLeft: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  learnMoreButtonText: {
    color: '#0077b3',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0da386',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
