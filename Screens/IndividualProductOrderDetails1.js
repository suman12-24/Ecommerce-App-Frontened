import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  BackHandler,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import axiosInstance, {
  baseURL,
} from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import appNameController from './Model/appNameController';
import {useTranslation} from 'react-i18next';
const {width} = Dimensions.get('window');

const IndividualProductOrderDetails = ({route, navigation}) => {
  const {t} = useTranslation();
  const [orderData, setOrderData] = useState(null);
  const [appInfo, setAppInfo] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const viewInvoice = () => {
    navigation.navigate('InvoicePdf', {orderData, appInfo});
  };
  // Color theme
  const COLORS = {
    primary: '#0ba893',
    primaryDark: '#0ba893',
    secondary: '#FB9400',
    secondaryDark: '#F47B0A',
    accent: 'green',
    surface: '#FFFFFF',
    background: '#F8F9FB',
    text: '#1E222B',
    textSecondary: '#616A7D',
    success: '#4CAF50',
    error: '#FF6B6B',
    warning: '#FFC75F',
    divider: '#E4E4E4',
  };

  // Assuming we receive orderId and userId as route params
  const {orderId, userId} = route?.params;

  useEffect(() => {
    fetchOrderDetails();

    // Animate elements when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    // Cleanup function
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
    return true; // Prevents default behavior
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/Suhani-Electronics-Backend/f_order_details.php?o_id=${orderId}&u_id=${userId}`,
      );
console.table('response',response?.data);
      if (response.data && response?.data?.success) {
        setOrderData(response.data);
        const responseAppInfo = await axiosInstance.get(
          `/Suhani-Electronics-Backend/f_app_info.php`,
        );
        setAppInfo(responseAppInfo?.data);
      } else {
        setError('Failed to load order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('An error occurred while fetching order details');
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel an order
  const handleCancelOrder = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        '/Suhani-Electronics-Backend/f_order_cancel.php',
        {
          o_id: orderId,
        },
      );
      if (response.data && response.data.success) {
        // Refresh order data to get updated status
        await fetchOrderDetails();

        // Show success message
        Alert.alert(`${t('orderCancelled')}`, `${t('ordCanRefProcess')}`, [
          {text: 'OK'},
        ]);
      } else {
        // Show error message
        Alert.alert(
          'Error',
          response?.data?.message ||
            'Failed to cancel order. Please try again later.',
          [{text: 'OK'}],
        );
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      Alert.alert(
        'Error',
        'An error occurred while cancelling your order. Please try again later.',
        [{text: 'OK'}],
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate delivery progress
  const getProgressSteps = () => {
    if (!orderData) return [];

    const deliveryStatus = orderData.data.delivery_status;
    const orderCancelled = orderData.data.order_cancel === 1;
    // If order is cancelled, return a modified progress steps array
    if (orderCancelled) {
      return [
        {label: 'Ordered', completed: true, icon: 'shopping-cart'},
        {label: 'Cancelled', completed: true, icon: 'cancel', isCancel: true},
      ];
    }
    // Normal order progress
    const steps = [
      {label: 'Ordered', completed: true, icon: 'shopping-cart'},
      {
        label: 'Shipped',
        completed: deliveryStatus >= 1,
        icon: 'local-shipping',
      },
      {
        label: 'Out for Delivery',
        completed: deliveryStatus >= 2,
        active: deliveryStatus === 2,
        icon: 'local-shipping',
      },
      {
        label: 'Delivered',
        completed: deliveryStatus >= 3,
        active: deliveryStatus === 3,
        icon: 'done-all',
      },
    ];
    return steps;
  };

  // Format date string to more readable format
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = amount => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  // Loading animation
  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: COLORS.background}]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('loadingOrderDetails')}</Text>
        <Text style={styles.loadingSubText}>{t('fetchOrder')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.errorContainer, {backgroundColor: COLORS.background}]}>
        <MaterialIcons name="error-outline" size={70} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchOrderDetails}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.retryButtonGradient}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (!orderData) {
    return (
      <View
        style={[styles.errorContainer, {backgroundColor: COLORS.background}]}>
        <MaterialIcons name="search-off" size={70} color={COLORS.warning} />
        <Text style={styles.errorText}>{t('noOrderFound')}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.retryButtonGradient}>
            <Text style={styles.retryButtonText}>{t('goBack')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const progressSteps = getProgressSteps();
  const completedSteps = progressSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / progressSteps.length) * 100;

  // Determine order status text and color// Determine order status text and color
  const getOrderStatusInfo = () => {
    const {order_status, delivery_status, order_cancel, return_refund} =
      orderData.data;

    if (order_cancel === 1) return {text: 'Cancelled', color: '#FF0000'}; // Red
    if (return_refund === 1)
      return {text: 'Returned/Refunded', color: '#FFA500'}; // Orange
    if (delivery_status === 3) return {text: 'Delivered', color: '#008000'}; // Green
    if (delivery_status === 2)
      return {text: 'Out for Delivery', color: '#FFD700'}; // Yellow/Gold
    if (delivery_status === 1) return {text: 'Shipped', color: '#1E90FF'}; // Dodger Blue
    if (order_status === 1) return {text: 'Processing', color: '#9932CC'}; // Purple
    return {text: 'Ordered', color: COLORS.primary};
  };

  const statusInfo = getOrderStatusInfo();

  // Function to handle order status actions
  const handleStatusAction = () => {
    const {order_cancel, return_refund, delivery_status} = orderData.data;

    if (order_cancel === 1) {
      Alert.alert(
        'Order Cancelled',
        'This order has been cancelled. Contact customer support for more information.',
      );
      return;
    }

    if (return_refund === 1) {
      Alert.alert(
        'Order Returned',
        'This order has been returned. Refund is being processed.',
      );
      return;
    }

    if (delivery_status < 3) {
      Alert.alert(
        'Track Order',
        'Would you like to track your order in real-time?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Track Now'},
        ],
      );
      return;
    }

    Alert.alert(
      'Order Delivered',
      'Your order has been delivered successfully!',
    );
  };

  const handleCopyOrderId = () => {
    // Implement clipboard functionality
    // Clipboard.setString(orderData.data.id.toString());
    Alert.alert('Copied', `Order ID ${orderData.data.id} copied to clipboard`);
  };

  // Header animation configuration
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [-50, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      <StatusBar
        backgroundColor={appNameController.statusBarColor}
        barStyle="light-content"
      />
      {/* Animated header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            opacity: headerOpacity,
            transform: [{translateY: headerTranslate}],
            backgroundColor: COLORS.primaryDark,
          },
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orderDetails')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleCopyOrderId}
            style={styles.copyButton}>
            <MaterialIcons name="content-copy" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={[styles.container, {backgroundColor: COLORS.background}]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}>
        {/* Order ID and Date Banner */}
        <Animated.View
          style={[
            styles.orderBanner,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.orderBannerGradient}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderIdLabel}>{t('orderId')}</Text>
              <View style={styles.orderIdRow}>
                <Text style={styles.orderId}>#{orderData.data.id}</Text>
                <TouchableOpacity onPress={handleCopyOrderId}>
                  <MaterialIcons
                    name="content-copy"
                    size={18}
                    color="rgba(255,255,255,0.8)"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.orderDateContainer}>
              <Text style={styles.orderDateLabel}>{t('orderDate')}</Text>
              <Text style={styles.orderDate}>
                {formatDate(orderData.data.order_date)}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Order Status Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
              marginTop: 10,
            },
          ]}>
          <View style={styles.statusOverviewContainer}>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusOverviewTitle}>{t('orderStatus')}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: statusInfo.color + '20'},
                ]}>
                <Text
                  style={[styles.statusBadgeText, {color: statusInfo.color}]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.statusActionButton,
                {backgroundColor: statusInfo.color},
              ]}
              onPress={handleStatusAction}>
              <Text style={styles.statusActionText}>
                {statusInfo.text === 'Delivered'
                  ? `${t('leaveReview')}`
                  : `${t('trackOrder')}`}
              </Text>
              <MaterialIcons
                name={
                  statusInfo.text === 'Delivered'
                    ? 'rate-review'
                    : 'location-searching'
                }
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.timelineContainer}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBackground} />
              {orderData.data.order_cancel === 1 ? (
                // For cancelled orders, show a red progress bar
                <View
                  style={[
                    styles.progressFill,
                    {width: '100%', backgroundColor: COLORS.error},
                  ]}
                />
              ) : (
                // For normal orders, show the regular progress bar
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: COLORS.primary,
                    },
                  ]}
                />
              )}

              {progressSteps.map((step, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepIndicator,
                    {
                      left: `${(index / (progressSteps.length - 1)) * 100}%`,
                      backgroundColor: step.completed
                        ? step.isCancel
                          ? COLORS.error
                          : COLORS.primary
                        : COLORS.background,
                      borderColor: step.completed
                        ? step.isCancel
                          ? COLORS.error
                          : COLORS.primary
                        : COLORS.divider,
                    },
                  ]}>
                  {step.completed && (
                    <MaterialIcons
                      name={step.isCancel ? 'close' : 'check'}
                      size={14}
                      color="#fff"
                    />
                  )}
                </View>
              ))}
            </View>

            <View style={styles.stepsLabelContainer}>
              {progressSteps.map((step, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepLabelContainer,
                    {
                      left: `${(index / (progressSteps.length - 1)) * 100}%`,
                      marginLeft:
                        index === 0
                          ? 0
                          : index === progressSteps.length - 1
                          ? -80
                          : -40,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: step.completed
                          ? step.isCancel
                            ? COLORS.error
                            : COLORS.text
                          : COLORS.textSecondary,
                        fontWeight: step.completed ? '600' : '400',
                      },
                    ]}>
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Products Details Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.cardHeader}>
            <MaterialIcons name="inventory-2" size={22} color="#fff" />
            <Text style={styles.cardTitle}>{t('productDetails')}</Text>
          </LinearGradient>
          {orderData.order_products.map((product, index) => (
            <View
              key={index}
              style={[
                styles.productContainer,
                index > 0 && styles.productDivider,
              ]}>
              <View style={styles.productImageContainer}>
                <Image
                  source={{uri: `${baseURL}/Product_image/${product.image}`}}
                  style={styles.productImage}
                  resizeMode="contain"
                />
                <View
                  style={[styles.quantityBadge, {backgroundColor: '#bfbfbf'}]}>
                  <Text style={styles.productQuantity}>
                    Qty: {product.quantity}
                  </Text>
                </View>
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.p_name}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.productPrice, {color: COLORS.primary}]}>
                    {formatCurrency(product.selling_price)}
                  </Text>
                  <Text style={styles.regularPrice}>
                    {formatCurrency(product.regular_price)}
                  </Text>
                </View>

                {/* Savings badge */}
                {parseFloat(product.regular_price) >
                  parseFloat(product.selling_price) && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>
                      {t('save')}{' '}
                      {formatCurrency(
                        parseFloat(product.regular_price) -
                          parseFloat(product.selling_price),
                      )}
                    </Text>
                  </View>
                )}

                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${progressPercentage}%`,
                        backgroundColor: COLORS.primary,
                      },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.statusContainer,
                    {backgroundColor: statusInfo.color + '20'},
                  ]}>
                  <Text style={[styles.statusText, {color: statusInfo.color}]}>
                    {statusInfo.text}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Shipping Details Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.cardHeader}>
            <MaterialIcons name="local-shipping" size={22} color="#fff" />
            <Text style={styles.cardTitle}>{t('shippingDetails')}</Text>
          </LinearGradient>
          <View style={styles.shippingContainer}>
            <View style={styles.iconTextRow}>
              <View
                style={[styles.iconCircle, {backgroundColor: COLORS.primary}]}>
                <MaterialIcons name="location-on" size={20} color="#fff" />
              </View>
              <View style={styles.shipping}>
                <Text style={styles.shippingTitle}>
                  {orderData.user_address.name}
                </Text>
                <Text style={styles.shippingDetails}>
                  {`${orderData.user_address.address}, ${orderData.user_address.landmark}`}
                </Text>
                <Text style={styles.shippingDetails}>
                  {`${orderData.user_address.city}, ${orderData.user_address.state} - ${orderData.user_address.pin}`}
                </Text>
                <View style={styles.contactRow}>
                  <TouchableOpacity style={styles.contactButton}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.contactButtonGradient}>
                      <FontAwesome name="phone" size={14} color="#fff" />
                      <Text style={styles.contactButtonText}>{t('call')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <Text style={styles.contactDetails}>
                    {orderData.user_address.mobile}
                  </Text>
                </View>
              </View>
            </View>

            {/* Estimated Delivery Date */}
            <View style={styles.deliveryEstimateContainer}>
              <View style={styles.deliveryEstimateIconContainer}>
                <MaterialIcons name="event" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.deliveryEstimateLabel}>
                  {t('estimateDelivery')}
                </Text>
                <Text style={styles.deliveryEstimateDate}>
                  {formatDate(
                    new Date(new Date().setDate(new Date().getDate() + 5)),
                  )}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Payment Details Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.cardHeader}>
            <MaterialIcons name="payment" size={22} color="#fff" />
            <Text style={styles.cardTitle}>{t('Payment Information')}</Text>
          </LinearGradient>
          <View style={styles.paymentContainer}>
            <View style={styles.paymentMethodContainer}>
              <View style={styles.paymentIconContainer}>
                <LinearGradient
                  colors={[COLORS.primary + '40', COLORS.primary + '20']}
                  style={styles.paymentIcon}>
                  <AntDesign
                    name="creditcard"
                    size={20}
                    color={COLORS.primary}
                  />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.paymentMethodLabel}>
                  {t('paymentMethod')}
                </Text>
                <Text style={styles.paymentMethod}>
                  {orderData.data.payment_mode}
                </Text>
              </View>
            </View>

            <View style={styles.paymentBreakdown}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>{t('subTotal')}</Text>
                <Text style={styles.paymentValue}>
                  {formatCurrency(orderData.data.sub_total)}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>{t('shippingFee')}</Text>
                <Text style={styles.paymentValue}>
                  {orderData.data.delivery_charge === '0' ? (
                    <Text style={{color: COLORS.success}}>{t('free')}</Text>
                  ) : (
                    formatCurrency(orderData.data.delivery_charge)
                  )}
                </Text>
              </View>
              {orderData.data.discount_coupon_amount !== '0' && (
                <View style={styles.paymentRow}>
                  <View style={styles.discountLabelContainer}>
                    <Text style={styles.paymentLabel}>{t('discount')}</Text>
                    <View style={styles.couponTag}>
                      <Text style={styles.couponCode}>
                        {orderData.data.discount_coupon_code}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.paymentValue, {color: COLORS.success}]}>
                    -{formatCurrency(orderData.data.discount_coupon_amount)}
                  </Text>
                </View>
              )}
              <View style={[styles.paymentRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('totalamount')}</Text>
                <Text style={[styles.totalValue, {color: COLORS.primary}]}>
                  {formatCurrency(orderData.data.total_amount)}
                </Text>
              </View>
            </View>

            {/* Payment Status */}
            <View style={styles.paymentStatusContainer}>
              <View
                style={[
                  styles.paymentStatusBadge,
                  {backgroundColor: COLORS.success + '20'},
                ]}>
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={COLORS.success}
                />
                <Text
                  style={[styles.paymentStatusText, {color: COLORS.success}]}>
                  {t('paymentSucess')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={viewInvoice}
                style={styles.invoiceButton}>
                <LinearGradient
                  colors={[COLORS.secondary, COLORS.secondaryDark]}
                  style={styles.invoiceButtonGradient}>
                  <MaterialIcons name="receipt" size={16} color="#fff" />
                  <Text
                    style={{
                      padding: 8,
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#fff',
                    }}>
                    {t('viewInvoice')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Cancel Order Section */}
        {orderData.data.delivery_status < 2 &&
          orderData.data.order_cancel == 0 && (
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: fadeAnim,
                  transform: [{scale: scaleAnim}],
                },
              ]}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.cardHeader}>
                <MaterialIcons name="cancel" size={22} color="#fff" />
                <Text style={styles.cardTitle}>{t('cancelOrder')}</Text>
              </LinearGradient>
              <View style={styles.cancelContainer}>
                <View style={styles.iconTextRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      {backgroundColor: COLORS.primary},
                    ]}>
                    <MaterialIcons name="warning" size={20} color="#fff" />
                  </View>
                  <View style={styles.cancelInfo}>
                    <Text style={styles.cancelTitle}>
                      {t('cancelYourOrder')}
                    </Text>
                    <Text style={styles.cancelDetails}>
                      {t('orderCancelActionUndone')}
                    </Text>
                    <Text style={styles.cancelDetails}>
                      {t('processRefund')}
                    </Text>
                  </View>
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={[
                    styles.cancelButtonContainer,
                    loading && styles.disabledButton,
                  ]}
                  disabled={loading}
                  onPress={() => {
                    Alert.alert(
                      `${t('cancelOrder')}`,
                      `${t('sureCancelOrder')}`,
                      [
                        {text: 'No', style: 'cancel'},
                        {text: 'Yes', onPress: handleCancelOrder},
                      ],
                    );
                  }}>
                  <LinearGradient
                    colors={['#f2f2f2', '#f2f2f2']}
                    style={styles.cancelButton}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="delete" size={18} color="red" />
                        <Text style={styles.cancelButtonText}>
                          {t('cancelOrder')}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        <View style={{height: 80}} />
      </Animated.ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#8891A5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#1E222B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  retryButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Animated Header
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    zIndex: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Order Banner
  orderBanner: {
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  orderBannerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderIdLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  orderDateContainer: {
    alignItems: 'flex-end',
  },
  orderDateLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 10,
    marginBottom: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },

  // Status Overview
  statusOverviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 8,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusOverviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E222B',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontWeight: '600',
    fontSize: 13,
  },
  statusActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 6,
  },

  // Timeline & Progress
  timelineContainer: {
    padding: 20,
  },
  progressBarContainer: {
    height: 4,
    marginVertical: 10,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#E4E4E4',
    borderRadius: 2,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  stepIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#fff',
    top: -8,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsLabelContainer: {
    flexDirection: 'row',
    position: 'relative',
    height: 40,
  },
  stepLabelContainer: {
    position: 'absolute',
    top: 0,
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    width: 80,
  },

  // Product Items
  productContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  quantityBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productQuantity: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E222B',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  regularPrice: {
    fontSize: 13,
    color: '#8891A5',
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: '#0ba893' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  savingsText: {
    color: '#0ba893',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E4E4E4',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  productDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  // Shipping Details
  shippingContainer: {
    padding: 10,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  shipping: {
    flex: 1,
  },

  shippingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E222B',
    marginBottom: 4,
  },

  shippingDetails: {
    fontSize: 14,
    color: '#616A7D',
    lineHeight: 20,
    marginBottom: 4,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  contactButton: {
    overflow: 'hidden',
    borderRadius: 6,
    marginRight: 12,
  },

  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  contactButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  contactDetails: {
    fontSize: 14,
    color: '#2A4BA0',
    fontWeight: '500',
  },

  deliveryEstimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F8F9FB',
    padding: 12,
    borderRadius: 8,
  },

  deliveryEstimateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E7ECF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  deliveryEstimateLabel: {
    fontSize: 12,
    color: '#616A7D',
    marginBottom: 4,
  },

  deliveryEstimateDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E222B',
  },

  // Payment Details
  paymentContainer: {
    padding: 16,
  },

  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  paymentIconContainer: {
    marginRight: 12,
  },

  paymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentMethodLabel: {
    fontSize: 12,
    color: '#616A7D',
    marginBottom: 4,
  },

  paymentMethod: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E222B',
  },

  paymentBreakdown: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  paymentLabel: {
    fontSize: 14,
    color: '#616A7D',
  },

  discountLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  couponTag: {
    backgroundColor: '#0ba893' + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },

  couponCode: {
    fontSize: 12,
    color: '#0ba893',
    fontWeight: '600',
  },

  paymentValue: {
    fontSize: 14,
    color: '#1E222B',
    fontWeight: '500',
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    paddingTop: 12,
    marginBottom: 0,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E222B',
  },

  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  paymentStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  paymentStatusText: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 13,
  },

  invoiceButton: {
    overflow: 'hidden',
    borderRadius: 8,
  },

  invoiceButtonGradient: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add to your existing styles
  cancelContainer: {
    padding: 15,
  },

  cancelInfo: {
    flex: 1,
    marginLeft: 12,
  },

  cancelTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: 'black',
    marginBottom: 4,
  },

  cancelDetails: {
    color: 'black',
    fontSize: 14,
    marginBottom: 2,
  },

  cancelButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },

  cancelButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },

  cancelButtonText: {
    color: 'red',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default IndividualProductOrderDetails;

// in this code , implement the following features that is when i click on 
// track order , then it will be redirect to the track order screen with the shipment id 