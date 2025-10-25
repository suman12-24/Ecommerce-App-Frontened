import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {PermissionsAndroid} from 'react-native';
import {WebView} from 'react-native-webview';
import {baseURL} from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import appNameController from './Model/appNameController';
import RNFS from 'react-native-fs'; // You'll need to install this library
import {useTranslation} from 'react-i18next';
const InvoicePdf = ({route}) => {
  const {t} = useTranslation();
  const [pdfPath, setPdfPath] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Extract order data from route params
  const orderData = route.params?.orderData || {};
  const organisationDetails = route.params?.appInfo?.data[0] || {};

  // Process order data to create invoice data
  const processInvoiceData = () => {
    const {data, order_products, user_address, user_data} = orderData;

    if (!data || !order_products || !user_address || !user_data) {
      Alert.alert('Error', 'Invalid order data');
      return null;
    }
    // Calculate total for each product and GST details
    let subTotalWithoutGST = 0;
    let totalGSTAmount = 0;
    // Calculate total for each product
    const items = order_products.map(product => {
      const price = parseFloat(product.selling_price);
      const quantity = parseInt(product.quantity);
      const gstPercentage = parseFloat(product.gst);

      // Since price is inclusive of GST, we need to calculate the base price
      const totalWithGST = price * quantity;
      const baseAmount = totalWithGST * (100 / (100 + gstPercentage));
      const gstAmount = totalWithGST - baseAmount;

      // Add to running totals
      subTotalWithoutGST += baseAmount;
      totalGSTAmount += gstAmount;

      return {
        name: product.p_name,
        price: price,
        basePrice: baseAmount / quantity, // Base price per unit
        quantity: quantity,
        gstPercentage: gstPercentage,
        gstAmount: gstAmount,
        total: totalWithGST,
        image: product.image,
      };
    });

    return {
      invoiceNumber: `INV-${data.id}-${new Date(
        data.order_date,
      ).getFullYear()}`,
      orderNumber: data.id,
      date: new Date(data.order_date).toLocaleDateString(),
      paymentDate: new Date(data.payment_time).toLocaleString(),
      paymentMode: data.payment_mode,
      paymentId: data.payment_id,
      seller: {
        name: organisationDetails.name || 'Suhani Electronics',
        address:
          organisationDetails.address ||
          '123 Business Street, City, State, ZIP',
        phone: organisationDetails.mobile || '+91 98765 43210',
        email: organisationDetails.email || 'contact@suhani.com',
        gst: organisationDetails.gst || 'GST50BC',
      },
      customer: {
        name: user_address.name,
        address: `${user_address.address}, ${user_address.landmark}, ${user_address.city}, ${user_address.state} - ${user_address.pin}`,
        phone: user_address.mobile,
        email: user_data.email,
      },
      items: items,
      subtotalWithoutGST: subTotalWithoutGST, // New subtotal without GST
      totalGSTAmount: totalGSTAmount, // Total GST amount
      subtotal: parseFloat(data.sub_total),
      coupon: {
        code: data.discount_coupon_code || 'N/A',
        value: parseFloat(data.discount_coupon_amount) || 0,
      },
      deliveryCharge: parseFloat(data.delivery_charge) || 0,
      total: parseFloat(data.total_amount),
    };
  };

  const generateInvoiceHTML = () => {
    const invoiceData = processInvoiceData();

    if (!invoiceData) {
      return '';
    }

    // Calculate GST summary for all products
    const gstSummary = {};
    let totalGST = 0;

    invoiceData.items.forEach(item => {
      const gstKey = `${item.gstPercentage}%`;
      if (!gstSummary[gstKey]) {
        gstSummary[gstKey] = 0;
      }
      gstSummary[gstKey] += item.gstAmount;
      totalGST += item.gstAmount;
    });

    // Determine the logo URL based on organisationDetails
    const logoUrl = organisationDetails.logo
      ? `${baseURL}/App_info/${organisationDetails.logo}`
      : '';

    return `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        color: #333;
                        line-height: 1.5;
                        font-size: 14px;
                    }
                    .invoice-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 10px;
                    }
                    .logo-container {
                        text-align: center;
                        margin-bottom: 10px;
                    }
                    .logo {
                        font-size: 32px;
                        font-weight: bold;
                        color: #007bff;
                        letter-spacing: 1px;
                    }
                    .logo-image {
                        max-width: 150px;
                        max-height: 100px;
                        margin-bottom: 5px;
                    }
                    .invoice-title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #007bff;
                        text-align: center;
                        margin: 10px 0;
                    }
                    .invoice-details {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                    }
                    .invoice-details-box {
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        width: 48%;
                    }
                    .invoice-details-box h3 {
                        margin: 0 0 10px 0;
                        color: #007bff;
                        font-size: 16px;
                    }
                    .payment-info {
                        margin-bottom: 20px;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        background-color: #f9f9f9;
                    }
                    .payment-info h3 {
                        margin: 0 0 10px 0;
                        color: #007bff;
                        font-size: 16px;
                    }
                    .payment-details {
                        display: flex;
                        justify-content: space-between;
                        flex-wrap: wrap;
                    }
                    .payment-detail {
                        width: 48%;
                        margin-bottom: 8px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    .product-name {
                        font-weight: bold;
                    }
                    .summary {
                        display: flex;
                        justify-content: flex-end;
                    }
                    .summary-table {
                        width: 50%;
                        border-collapse: collapse;
                    }
                    .summary-table td {
                        padding: 5px 10px;
                    }
                    .summary-table .total-row {
                        font-weight: bold;
                        background-color: #f2f2f2;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 12px;
                        color: gray;
                        border-top: 1px solid #ddd;
                        padding-top: 10px;
                    }
                    .thank-you {
                        text-align: center;
                        margin: 20px 0;
                        font-size: 18px;
                        color: #007bff;
                    }
                    .order-status {
                        text-align: center;
                        margin: 15px 0;
                        padding: 8px;
                        background-color: #e8f4ff;
                        border-radius: 5px;
                        font-weight: bold;
                        color: #007bff;
                    }
                    .gst-info {
                        margin-top: 5px;
                        font-weight: bold;
                    }
                    .gst-summary {
                        margin-top: 20px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        padding: 10px;
                        background-color: #f8f8f8;
                    }
                    .gst-summary h3 {
                        margin: 0 0 10px 0;
                        color: #007bff;
                        font-size: 16px;
                    }
                    .gst-summary-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .gst-summary-table th {
                        background-color: #e8f4ff;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .price-info {
                        font-size: 12px;
                        color: #666;
                        font-style: italic;
                    }
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <div class="logo-container">
                        ${
                          logoUrl
                            ? `<img src="${logoUrl}" class="logo-image" alt="${invoiceData.seller.name} Logo"/>`
                            : `<div class="logo">${invoiceData.seller.name}</div>`
                        }
                        <div>Premium Electronics Store</div>
                    </div>
                    <div>
                        <div><strong>Invoice #:</strong> ${
                          invoiceData.invoiceNumber
                        }</div>
                        <div><strong>Order #:</strong> ${
                          invoiceData.orderNumber
                        }</div>
                        <div><strong>Date:</strong> ${invoiceData.date}</div>
                    </div>
                </div>
                
                <div class="invoice-title">TAX INVOICE</div>
                
                <div class="order-status">
                    Order Status: ${
                      orderData.data.order_status === 1
                        ? 'Confirmed'
                        : 'Processing'
                    }
                </div>
                
                <div class="invoice-details">
                    <div class="invoice-details-box">
                        <h3>Seller Details</h3>
                        <div><strong>${invoiceData.seller.name}</strong></div>
                        <div>${invoiceData.seller.address}</div>
                        <div>Phone: ${invoiceData.seller.phone}</div>
                        <div>Email: ${invoiceData.seller.email}</div>
                        <div class="gst-info">GSTIN: ${
                          invoiceData.seller.gst
                        }</div>
                    </div>
                    
                    <div class="invoice-details-box">
                        <h3>Customer Details</h3>
                        <div><strong>${invoiceData.customer.name}</strong></div>
                        <div>${invoiceData.customer.address}</div>
                        <div>Phone: ${invoiceData.customer.phone}</div>
                        <div>Email: ${invoiceData.customer.email}</div>
                    </div>
                </div>
                
                <div class="payment-info">
                    <h3>Payment Information</h3>
                    <div class="payment-details">
                        <div class="payment-detail"><strong>Payment Method:</strong> ${
                          invoiceData.paymentMode
                        }</div>
                        <div class="payment-detail"><strong>Payment Date:</strong> ${
                          invoiceData.paymentDate
                        }</div>
                        <div class="payment-detail"><strong>Payment ID:</strong> ${
                          invoiceData.paymentId
                        }</div>
                        <div class="payment-detail"><strong>Payment Status:</strong> ${
                          orderData.data.payment_status === 1
                            ? 'Completed'
                            : 'Pending'
                        }</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Product Price (₹)</th>
                            <th>GST</th>
                            <th>Total (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoiceData.items
                          .map(
                            item => `
                            <tr>
                                <td class="product-name">${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>
                                   ₹${item.basePrice.toFixed(2) * item.quantity}
                                </td>
                                <td>${
                                  item.gstPercentage
                                }% (₹${item.gstAmount.toFixed(2)})</td>
                                <td>${item.total.toFixed(2)}</td>
         
                                </tr>
                        `,
                          )
                          .join('')}
                    </tbody>
                </table>
                
                <div class="summary">
                    <table class="summary-table">
                        <tr>
                            <td>Subtotal (without GST):</td>
                            <td class="text-right">₹${invoiceData.subtotalWithoutGST.toFixed(
                              2,
                            )}</td>
                        </tr>
                        <tr>
                            <td>Total GST:</td>
                            <td class="text-right">₹${invoiceData.totalGSTAmount.toFixed(
                              2,
                            )}</td>
                        </tr>
                        ${
                          invoiceData.coupon.code !== 'N/A'
                            ? `
                        <tr>
                            <td>Coupon (${invoiceData.coupon.code}):</td>
                            <td class="text-right">-₹${invoiceData.coupon.value.toFixed(
                              2,
                            )}</td>
                        </tr>
                        `
                            : ''
                        }
                        <tr>
                            <td>Delivery Charge:</td>
                            <td class="text-right">₹${invoiceData.deliveryCharge.toFixed(
                              2,
                            )}</td>
                        </tr>
                        <tr class="total-row">
                            <td>Total:</td>
                            <td class="text-right">₹${invoiceData.total.toFixed(
                              2,
                            )}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="thank-you">Thank you for your business!</div>
                
                <div class="footer">
                    <div>This is a computer-generated invoice and does not require a signature.</div>
                    <div>For any inquiries, please contact us at ${
                      invoiceData.seller.phone
                    } or ${invoiceData.seller.email}</div>
                </div>
            </body>
            </html>
        `;
  };

  useEffect(() => {
    // Generate HTML content on component mount
    const html = generateInvoiceHTML();
    setHtmlContent(html);
    setIsLoading(false);
  }, []);

  // Updated permission request function for Android
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      // For Android 10+ (API level 29+)
      if (Platform.Version >= 29) {
        return true; // No permission needed to write to Download directory on newer Android
      }
      // For older Android versions
      else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  const downloadPDF = async () => {
    setIsLoading(true);

    try {
      // Request storage permissions
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to save PDF.',
        );
        setIsLoading(false);
        return;
      }

      const invoiceData = processInvoiceData();
      if (!invoiceData) {
        setIsLoading(false);
        return;
      }

      // Create a sanitized filename
      const fileName = `Invoice_${invoiceData.invoiceNumber.replace(
        /[^a-zA-Z0-9]/g,
        '_',
      )}.pdf`;

      // Set up directory path for Android and iOS
      let filePath;

      if (Platform.OS === 'android') {
        // Use the external directory path
        // On Android, this will save to the standard Downloads folder
        filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      } else {
        // iOS - use Documents directory
        filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }

      // Generate PDF with RNHTMLtoPDF - this uses a temporary location
      const options = {
        html: htmlContent,
        fileName: fileName,
        base64: false,
      };

      const generatedFile = await RNHTMLtoPDF.convert(options);

      if (Platform.OS === 'android') {
        // Copy from temporary location to Downloads folder
        await RNFS.copyFile(generatedFile.filePath, filePath);

        // On some devices, we need to make the file visible in the Downloads app
        // You may need to use a ContentResolver or MediaScanner to make it visible
        // This is a simplified approach
       
      } else {
        // For iOS we're already using the Documents folder
        filePath = generatedFile.filePath;
      }

      setPdfPath(filePath);

      Alert.alert(
        'Invoice Downloaded',
        `Invoice saved successfully to your Downloads folder.`,
      );
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to download invoice PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{marginTop: 10}}>{t('preparingInvoice')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.previewTitle}>{t('invoicePreview')}</Text>

      {/* Invoice Preview WebView */}
      <View style={styles.previewContainer}>
        <WebView
          originWhitelist={['*']}
          source={{html: htmlContent}}
          style={styles.webview}
          scalesPageToFit={true}
        />
      </View>

      {/* Download Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={downloadPDF}
          style={styles.downloadButton}
          disabled={isLoading}>
          <Text style={styles.downloadButtonText}>{t('downloadInvoice')}</Text>
        </TouchableOpacity>
      </View>

      {/* Success Message */}
      {pdfPath && (
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>
            {t('invoiceSucessfullyDownloaded')}!
          </Text>
          <Text style={styles.successText}>{t('saveToDownLoadFolder')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webview: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  downloadButton: {
    backgroundColor: appNameController.SelectDeliveryAddress,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  successTitle: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default InvoicePdf;
