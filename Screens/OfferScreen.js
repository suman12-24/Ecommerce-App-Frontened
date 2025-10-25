import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Pattern,
} from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import {useTranslation} from 'react-i18next';
const OfferScreen = () => {
  const {t} = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Create refs for coupon animations
  const couponAnimRefs = useRef({}).current;
  const pulseAnimRefs = useRef({}).current;

  useEffect(() => {
    fetchOffers();

    // Start fade-in and slide-up animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Prepare animations when offers change
  useEffect(() => {
    // Initialize animations for each offer
    offers.forEach((offer, index) => {
      const id = offer.id?.toString() || `offer-${index}`;

      // Create animation values if they don't exist
      if (!couponAnimRefs[id]) {
        couponAnimRefs[id] = new Animated.Value(0);
        pulseAnimRefs[id] = new Animated.Value(1);

        // Start entry animation with delay based on index
        Animated.spring(couponAnimRefs[id], {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [offers]);

  // Handle pulse animation when selected coupon changes
  useEffect(() => {
    if (selectedCoupon && pulseAnimRefs[selectedCoupon]) {
      // Create pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimRefs[selectedCoupon], {
            toValue: 1.03,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimRefs[selectedCoupon], {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );

      // Start the animation
      pulseAnimation.start();

      // Clean up animation when component unmounts or selection changes
      return () => {
        pulseAnimation.stop();
        // Reset pulse value
        if (pulseAnimRefs[selectedCoupon]) {
          pulseAnimRefs[selectedCoupon].setValue(1);
        }
      };
    }
  }, [selectedCoupon]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        '/Suhani-Electronics-Backend/f_offer.php',
      );
      if (response.data && response.data.success && response.data.data) {
        // Filter only active offers
        const activeOffers = response.data.data.filter(
          item => item.status === 1 && item.coupon_delete === 0,
        );
        setOffers(activeOffers);
      } else {
        setError('No offers available at the moment');
      }
    } catch (err) {
      setError('Failed to load offers. Please try again.');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render a single coupon card with animations
  const renderCouponCard = ({item, index}) => {
    const id = item.id?.toString() || `offer-${index}`;
    const isSelected = selectedCoupon === item.id;

    // Get animation values or create defaults if not initialized yet
    const animValue = couponAnimRefs[id] || new Animated.Value(1);
    const pulseValue = pulseAnimRefs[id] || new Animated.Value(1);

    // Calculate valid until date
    const validUntil = item?.date || 'Date Not Available';
    // Get discount percentage
    const discountPercentage = item?.max_disc || 'Discount Not Available';
    // Get minimum order value
    const minOrderValue = item?.min_value || 0;

    return (
      <TouchableOpacity activeOpacity={1}>
        <Animated.View
          style={[
            styles.couponCard,
            {
              opacity: animValue,
              transform: [
                {
                  scale: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                // Apply pulse if selected
                isSelected ? {scale: pulseValue} : {scale: 1},
              ],
            },
          ]}>
          {/* Left Content */}
          <View style={styles.leftContent}>
            {/* Logo and Code Section */}
            <View style={styles.logoSection}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={20}
                  color="#fff"
                />
              </View>
              <View style={styles.logoTextContainer}>
                <Text style={styles.logoText}>{item.code}</Text>
              </View>
            </View>

            {/* Coupon Text */}
            <View style={styles.couponTextSection}>
              <Text numberOfLines={2} style={styles.couponText}>
                {item?.description || 'Description Not Available'}
              </Text>

              {/* Display max discount and min order value */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="currency-inr"
                    size={18}
                    color="#666"
                  />
                  <Text style={styles.detailLabel}>{t('maxDiscount')}:</Text>
                  <Text style={styles.detailValue}>
                    ₹{item?.max_disc || '0'}
                  </Text>
                </View>
                <View style={[styles.detailItem]}>
                  <MaterialCommunityIcons
                    name="cart-outline"
                    size={18}
                    color="#666"
                  />
                  <Text style={styles.detailLabel}>{t('minOrder')}:</Text>
                  <Text style={styles.detailValue}>
                    ₹{item?.min_value || '0'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Valid Until */}
            <View style={styles.validSection}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={18}
                color="#666"
                style={{marginRight: 4}}
              />
              <Text style={styles.validText}>
                {t('validUntill')} {validUntil}
              </Text>
            </View>
          </View>

          {/* Right Banner with gradient */}
          <View style={styles.rightBanner}>
            <Svg style={styles.bannerSvg} viewBox="0 0 120 220">
              <Defs>
                <LinearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%">
                  <Stop offset="0%" stopColor="#0fbfaa" />
                  <Stop offset="100%" stopColor="#0a9f8a" />
                </LinearGradient>
                {/* Pattern for background */}
                <Pattern
                  id="pattern"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse">
                  <Circle cx="5" cy="5" r="1" fill="rgba(255,255,255,0.1)" />
                </Pattern>
              </Defs>
              <G>
                <Path
                  d="M0,0 L120,0 L120,140 L60,180 L0,140 Z"
                  fill="url(#gradient)"
                />
                <Path
                  d="M0,0 L120,0 L120,140 L60,180 L0,140 Z"
                  fill="url(#pattern)"
                />
              </G>
            </Svg>
            <Text style={styles.offText}>{t('flat')}</Text>
            <Text style={styles.percentageText}>₹{discountPercentage}</Text>
          </View>

          {/* Dotted line separator */}
          <View style={styles.dottedLine}>
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <View key={i} style={styles.dot} />
              ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Loading state with animation
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0baf9a" />
        <Animated.Text
          style={[
            styles.loadingText,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {t('findingBestDeals')}
        </Animated.Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={50}
          color="#ff6b6b"
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOffers}>
          <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        }}>
        <Text style={styles.headerText}>{t('exclusiveOffer')}</Text>
        <Text style={styles.subHeaderText}>{t('applyTheseCoupans')}</Text>
      </Animated.View>

      {offers.length > 0 ? (
        <FlatList
          data={offers}
          showsVerticalScrollIndicator={false}
          renderItem={renderCouponCard}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MaterialCommunityIcons
            name="tag-off-outline"
            size={60}
            color="#ccc"
          />
          <Text style={styles.noOffersText}>{t('noActiveCoupan')}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchOffers}>
            <Text style={styles.refreshButtonText}>{t('refresh')}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <View style={{height: 50}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
    letterSpacing: 0.5,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  listContainer: {
    paddingBottom: 8,
  },
  couponCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    height: 180,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  separator: {
    height: 12,
  },
  leftContent: {
    flex: 1,
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
    position: 'relative',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0baf9a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  logoTextContainer: {
    marginLeft: 10,
    backgroundColor: '#f0f9f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0baf9a',
    letterSpacing: 0.5,
  },
  couponTextSection: {
    flex: 1,
    width: '100%',
    paddingRight: 10,
  },
  couponText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  detailsContainer: {
    marginTop: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  validSection: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 12,
  },
  validText: {
    fontSize: 14,
    color: '#666',
  },
  rightBanner: {
    width: 100,
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerSvg: {
    position: 'absolute',
    width: '100%',
    height: '90%',
    left: 0,
    top: 0,
    right: 0,
  },
  percentageText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',

    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  offText: {
    marginTop: -70,
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#0baf9a',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0baf9a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noOffersText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#0baf9a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 2,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dottedLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    marginLeft: -5,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  copyButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  copyButtonInner: {
    flexDirection: 'row',
    backgroundColor: '#0baf9a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default OfferScreen;
