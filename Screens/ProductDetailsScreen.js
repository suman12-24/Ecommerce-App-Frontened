import React, {useState, useRef, useEffect} from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
  FlatList,
  Animated,
  BackHandler,
  Alert,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import axiosInstance, {
  baseURL,
} from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart} from '../redux/cartSlice';
import {addCartToDatabase} from '../redux/addCartToDatabase';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {addToWishList, removeFromWishList} from '../redux/wishListSlice';
import {deleteWishListItemFromDatabase} from '../redux/deleteWishListItemFromDatabase';
import {addWishListToDatabase} from '../redux/addWishListToDatabase';
import EnhancedWishlistButton from './Components/EnhancedWishlistButton';
import appNameController from './Model/appNameController';
import StockIndicator from './Components/StockIndicator';
import {useTranslation} from 'react-i18next';
const {width, height} = Dimensions.get('window');

const ProductDetailsScreen = ({route, navigation}) => {
  const {t} = useTranslation();
  const {token} = useSelector(state => state.auth);
  const {item, fromDeepLink} = route.params || {};
  const [product, setProduct] = useState(item);
  const [isLoading, setIsLoading] = useState(!!fromDeepLink);
  const dispatch = useDispatch();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Cart message animation values
  const cartMessageOpacity = useRef(new Animated.Value(0)).current;
  const cartMessageTranslateY = useRef(new Animated.Value(-50)).current;
  const [cartMessageVisible, setCartMessageVisible] = useState(false);

  // Wishlist message animation values
  const wishlistMessageOpacity = useRef(new Animated.Value(0)).current;
  const wishlistMessageTranslateY = useRef(new Animated.Value(-50)).current;
  const [wishlistMessageVisible, setWishlistMessageVisible] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(true);

  const cart = useSelector(state => state.cart);
  const cartItems = Array.isArray(cart) ? cart : cart?.items || [];
  const wishList = useSelector(state => state.wishList);

  const [loadingStates, setLoadingStates] = useState([]);
  const flatListRef = useRef(null);

  // Fetch product details for deep links
  useEffect(() => {
    if (fromDeepLink && item?.id) {
      fetchProductDetails(item.id);
    }
  }, [fromDeepLink, item]);

  // Initialize loading states for images
  useEffect(() => {
    if (product) {
      const images = getProductImages(product);
      setLoadingStates(images.map(() => true));
    }
  }, [product]);

  // Handle back button
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleBackPress();
          return true; // Prevent default behavior
        },
      );
      return () => backHandler.remove();
    }, []),
  );

  const fetchProductDetails = async productId => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/Suhani-Electronics-Backend/f_product_details.php?p_id=${productId}`,
      );

      const productData = response.data.data;
      if (response.data.success) {
        setProduct(productData);
        navigation.setParams({
          item: productData,
          fromDeepLink: false,
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductImages = product => {
    if (!product) return [];
    return [
      {id: '1', uri: `${baseURL}/Product_image/${product.img_1}`},
      {id: '2', uri: `${baseURL}/Product_image/${product.img_2}`},
      {id: '3', uri: `${baseURL}/Product_image/${product.img_3}`},
      {id: '4', uri: `${baseURL}/Product_image/${product.img_4}`},
    ].filter(img => product[`img_${img.id}`]); // Filter out undefined images
  };

  const handleIndicatorPress = index => {
    flatListRef.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });
    setActiveImageIndex(index);
  };

  const handleAddToCart = async product => {
    if (!token) {
      Alert.alert(`${t('loginRequired')}`, `${t('loginToAddCart')}`);
      navigation.navigate('AccountStack', {
        screen: 'AuthScreen',
      });
      return;
    }

    dispatch(addToCart(product));
    await addCartToDatabase(product.id);
    showCartMessage();
  };

  const toggleFavorite = async productId => {
    if (!token) {
      Alert.alert(`${t('loginRequired')}`, `${t('loginToAddWhislist')}`);
      navigation.navigate('BottomTabNavigator', {
        screen: 'Account',
        params: {screen: 'AuthScreen'},
      });
      return;
    }

    const isAdding = !wishList.includes(productId);
    setIsAddingToWishlist(isAdding);

    if (wishList.includes(productId)) {
      dispatch(removeFromWishList(productId));
      await deleteWishListItemFromDatabase(productId);
    } else {
      dispatch(addToWishList(productId));
      await addWishListToDatabase(productId);
    }

    showWishlistMessage();
  };

  const showWishlistMessage = () => {
    setWishlistMessageVisible(true);

    Animated.parallel([
      Animated.timing(wishlistMessageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(wishlistMessageTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(wishlistMessageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(wishlistMessageTranslateY, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setWishlistMessageVisible(false);
        wishlistMessageTranslateY.setValue(-50);
      });
    }, 1500);
  };

  const showCartMessage = () => {
    setCartMessageVisible(true);

    Animated.parallel([
      Animated.timing(cartMessageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cartMessageTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cartMessageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cartMessageTranslateY, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCartMessageVisible(false);
        cartMessageTranslateY.setValue(-50);
      });
    }, 1500);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const goToCart = () => {
    navigation.navigate('BottomTabNavigator', {
      screen: `${t('cart')}`,
      params: {screen: 'CartScreen'},
    });
  };

  const shareProduct = async () => {
    try {
      const webLink = `${baseURL}/Suhani-Electronics-Backend/openapp.php?id=${product.id}`;
      const message = `${t('checkOutProduct')}: ${product.name}\n${t(
        'price',
      )}: ₹${product.selling_price}\n\n${t('openInApp')}: ${webLink}`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

      const canOpenWhatsapp = await Linking.canOpenURL(whatsappUrl);

      if (canOpenWhatsapp) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Share.share({message});
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share the product.');
    }
  };

  const isProductInCart = productId => {
    if (!cartItems || !Array.isArray(cartItems)) return false;
    return cartItems.some(item => {
      const itemId =
        typeof item === 'object' ? item.id || item.productId : item;
      return itemId === productId;
    });
  };

  const renderImageItem = ({item, index}) => (
    <View style={styles.imageSlide}>
      {loadingStates[index] && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={appNameController.activityIndicatorColor}
          />
        </View>
      )}
      <Image
        source={{uri: item.uri}}
        style={styles.productImage}
        onLoad={() => {
          const newLoadingStates = [...loadingStates];
          newLoadingStates[index] = false;
          setLoadingStates(newLoadingStates);
        }}
        onError={() => {
          const newLoadingStates = [...loadingStates];
          newLoadingStates[index] = false;
          setLoadingStates(newLoadingStates);
        }}
      />
    </View>
  );

  const calculateDiscount = (regular, selling) => {
    const regularPrice = parseFloat(regular);
    const sellingPrice = parseFloat(selling);
    if (regularPrice > sellingPrice) {
      const discount = ((regularPrice - sellingPrice) / regularPrice) * 100;
      return `${Math.round(discount)}% ${t('off')}`;
    }
    return null;
  };

  const renderImageIndicator = () => (
    <View style={styles.indicatorContainer}>
      {getProductImages(product).map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleIndicatorPress(index)}
          activeOpacity={0.7}>
          <View
            style={[
              styles.indicator,
              index === activeImageIndex && styles.activeIndicator,
              loadingStates[index] && styles.loadingIndicator,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderImageCount = () => (
    <View style={styles.imageCountContainer}>
      <Text style={styles.imageCountText}>
        {activeImageIndex + 1}/{getProductImages(product).length}
      </Text>
    </View>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 20, 40, 60, 80, 100],
    outputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    extrapolate: 'clamp',
  });

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}>
        <ActivityIndicator
          size="large"
          color={appNameController.activityIndicatorColor}
        />
        <Text
          style={{
            marginTop: 20,
            fontSize: 16,
            color: '#333',
          }}>
          {t('loadingProductDetails')}
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff3333" />
        <Text style={styles.errorText}>{t('productNotFound')}</Text>
        <TouchableOpacity
          style={styles.backToHomeButton}
          onPress={() =>
            navigation.navigate('BottomTabNavigator', {screen: 'Home'})
          }>
          <Text style={styles.backToHomeText}>{t('backToHome')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const productImages = getProductImages(product);

  return (
    <View style={styles.container}>
      {/* Cart Message Animation */}
      {cartMessageVisible && (
        <Animated.View
          style={[
            styles.cartMessage,
            {
              opacity: cartMessageOpacity,
              transform: [{translateY: cartMessageTranslateY}],
            },
          ]}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.cartMessageText}>{t('addedToCart')}</Text>
        </Animated.View>
      )}

      {/* Wishlist Message Animation */}
      {wishlistMessageVisible && (
        <Animated.View
          style={[
            styles.wishlistMessage,
            {
              opacity: wishlistMessageOpacity,
              transform: [{translateY: wishlistMessageTranslateY}],
              backgroundColor: isAddingToWishlist ? '#e91e63' : '#ff6b6b',
            },
          ]}>
          <FontAwesome
            name={isAddingToWishlist ? 'heart' : 'heart-o'}
            size={24}
            color="#fff"
          />
          <Text style={styles.wishlistMessageText}>
            {isAddingToWishlist ? t('addedtowhilist') : t('removeFromWhislist')}
          </Text>
        </Animated.View>
      )}

      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, {opacity: headerOpacity}]}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}>
        {/* Image Gallery */}
        {productImages.length > 0 ? (
          <View style={styles.imageContainer}>
            <FlatList
              ref={flatListRef}
              data={productImages}
              renderItem={renderImageItem}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                const newIndex = Math.round(
                  e.nativeEvent.contentOffset.x / width,
                );
                setActiveImageIndex(newIndex);
              }}
              snapToInterval={width}
              decelerationRate="fast"
            />
            {renderImageIndicator()}
            {renderImageCount()}
          </View>
        ) : (
          <View style={[styles.imageContainer, styles.noImageContainer]}>
            <FontAwesome name="image" size={60} color="#cccccc" />
            <Text style={styles.noImageText}>
              {t('noProductImageAvilable')}
            </Text>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.productTitle}>{product.name}</Text>
            {product.rating && (
              <View style={styles.ratingContainer}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{product.rating} ★</Text>
                </View>
                <Text style={styles.ratingCount}>
                  {product.reviews || 0} {t('ratings')}
                </Text>
              </View>
            )}
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>₹{product.selling_price}</Text>
            {parseFloat(product.regular_price) >
              parseFloat(product.selling_price) && (
              <>
                <Text style={styles.originalPrice}>
                  ₹{product.regular_price}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {calculateDiscount(
                      product.regular_price,
                      product.selling_price,
                    )}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* stock left */}
          <StockIndicator stock={product.stock} />

          {/* Specifications */}
          {product.description && (
            <View style={styles.specificationsSection}>
              <Text style={styles.sectionTitle}>{t('specification')}</Text>
              <View style={styles.specCard}>
                {(() => {
                  try {
                    const specs = JSON.parse(product.description);
                    return Object.entries(specs).map(([key, value]) => (
                      <Text key={key} style={styles.specItem}>
                        <Text style={styles.specKey}>{key}: </Text>
                        <Text style={styles.specValue}>{value}</Text>
                      </Text>
                    ));
                  } catch (error) {
                    return (
                      <Text style={styles.specItem}>{product.description}</Text>
                    );
                  }
                })()}
              </View>
            </View>
          )}

          {/* Add more sections as needed */}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <EnhancedWishlistButton
          size={28}
          color="red"
          isLiked={wishList.includes(product.id)}
          isLoggedIn={!!token}
          onToggle={() => toggleFavorite(product.id, product.name)}
          style={styles.wishlistButton}
        />

        {product.stock <= 0 ? (
          // Out of stock button - disabled
          <TouchableOpacity
            style={[styles.cartButton, styles.disabledButton]}
            disabled={true}>
            <MaterialCommunityIcons name="cart-off" size={20} color="#ff3333" />
            <Text style={[styles.buttonText, styles.disabledText]}>
              {t('outOfStock')}
            </Text>
          </TouchableOpacity>
        ) : isProductInCart(product.id) ? (
          // Item is in cart - show Go to Cart button
          <TouchableOpacity
            style={[
              styles.goToCartButton,
              {backgroundColor: appNameController.goToCartButtonColor},
            ]}
            onPress={goToCart}>
            <MaterialCommunityIcons name="cart-check" size={18} color="#fff" />
            <Text style={styles.buttonText}>{t('goToCart')}</Text>
          </TouchableOpacity>
        ) : (
          // Item is in stock and not in cart - show Add to Cart button
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleAddToCart(product)}>
            <Text style={[styles.buttonText, {color: '#fff'}]}>
              {t('addToCart')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={22} color="#000" />
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={shareProduct}>
        <Ionicons name="share-social-outline" size={22} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cartMessage: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: '#0ba893',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartMessageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  wishlistMessage: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: '#e91e63',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wishlistMessageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 3,
    justifyContent: 'center',
    paddingHorizontal: 50,
    paddingTop: 5,
  },
  headerTitle: {
    marginLeft: 7,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  imageContainer: {
    height: width,
    backgroundColor: '#fff',
    position: 'relative',
  },
  imageSlide: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // FlipKart's light gray background
  },
  productImage: {
    width: '100%',
    height: '90%',
    resizeMode: 'contain',
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 8,
  },

  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 20,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: '#0ba893',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  ratingCount: {
    color: '#666',
    fontSize: 14,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  originalPrice: {
    fontSize: 18,
    color: '#666',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  discountBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  discountText: {
    color: '#0ba893',
    fontSize: 14,
    fontWeight: '500',
  },
  offersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 10,
  },
  offerText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  deliverySection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderColor: '#f5f5f5',
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#000',
  },
  changeButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  changeButtonText: {
    color: '#2874f0',
    fontSize: 14,
    fontWeight: '500',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
  },
  freeDelivery: {
    color: '#0ba893',
    fontWeight: '500',
  },
  specificationsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  specCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
  },
  specValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  featuresSection: {
    padding: 20,
    flexDirection: 'row',
    gap: 15,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sellerSection: {
    padding: 20,
  },
  sellerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  sellerRating: {
    backgroundColor: '#0ba893',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sellerRatingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  viewSellerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  viewSellerText: {
    color: '#2874f0',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  wishlistButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  cartButton: {
    flex: 1,
    height: 50,
    marginLeft: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: appNameController.addToCartButtonColor,
    marginRight: 10,
  },
  disabledButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    backgroundColor: appNameController.outOfStockButtonColor,
  },
  disabledText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    color: '#ff3333',
  },
  buyButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shareButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goToCartButton: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 25,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingIndicator: {
    backgroundColor: '#ccc',
  },
  imageCountContainer: {
    position: 'absolute',
    top: 22,
    right: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    color: '#666',
    fontSize: 16,
  },
});

export default ProductDetailsScreen;
