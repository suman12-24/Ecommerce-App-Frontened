import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, PermissionsAndroid, Platform, Image, ActivityIndicator, Animated, Easing, Linking, TextInput } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import axiosInstance from '../../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
const AnimatedNotification = ({ visible, message, type = 'success', onDismiss, duration = 3000 }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideNotification();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideNotification = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            if (onDismiss) onDismiss();
        });
    };

    // Set icon and color based on notification type
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'check-circle',
                    colors: ['#4caf50', '#43a047'],
                    background: 'rgba(76, 175, 80, 0.15)'
                };
            case 'error':
                return {
                    icon: 'error',
                    colors: ['#f44336', '#d32f2f'],
                    background: 'rgba(244, 67, 54, 0.15)'
                };
            case 'warning':
                return {
                    icon: 'warning',
                    colors: ['#ff9800', '#f57c00'],
                    background: 'rgba(255, 152, 0, 0.15)'
                };
            case 'info':
                return {
                    icon: 'info',
                    colors: ['#2196f3', '#1976d2'],
                    background: 'rgba(33, 150, 243, 0.15)'
                };
            default:
                return {
                    icon: 'notifications',
                    colors: ['#9c27b0', '#7b1fa2'],
                    background: 'rgba(156, 39, 176, 0.15)'
                };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <Animated.View
            style={[
                styles.containerx,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                    backgroundColor: typeStyles.background
                }
            ]}
        >
            <View style={styles.iconContainer}>
                <Icon name={typeStyles.icon} size={24} color={typeStyles.colors[0]} />
            </View>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={hideNotification} style={styles.closeButtonx}>
                <Icon name="close" size={18} color="#777" />
            </TouchableOpacity>
        </Animated.View>
    );
};


const UploadElectricianSleep = () => {
    const { t } = useTranslation();
    const { userId, token, name, email, mobile } = useSelector((state) => state.auth);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasPermissions, setHasPermissions] = useState(false);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('Electrician sleep document');

    // Animation values
    const uploadButtonScale = useRef(new Animated.Value(1)).current;
    const fileInfoSlideIn = useRef(new Animated.Value(-300)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const spinValue = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const messageInputSlideIn = useRef(new Animated.Value(-300)).current;

    const [notification, setNotification] = useState({
        visible: false,
        message: '',
        type: 'success',
    });

    // Replace Alert.alert calls with this notification function:
    const showNotification = (message, type = 'success') => {
        setNotification({
            visible: true,
            message,
            type,
        });
    };

    // Add this function to dismiss the notification
    const dismissNotification = () => {
        setNotification(prev => ({ ...prev, visible: false }));
    };


    // Create a spinning animation for the cloud icon

    // Create a glow effect
    const glow = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2]
    });

    // Check permissions on component mount
    useEffect(() => {
        checkPermissions();
    }, []);

    // Start animations on component mount
    useEffect(() => {
        // Pulse animation for upload button
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(uploadButtonScale, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(uploadButtonScale, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                })
            ])
        );

        // Glow animation
        const glowAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                })
            ])
        );

        pulseAnimation.start();
        glowAnimation.start();

        // Spin animation for the cloud icon
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 6000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();

        return () => {
            pulseAnimation.stop();
            glowAnimation.stop();
        };
    }, []);

    // Animation when a file is selected
    useEffect(() => {
        if (selectedFile) {
            Animated.spring(fileInfoSlideIn, {
                toValue: 0,
                speed: 15,
                bounciness: 8,
                useNativeDriver: true,
            }).start();

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();

            // Animate the message input field
            Animated.spring(messageInputSlideIn, {
                toValue: 0,
                speed: 15,
                bounciness: 8,
                useNativeDriver: true,
                delay: 200,
            }).start();
        } else {
            fileInfoSlideIn.setValue(-300);
            messageInputSlideIn.setValue(-300);
            fadeAnim.setValue(0);
            setUploadProgress(0);
        }
    }, [selectedFile]);

    // Check all permissions at once
    const checkPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const cameraPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );

                const storageWritePermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE ||
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );

                const storageReadPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE ||
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );

                setHasPermissions(cameraPermission && storageWritePermission && storageReadPermission);
                setPermissionChecked(true);

                if (!cameraPermission || !storageWritePermission || !storageReadPermission) {
                    requestAllPermissions();
                }
            } catch (err) {
                console.warn('Error checking permissions:', err);
                setHasPermissions(false);
                setPermissionChecked(true);
            }
        } else {
            // iOS handles permissions differently
            setHasPermissions(true);
            setPermissionChecked(true);
        }
    };

    // Request all necessary permissions at once
    const requestAllPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                // Request camera permission
                const cameraPermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Camera Permission",
                        message: "This app needs camera permission to take pictures",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );

                // Request storage write permission
                const storageWritePermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Storage Permission",
                        message: "This app needs storage permission to save files",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );

                // Request storage read permission
                const storageReadPermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: "Storage Access Permission",
                        message: "This app needs access to your storage to select files",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );

                const allGranted =
                    cameraPermission === PermissionsAndroid.RESULTS.GRANTED ||
                    storageWritePermission === PermissionsAndroid.RESULTS.GRANTED ||
                    storageReadPermission === PermissionsAndroid.RESULTS.GRANTED;

                setHasPermissions(allGranted);
                return allGranted;
            }
            catch (err) {
                console.warn('Error requesting permissions:', err);
                setHasPermissions(false);
                return false;
            }
        }
        else {
            // iOS handles permissions differently
            setHasPermissions(true);
            return true;
        }
    };

    // Open app settings to allow the user to manually grant permissions
    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings();
        }
    };

    const showPermissionRequiredAlert = () => {
        Alert.alert(
            'Permission Required',
            'Camera and storage permissions are needed for this feature to work properly',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: openSettings }
            ]
        );
    };

    // Check if user is authenticated with valid token
    const checkAuthentication = () => {
        if (!token) {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: `🔒${t('authenticationRequire')}`,
                text2: `${t('signInContinueToImageUpload')}`,
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 30,
                bottomOffset: 40,
                text1Style: { fontWeight: '700', fontSize: 16, color: '#494949' },
                text2Style: { fontSize: 13, color: '#494949', fontWeight: '400' },
            });
            return false;
        }
        return true;
    };


    const handleImageCapture = async () => {
        if (!hasPermissions) {
            const granted = await requestAllPermissions();
            if (!granted) {
                showPermissionRequiredAlert();
                return;
            }
        }
        try {
            setLoading(true);

            // Open camera with improved options
            const result = await launchCamera({
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 1000,
                maxWidth: 1000,
                quality: 0.8,
                saveToPhotos: true,
                cameraType: 'back',

            });

            if (!result.didCancel && result.assets && result.assets.length > 0) {
                setSelectedFile({
                    uri: result.assets[0].uri,
                    type: 'image',
                    name: result.assets[0].fileName || `electrician_sleep_${Date.now()}.jpg`,
                    size: result.assets[0].fileSize,
                });
                showNotification(`${t('imageCaptureSucess')}`, 'success');
            }
        } catch (error) {
            console.error('Error capturing image:', error);
            showNotification('Failed to capture image', 'error');
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    const handleChoosePhoto = async () => {
        if (!hasPermissions) {
            const granted = await requestAllPermissions();
            if (!granted) {
                showPermissionRequiredAlert();
                return;
            }
        }

        try {
            setLoading(true);

            // Open image library
            const result = await launchImageLibrary({
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
                quality: 0.8,
                selectionLimit: 1,
            });

            if (!result.didCancel && result.assets && result.assets.length > 0) {
                setSelectedFile({
                    uri: result.assets[0].uri,
                    type: 'image',
                    name: result.assets[0].fileName || `electrician_sleep_${Date.now()}.jpg`,
                    size: result.assets[0].fileSize,
                });
                showNotification(`${t('imageSelectSucess')}`, 'success');
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            showNotification('Failed to Select image', 'error');
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    const handlePdfUpload = async () => {
        if (!hasPermissions && Platform.OS === 'android') {
            const granted = await requestAllPermissions();
            if (!granted) {
                showPermissionRequiredAlert();
                return;
            }
        }
        try {
            setLoading(true);
            // Open document picker with improved options
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf],
                allowMultiSelection: false,
                copyTo: 'cachesDirectory',
            });

            setSelectedFile({
                uri: result[0].uri,
                type: 'pdf',
                name: result[0].name,
                size: result[0].size,
            });
            showNotification(`${t('pdfSelectedSucess')}`, 'success');
        } catch (error) {
            if (DocumentPicker.isCancel(error)) {
                // User cancelled the picker
                
            } else {
                console.error('Error selecting PDF:', error);
                showNotification('Failed to Select PDF Document', 'error');
            }
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
    };

    // Function to get progress background color
    const getFileStatusColor = () => {
        if (!selectedFile) return '#f8f9fa';
        switch (selectedFile.type) {
            case 'image': return 'rgba(25, 118, 210, 0.1)';
            case 'pdf': return 'rgba(211, 47, 47, 0.1)';
            default: return 'rgba(76, 175, 80, 0.1)';
        }
    };

    const handleButtonPress = () => {
        if (!checkAuthentication()) {
            // If not authenticated, we return early without opening the modal
            return;
        }
        // Animate button scale
        Animated.sequence([
            Animated.timing(uploadButtonScale, {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true
            }),
            Animated.timing(uploadButtonScale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            })
        ]).start(() => {
            if (!permissionChecked) {
                checkPermissions();
            }
            setModalVisible(true);
        });
    };

    // Upload file to the API
    const uploadFile = async () => {
        if (!checkAuthentication()) {
            return;
        }
        if (!selectedFile) {
            showNotification(`${t('selectFileFirst')}`, 'error');
            return;
        }

        if (!message.trim()) {
            showNotification(`${t('enterAMessageForUpload')}`, 'error');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            // Create a FormData object to hold the file and other parameters
            const formData = new FormData();
            // Add the user ID, name and message parameters
            formData.append('u_id', userId);
            formData.append('u_name', name);
            formData.append('message', message); // Use the user-provided message
            // Add the file
            formData.append('file', {
                uri: selectedFile.uri,
                type: selectedFile.type === 'image' ? 'image/jpeg' : 'application/pdf',
                name: selectedFile.name
            });
            // Configure request with upload progress tracking
            const config = {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };

            // Make the API call
            const response = await axiosInstance.post(
                '/Suhani-Electronics-Backend/f_slip.php',
                formData,
                config
            );
           
            // Check response and show appropriate message
            if (response.data.success === true) {
                showNotification(`${t('fileUploadedSucess')}`, 'success');
                setTimeout(() => {
                    setSelectedFile(null); // Clear the selected file
                }, 1500);
                setMessage('Electrician sleep document'); // Reset the message
            } else {
                showNotification('Upload Failed', 'error');
            }

        } catch (error) {
            console.error('Error uploading file:', error);
            Alert.alert(
                'Upload Error',
                'Failed to upload file. Please try again later.'
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Animatable.View
            style={[styles.container, { backgroundColor: getFileStatusColor() }]}
            animation="fadeInUp"
            duration={800}
            delay={300}
        >
            <Animated.View style={[
                styles.uploadButtonContainer,
                { transform: [{ scale: uploadButtonScale }, { scale: glow }] }
            ]}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleButtonPress}
                >
                    <LinearGradient
                        colors={['#0baf9a', '#0ba893']}
                        start={{ x: 0, y: 0 }}  // Top
                        end={{ x: 0, y: 1 }}    // Bottom
                        style={styles.uploadButton}
                    >
                        <Icon name="cloud-upload" size={26} color="#fff" />
                        <Text style={[styles.buttonText, { color: '#fff', fontSize: 16 }]}>{t('UploadElectricianList')}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            {selectedFile && (
                <Animated.View
                    style={[
                        styles.fileInfoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateX: fileInfoSlideIn }]
                        }
                    ]}
                >
                    <View style={styles.filePreviewContainer}>
                        {selectedFile.type === 'image' ? (
                            <Image
                                source={{ uri: selectedFile.uri }}
                                style={styles.imagePreview}
                                resizeMode="cover"
                            />
                        ) : (
                            <Animatable.View
                                style={styles.fileIconContainer}
                                animation="pulse"
                                iterationCount="infinite"
                                duration={2000}
                            >
                                <Icon
                                    name="picture-as-pdf"
                                    size={40}
                                    color="#f44336"
                                />
                            </Animatable.View>
                        )}
                    </View>
                    <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                            {selectedFile.name}
                        </Text>
                        {selectedFile.size && (
                            <Text style={styles.fileSize}>
                                {formatFileSize(selectedFile.size)}
                            </Text>
                        )}
                        <Animatable.View
                            style={[styles.typeChip,
                            selectedFile.type === 'image'
                                ? styles.imageTypeChip
                                : styles.pdfTypeChip
                            ]}
                            animation="fadeIn"
                            delay={500}
                        >
                            <Text style={[
                                styles.typeText,
                                selectedFile.type === 'image'
                                    ? styles.imageTypeText
                                    : styles.pdfTypeText
                            ]}>
                                {selectedFile.type.toUpperCase()}
                            </Text>
                        </Animatable.View>
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                            Animated.timing(fadeAnim, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: true
                            }).start(() => setSelectedFile(null));
                        }}
                    >
                        <Icon name="close" size={20} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Message Input Field */}
            {selectedFile && (
                <Animated.View
                    style={[
                        styles.messageContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateX: messageInputSlideIn }]
                        }
                    ]}
                >
                    <View style={styles.messageIconContainer}>
                        <Icon name="message" size={24} color="#0fbd9a" />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.messageLabel}>{t('addMessage')}</Text>
                        <TextInput
                            style={styles.messageInput}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Enter a message about this file"
                            placeholderTextColor="#aaa"
                            multiline={true}
                            numberOfLines={2}
                            maxLength={200}
                            autoCapitalize="words"

                        />
                        <Text style={styles.messageCounter}>{message.length}/200</Text>
                    </View>
                </Animated.View>
            )}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Animatable.View
                        style={styles.modalContent}
                        animation="zoomIn"
                        duration={400}
                    >
                        <View>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.closeButton, { position: 'relative', right: '-40%', top: '-50%' }]}
                            >
                                <Icon name="close" size={26} color="red" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalTitle}>{t('selectUploadOption')}</Text>
                        <Animatable.View animation="fadeInLeft" delay={100} duration={500}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={loading}
                                onPress={handleImageCapture}
                            >
                                <LinearGradient
                                    colors={['#0baf9a', '#0ba893']}
                                    start={{ x: 0, y: 0 }}  // Start from the top
                                    end={{ x: 0, y: 1 }}    // End at the bottom
                                    style={styles.modalButton}
                                >
                                    <Icon name="camera-alt" size={24} color="white" />
                                    <Text style={styles.modalButtonText}>{t('takePhoto')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animatable.View>

                        <Animatable.View animation="fadeInRight" delay={150} duration={500}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={loading}
                                onPress={handleChoosePhoto}
                            >
                                <LinearGradient
                                    colors={['#0baf9a', '#0ba893']}
                                    start={{ x: 0, y: 0 }}  // Start from the top
                                    end={{ x: 0, y: 1 }}    // End at the bottom
                                    style={styles.modalButton}
                                >
                                    <Icon name="photo-library" size={24} color="white" />
                                    <Text style={styles.modalButtonText}>{t('choosePhoto')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animatable.View>

                        <Animatable.View animation="fadeInLeft" delay={200} duration={500}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={loading}
                                onPress={handlePdfUpload}
                            >
                                <LinearGradient
                                    colors={['#0baf9a', '#0ba893']}
                                    start={{ x: 0, y: 0 }}  // Start from the top
                                    end={{ x: 0, y: 1 }}    // End at the bottom
                                    style={styles.modalButton}
                                >
                                    <Icon name="description" size={24} color="white" />
                                    <Text style={styles.modalButtonText}>{t('uploadPdf')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animatable.View>

                        {/* <Animatable.View animation="fadeInUp" delay={250} duration={500}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={loading}
                                onPress={() => setModalVisible(false)}
                            >
                                <LinearGradient
                                    colors={['#ff3333', '#ff3333', '#ff3333']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[styles.modalButton, styles.cancelButton]}
                                >
                                    <Icon name="cancel" size={24} color="white" />
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animatable.View> */}

                        {loading && (
                            <Animatable.View
                                style={styles.loadingOverlay}
                                animation="fadeIn"
                                duration={300}
                            >
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#0fbd9a" />
                                    <Animatable.Text
                                        style={styles.loadingText}
                                        animation="pulse"
                                        iterationCount="infinite"
                                    >{t('processing')}</Animatable.Text>
                                </View>
                            </Animatable.View>
                        )}
                    </Animatable.View>
                </View>
            </Modal>

            {/* Upload Progress Indicator */}
            {selectedFile && (
                <Animatable.View
                    style={styles.progressContainer}
                    animation="fadeIn"
                    delay={600}
                >
                    <Text style={styles.progressText}>
                        {isUploading ? `${t('uploading')}... ${uploadProgress}%` : `${t('fileReadyForUpload')}`}
                    </Text>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <Animatable.View
                                style={[
                                    styles.progressBar,
                                    { width: `${uploadProgress}%` }
                                ]}
                                animation={isUploading ? "fadeInLeft" : "fadeIn"}
                                duration={1000}
                                easing="ease-out"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.uploadNowButton}
                        activeOpacity={0.8}
                        disabled={isUploading}
                        onPress={uploadFile}
                    >
                        <LinearGradient
                            colors={isUploading ? ['#cccccc', '#bbbbbb'] : ['#0fbd9a', '#09a085']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.uploadNowGradient}
                        >
                            {isUploading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Icon name="cloud-upload" size={18} color="white" />
                            )}
                            <Text style={styles.uploadNowText}>
                                {isUploading ? `${t('uploading')}` : `${t('uploadNow')}`}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <AnimatedNotification
                        visible={notification.visible}
                        message={notification.message}
                        type={notification.type}
                        onDismiss={dismissNotification}
                        duration={3000}                        
                    />
                </Animatable.View>
            )}
            <Toast />
        </Animatable.View>
    );
};

export default UploadElectricianSleep;



const styles = StyleSheet.create({
    container: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    uploadButtonContainer: {
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    uploadButton: {
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 12,
        letterSpacing: 0.3,
    },
    fileInfoContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
    },
    filePreviewContainer: {
        marginRight: 16,
        width: 60,
        height: 60,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    fileIconContainer: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        padding: 10,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    typeChip: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        elevation: 1,
    },
    imageTypeChip: {
        backgroundColor: 'rgba(25, 118, 210, 0.15)',
    },
    pdfTypeChip: {
        backgroundColor: 'rgba(211, 47, 47, 0.15)',
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    imageTypeText: {
        color: '#1976d2',
    },
    pdfTypeText: {
        color: '#d32f2f',
    },
    removeButton: {
        backgroundColor: '#dc3545',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#dc3545',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '85%',
        paddingVertical: '8%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 0.3,
        textAlign: 'center',
        marginBottom: 15
    },
    closeButton: {
        padding: 3,
    },
    modalButton: {
        width: 230,
        padding: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    cancelButton: {
        marginTop: 8,
    },
    modalButtonText: {
        color: '#f2f2f2',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
        letterSpacing: 0.3,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#0fbd9a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    loadingText: {
        marginTop: 10,
        color: '#0fbd9a',
        fontSize: 18,
        fontWeight: '600',
    },
    progressContainer: {
        marginTop: 5,
        width: '100%',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    progressBarContainer: {
        height: 8,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressBarBackground: {
        height: '100%',
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        width: '100%',
        backgroundColor: '#0fbd9a',
    },
    uploadNowButton: {
        alignSelf: 'center',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#0fbd9a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    uploadNowGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    uploadNowText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 6,
    },
    messageContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },

    messageIconContainer: {
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
    },

    inputContainer: {
        flex: 1,
    },

    messageLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#333',
    },

    messageInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        color: '#222',
        textAlignVertical: 'top',
        minHeight: 60,
    },

    messageCounter: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    containerx: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        zIndex: 1000,
    },
    iconContainer: {
        marginRight: 10,
    },
    message: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    closeButtonx: {
        padding: 5,
    },
});

