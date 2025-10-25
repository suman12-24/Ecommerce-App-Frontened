import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axiosInstance, {
  baseURL,
} from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import appNameController from './Model/appNameController';
import { useTranslation } from 'react-i18next';

const ProductOrderSummary = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userId = useSelector(state => state.auth.userId);
  const cartItems = useSelector(state => state.cart.items);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const selectedAddress = useSelector(state => state.cart.deliveryAddress);
  const appliedCoupon = useSelector(state => state.cart.coupon);
  const priceSummary = useSelector(state => state.cart.priceSummary);
  const [loading, setLoading] = useState(false);
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const cart = cartItems.map(item => {
        return {
          product_id: item.id,
          product_quantity: item.quantity,
        };
      });

      const payload = {
        u_id: userId,
        a_id: selectedAddress.id,
        total: priceSummary.total,
        sub_total: priceSummary.sub_total,
        delivery_charge: priceSummary.delivery_charge,
        discount_coupon_amount: priceSummary.discount_coupon_amount,
        discount_coupon_code: priceSummary.discount_coupon_code,
        cart: cart,
      };

      const response = await axiosInstance.post(
        '/Suhani-Electronics-Backend/f_checkout.php',
        payload,
      );

      if (response?.data) {
        // Navigate to MakePaymentScreen with the payment URL

        // navigation.navigate('MakePaymentScreen', {
        //     payment_url: "https://dhiway.com/wp-content/uploads/2021/09/Artboard-2-1.png"
        // });

        navigation.navigate('MakePaymentScreen2', {
          orderId: response?.data?.order_id,
          totalAmount: priceSummary.total,
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const renderStars = rating => {
    if (!rating) return '☆☆☆☆☆';
    const safeRating = parseFloat(rating) || 0;
    const stars =
      '★'.repeat(Math.floor(safeRating)) +
      '☆'.repeat(5 - Math.floor(safeRating));
    return stars;
  };

  const calculateDiscount = (regular, selling) => {
    if (!regular || !selling) return null;

    const regularPrice = parseFloat(regular);
    const sellingPrice = parseFloat(selling);

    if (isNaN(regularPrice) || isNaN(sellingPrice)) return null;

    if (regularPrice > sellingPrice) {
      const discount = ((regularPrice - sellingPrice) / regularPrice) * 100;
      return `${Math.round(discount)}% Off`;
    }
    return null;
  };

  const fetchCartProductsCurrentUpdates = async () => {
    try {
      setIsPageLoading(true); // Start loading

      const response = await axiosInstance.post(
        '/Suhani-Electronics-Backend/f_fetch_cart.php',
        { u_id: userId },
      );

      if (response?.data?.data) {
        const dataArray = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        const updatedStockArray = dataArray.map(item => ({
          id: item.id,
          stock: parseInt(item.stock || 0),
        }));

        // 🔹 Check if any product has stock < 1 and show an alert before navigating
        if (updatedStockArray.some(item => item.stock < 1)) {
          Alert.alert(`${t('somethingWentWrong')}`, `${t('reviewYourCart')}`, [
            { text: 'OK', onPress: () => navigation.navigate('CartScreen') },
          ]);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching cart products:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setTimeout(() => {
        setIsPageLoading(false);
      }, 800); // Small delay for a smooth UI experience
    }
  };

  useEffect(() => {
    fetchCartProductsCurrentUpdates();
  }, []);

  // If the page is loading, show a full-screen loader
  if (isPageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={appNameController.statusBarColor}
        />
        <Text style={styles.loadingText}>{t('loadingOrderSummary')}</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.pageContainer}>
          <Text style={styles.pageTitle}>{t('orderSummary')}</Text>

          {/* Products Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <MaterialIcons name="shopping-bag" size={20} color="#0ba893" />
              <Text style={styles.sectionTitle}>
                {t('products')} ({cartItems.length})
              </Text>
            </View>

            {cartItems.map(item => {
              return (
                <View key={item.id} style={styles.itemContainer}>
                  <Image
                    source={{
                      uri: item?.img_1
                        ? `${baseURL}/Product_image/${item.img_1}`
                        : null,
                    }}
                    style={styles.productImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {item?.name || 'Product Name'}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>
                        {renderStars(item?.rating)}
                      </Text>
                      <Text style={styles.ratingText}>
                        {item?.rating || '0'} (
                        {(item?.reviewCount || 0).toLocaleString()} reviews)
                      </Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>
                        ₹{item?.selling_price || '0'}
                      </Text>
                      <Text style={styles.originalPrice}>
                        {' '}
                        ₹{item?.regular_price || '0'}
                      </Text>
                      <Text style={styles.discount}>
                        {calculateDiscount(
                          item?.regular_price,
                          item?.selling_price,
                        )}
                      </Text>
                    </View>

                    <View style={styles.quantityContainer}>
                      <Text style={{ fontSize: 15, fontWeight: '500' }}>
                        {t('quentity')} :{' '}
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '500' }}>
                        {item.quantity}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Selected Delivery Address */}
          {selectedAddress && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <MaterialIcons name="location-on" size={20} color="#0ba893" />
                <Text style={styles.sectionTitle}>{t('deliveryAddress')}</Text>
              </View>

              <View style={styles.addressSummary}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.addressName}>{t('name')} : </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#424242',
                      marginBottom: 4,
                    }}>
                    {selectedAddress.name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.addressName}>{t('address')} : </Text>
                  <Text numberOfLines={2} style={styles.addressText}>
                    {selectedAddress.address}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', width: '100%' }}>
                  <Text style={[styles.addressName, { width: '25%' }]}>
                    {t('landMark')}
                  </Text>
                  <Text style={styles.addressName}> :</Text>
                  <Text
                    numberOfLines={3}
                    style={[
                      styles.addressText,
                      { width: '75%', paddingLeft: 5 },
                    ]}>
                    {selectedAddress.landmark},{selectedAddress.city},{' '}
                    {selectedAddress.state} - {selectedAddress.pin}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.addressName}>{t('call')} : </Text>
                  <Text style={styles.addressMobile}>
                    <MaterialIcons name="phone" size={14} color="#666" />{' '}
                    {selectedAddress.mobile}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment Summary */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <MaterialIcons name="receipt" size={20} color="#0ba893" />
              <Text style={styles.sectionTitle}>{t('priceDetails')}</Text>
            </View>

            <View style={styles.priceSummary}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('subTotal')}</Text>
                <Text style={styles.priceValue}>₹{priceSummary.sub_total}</Text>
              </View>
              <View style={[styles.priceRow]}>
                <Text style={[styles.priceLabel, { color: 'red' }]}>
                  {t('deliveryCharge')}
                </Text>
                <Text style={[styles.priceValue, { color: 'red' }]}>
                  ₹{priceSummary.delivery_charge}
                </Text>
              </View>
              {priceSummary.discount_coupon_code && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: 'green' }]}>
                    {priceSummary.discount_coupon_code}
                  </Text>
                  <Text style={styles.discountValue}>
                    - ₹{priceSummary.discount_coupon_amount}
                  </Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalValue}>₹{priceSummary.total}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>{t('total')}:</Text>
          <Text style={styles.bottomTotalValue}>₹{priceSummary.total}</Text>
        </View>
        {loading ? (
          <View style={[styles.placeOrderButton, { flexDirection: 'row' }]}>
            <ActivityIndicator size="small" color={'#fff'} />
            <Text
              style={[
                styles.placeOrderButtonText,
                { marginLeft: 5, fontSize: 13 },
              ]}>
              {t('redirectToPayment')}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}>
            <Text style={styles.placeOrderButtonText}>{t('makePayment')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    marginBottom: 70, // Space for the fixed bottom button
  },
  pageContainer: {
    padding: 15,
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212121',
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },

  changeLink: {
    color: '#2874f0',
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    resizeMode: 'contain',
  },
  itemDetails: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'space-between',
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  addressSummary: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 4,
  },
  addressMobile: {
    fontSize: 14,
    color: '#424242',
    marginTop: 4,
  },
  priceSummary: {
    padding: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#616161',
  },
  priceValue: {
    fontSize: 14,
    color: '#212121',
  },
  freeDelivery: {
    fontSize: 14,
    color: '#388e3c',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 14,
    color: '#388e3c',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 0.8,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  totalContainer: {
    flex: 1,
    paddingHorizontal: 6,
  },
  bottomTotalLabel: {
    fontSize: 17,
    color: '#616161',
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  placeOrderButton: {
    backgroundColor: '#0ba893',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  itemName: {
    fontSize: 16,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rating: {
    color: '#ffd700',
    marginRight: 4,
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    color: '#878787',
  },
  seller: {
    fontSize: 14,
    color: '#878787',
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#878787',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discount: {
    color: '#388e3c',
    fontSize: 14,
  },
  // New loading container style
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f3f6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default ProductOrderSummary;

// in this code , implement that add a cash on delivery with radio button .
// in the initial StepBack, the make payment button will be blur when check on the radio button ,
// then it will be highlighted
