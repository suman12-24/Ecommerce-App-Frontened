import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert, Keyboard, ActivityIndicator, KeyboardAvoidingView, Platform, Image, } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { setAuth } from '../redux/authSlice';
import appNameController from './Model/appNameController';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { loadCartProductToDatabase } from '../redux/loadCartItemsToRedux';
import { loadWishListFromDatabase } from '../redux/loadWishListItemsToRedux';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

const AuthScreen = () => {

    const { t } = useTranslation();

    // Redux and Navigation setup
    const dispatch = useDispatch();
    const navigation = useNavigation();

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [gender, setGender] = useState('');
    // UI state

    // Validation state
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [genderError, setGenderError] = useState('');

    const [isLogin, setIsLogin] = useState(true);
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [resendActive, setResendActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Refs for OTP inputs
    const otpInputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    // Keyboard listeners
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Timer for OTP resend
    useEffect(() => {
        let interval;
        if (showOtpScreen && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setResendActive(true);
        }

        return () => clearInterval(interval);
    }, [showOtpScreen, timer]);

    const validateName = (value) => {
        if (!value.trim()) {
            setNameError(t('namerequired'));
            return false;
        } else if (value.trim().length < 3) {
            setNameError(t('nameMustBe3Char'));
            return false;
        } else {
            setNameError('');
            return true;
        }
    };

    const validateEmail = (value) => {
        // Skip validation if email is empty (since it's optional)
        if (!value.trim()) {
            setEmailError(t('emailRequired'));
            return true;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError(t('validEmail'));
            return false;

        } else {
            setEmailError('');
            return true;
        }
    };

    const validateMobile = (value) => {
        if (!value.trim()) {
            setMobileError(t('mobileRequired'));
            return false;
        } else if (!/^\d{10}$/.test(value)) {
            setMobileError(t('vaildMobile'));
            return false;
        } else {
            setMobileError('');
            return true;
        }
    };

    const validateGender = (value) => {
        if (!value && !isLogin) {
            setGenderError(t('gender'));
            return false;
        } else {
            setGenderError('');
            return true;
        }
    };

    const validateAllFields = () => {
        // For login, only validate mobile
        if (isLogin) {
            return validateMobile(mobile);
        }
        // For signup, validate all required fields
        const isNameValid = validateName(name);
        const isEmailValid = validateEmail(email);
        const isMobileValid = validateMobile(mobile);
        const isGenderValid = validateGender(gender);

        return isNameValid && isEmailValid && isMobileValid && isGenderValid;
    };

    const handleMobileChange = (text) => {
        // Only allow digits
        const numericValue = text.replace(/[^0-9]/g, '');

        // Limit to 10 digits
        if (numericValue.length <= 10) {
            setMobile(numericValue);

            // Clear error when user starts typing
            if (mobileError) setMobileError('');
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        // Clear form fields when switching modes
        setEmail('');
        setMobile('');
        setShowOtpScreen(false);

        // Clear all validation errors
        setNameError('');
        setEmailError('');
        setMobileError('');
        setGenderError('');

        if (isLogin) {
            // Clear signup-specific fields
            setName('');
            setGender('');
        }
    };

    const handleAuthAction = async () => {
        if (!validateAllFields()) {
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                // Send OTP for login using GET method
                const response = await axiosInstance.get(`/Suhani-Electronics-Backend/f_login.php?phno=${mobile}`);

                // Check if the API call was successful
                if (response.data.success) {
                    setShowOtpScreen(true);
                    resetOtpTimer();
                } else {
                    // Handle case where mobile number is not found
                    if (response.data.message && response.data.message.includes('not found')) {
                        Alert.alert(
                            `${t('numberNotRegister')}`,
                            `${t('numNotRegCreateAcc')}`,
                            [
                                {
                                    text: `${t('cancel')}`,
                                    style: 'cancel'
                                },
                                {
                                    text: `${t('signUp')}`,
                                    onPress: () => {
                                        setIsLogin(false);
                                        // Preserve the mobile number for convenience
                                    }
                                }
                            ]
                        );
                    } else {
                        // Handle other API errors
                        const errorMessage = response.data?.message || 'Failed to send OTP. Please try again.';
                        Alert.alert(`${t('error')}`, errorMessage);
                    }
                }
            } else {
                const response = await axiosInstance.post('/Suhani-Electronics-Backend/f_registration.php', {
                    name: name,
                    gender: gender,
                    phno: mobile,
                    email: email
                });


                if (response.data.success) {
                    setShowOtpScreen(true);
                    resetOtpTimer();
                } else {
                    // Check if the error is due to an existing phone number
                    if (response.data.message &&
                        (response.data.message.includes('already exists') ||
                            response.data.message.includes('already registered'))) {
                        Alert.alert(
                            `${t('phNoAlReg')}`,
                            `${t('phNoAlRegLiToLog')}`,
                            [
                                {
                                    text: `${t('cancel')}`,
                                    style: 'cancel'
                                },
                                {
                                    text: `${t('login')}`,
                                    onPress: () => {
                                        // Switch to login mode and preserve the mobile number
                                        setIsLogin(true);
                                        setShowOtpScreen(false);

                                        // REMOVE THIS PART - Don't automatically trigger handleAuthAction
                                        // setTimeout(() => {
                                        //     handleAuthAction();
                                        // }, 500);
                                    }
                                }
                            ]
                        );
                    } else {
                        const errorMessage = response.data?.message || 'Failed to send OTP. Please try again.';
                        Alert.alert(`${t('error')}`, errorMessage);
                    }
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            // Check if it's a specific error about phone number already existing
            if (error.response && error.response.data &&
                error.response.data.message &&
                (error.response.data.message.includes('already exists') ||
                    error.response.data.message.includes('already registered'))) {
                Alert.alert(
                    `${t('phNoAlReg')}`,
                    `${t('phNoAlRegLiToLog')}`,
                    [
                        {
                            text: `${t('cancel')}`,
                            style: 'cancel'
                        },
                        {
                            text: `${t('login')}`,
                            onPress: () => {
                                // Switch to login mode and preserve the mobile number
                                setIsLogin(true);
                                setShowOtpScreen(false);

                                // REMOVE THIS PART - Don't automatically trigger handleAuthAction
                                // setTimeout(() => {
                                //     handleAuthAction();
                                // }, 500);
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(`${t('error')}`, 'Failed to connect to the server. Please check your internet connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (text, index) => {
        // Update the OTP value at the specified index
        const newOtpValues = [...otpValues];
        // Only accept numbers
        const numericText = text.replace(/[^0-9]/g, '');
        newOtpValues[index] = numericText;
        setOtpValues(newOtpValues);

        // Auto-focus to next input if current input is filled
        if (numericText && index < otpInputRefs.length - 1) {
            otpInputRefs[index + 1].current.focus();
        } else if (index === otpInputRefs.length - 1 && numericText) {
            // If last digit is entered, dismiss keyboard
            Keyboard.dismiss();
            // Check if all digits are entered to auto-verify
            if (newOtpValues.every(val => val.length === 1)) {
                // Optional: Auto-verify when all digits are filled
                // setTimeout(verifyOtp, 300);
            }
        }
    };


    const handleOtpKeyPress = (e, index) => {
        // Handle backspace key to move to previous input
        if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
            otpInputRefs[index - 1].current.focus();
        }
    };

    const resetOtpTimer = () => {
        setTimer(30);
        setResendActive(false);
    };

    const handleResendOtp = async () => {
        if (!resendActive || loading) return;

        setLoading(true);
        try {
            // Resend OTP based on the current mode (login or signup)
            let response;
            if (isLogin) {
                response = await axiosInstance.get(`/Suhani-Electronics-Backend/f_login.php?phno=${mobile}`);
            } else {
                response = await axiosInstance.post('/Suhani-Electronics-Backend/f_registration.php', {
                    name: name,
                    gender: gender,
                    phno: mobile,
                    email: email || ''
                });
            }



            if (response.data.success) {
                resetOtpTimer();
                Alert.alert(`${t('sucess')}`, `${t('otpReSucess')}`);
            } else {
                const errorMessage = response.data?.message || 'Failed to resend OTP. Please try again.';
                Alert.alert(`${t('error')}`, errorMessage);
            }
        } catch (error) {
            console.error('API Error:', error);
            Alert.alert(`${t('error')}`, 'Failed to connect to the server. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        const otpCode = otpValues.join('');
        if (otpCode.length !== 6) {
            Alert.alert(`${t('error')}`, `${t('enTer6DigOtp')}`);
            return;
        }

        setLoading(true);
        try {
            // Prepare the data for OTP verification based on login or registration
            let postData;
            let endpoint;

            if (isLogin) {
                // Login OTP verification
                endpoint = '/Suhani-Electronics-Backend/f_login_otp.php';
                postData = {
                    phno_otp: Number(otpCode)
                };
            } else {
                // Registration OTP verification - use the expected format
                endpoint = '/Suhani-Electronics-Backend/f_registration_otp.php';
                postData = {
                    phno_otp: otpCode
                };
            }

            const response = await axiosInstance.post(endpoint, postData);
            if (response.data && response.data.success) {
                const { token } = response.data;

                // If verification is successful
                if (isLogin) {
                    // Handle successful login

                    // Store token and user info in Redux
                    if (response?.data?.success) {
                        dispatch(setAuth({
                            token: response?.data?.data?.token,
                            email: response?.data?.data?.email,
                            name: response?.data?.data?.name,
                            mobile: response?.data?.data?.phno,
                            gender: response?.data?.data?.gender,
                            userId: response.data?.data?.id
                        }));

                        await loadCartProductToDatabase();
                        await loadWishListFromDatabase()

                        // Navigate to home screen
                        navigation.navigate('BottomTabNavigator', { screen: 'HomeStack', params: { screen: 'HomeScreen' } });


                        Alert.alert(`${t('sucess')}`, `${t('loginSucess')}`);
                    } else {
                        // Handle case where token is not returned
                        console.warn('Warning: Token not found in login response');
                        Alert.alert(`${t('sucess')}`, `${t('logSuccSessInfoMiss')}`);
                    }
                } else {
                    // Handle successful signup


                    // Store token and user info in Redux if provided
                    if (response?.data?.success) {
                        dispatch(setAuth({
                            token: response?.data?.data?.token,
                            email: email,
                            name: name,
                            mobile: mobile,
                            gender: gender,
                            userId: response?.data?.data?.id
                        }));

                        // Navigate to home screen
                        navigation.navigate('BottomTabNavigator', { screen: 'HomeStack', params: { screen: 'HomeScreen' } });

                        Alert.alert(`${t('sucess')}`, `${t('signUpSucess')}`);
                    } else {
                        // Handle case where token is not returned
                        console.warn('Warning: Token not found in signup response');
                        Alert.alert(`${t('sucess')}`, `${t('AccountCreSuccPlzLog')}`);

                        // Reset to login screen if no token provided after signup
                        setIsLogin(true);
                        setShowOtpScreen(false);
                        setOtpValues(['', '', '', '', '', '']);
                    }
                }

                // Reset the OTP screen
                setShowOtpScreen(false);
                setOtpValues(['', '', '', '', '', '']);
            } else {
                // Handle verification failure
                const errorMessage = response.data?.message || 'OTP verification failed. Please try again.';
                Alert.alert(`${t('error')}`, errorMessage);
            }
        } catch (error) {
            console.error('API Error:', error);
            Alert.alert('Error', 'Failed to connect to the server. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const goBackFromOtp = () => {
        setShowOtpScreen(false);
        setOtpValues(['', '', '', '', '', '']);
    };
    //login form
    const renderLoginForm = () => (
        <View>
            <View style={styles.inputContainer}>
                <View style={styles.mobileInputContainer}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                        style={styles.mobileInput}
                        placeholder={t('enterMobNum')}
                        placeholderTextColor="#888"
                        keyboardType="phone-pad"
                        value={mobile}
                        onChangeText={handleMobileChange}
                        maxLength={10}
                    />
                </View>
                <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
            </View>
            {mobileError ? <Text style={styles.errorText}>{mobileError}</Text> : null}

            <TouchableOpacity
                style={[styles.authButton, loading && styles.authButtonDisabled]}
                onPress={handleAuthAction}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.authButtonText}>{t('sendOtp')}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
    // Signup Form
    const renderSignupForm = () => (
        <View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={t('fullName')}
                    placeholderTextColor="#888"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        if (nameError) validateName(text);
                    }}
                    onBlur={() => validateName(name)}
                />
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <View style={styles.inputContainer}>
                <View style={styles.mobileInputContainer}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                        style={styles.mobileInput}
                        placeholder={t('enterMobNum')}
                        placeholderTextColor="#888"
                        value={mobile}
                        onChangeText={handleMobileChange}
                        keyboardType="numeric"
                        maxLength={10}
                        onBlur={() => validateMobile(mobile)}
                    />
                </View>
                <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
            </View>
            {mobileError ? <Text style={styles.errorText}>{mobileError}</Text> : null}

            <View style={styles.inputContainer}>
                <TextInput

                    style={styles.input}
                    placeholder={t('email')}
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) validateEmail(text);
                    }}
                    onBlur={() => validateEmail(email)}

                />
                <Ionicons name="at-outline" size={20} color="#888" style={styles.inputIcon} />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Gender Selection */}
            <View style={styles.genderContainer}>
                <Text style={styles.genderLabel}>{t('selectGender')}:</Text>
                <View style={styles.genderOptions}>
                    <TouchableOpacity
                        style={[styles.genderButton, gender === 'male' && styles.genderButtonSelected]}
                        onPress={() => {
                            setGender('male');
                            setGenderError('');
                        }}>
                        <Text style={[styles.genderText, gender === 'male' && styles.selectedGenderText]}>{t('male')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.genderButton, gender === 'female' && styles.genderButtonSelected]}
                        onPress={() => {
                            setGender('female');
                            setGenderError('');
                        }}>
                        <Text style={[styles.genderText, gender === 'female' && styles.selectedGenderText]}>{t('female')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.genderButton, gender === 'other' && styles.genderButtonSelected]}
                        onPress={() => {
                            setGender('other');
                            setGenderError('');
                        }}>
                        <Text style={[styles.genderText, gender === 'other' && styles.selectedGenderText]}>{t('other')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

            <TouchableOpacity
                style={[styles.authButton, loading && styles.authButtonDisabled]}
                onPress={handleAuthAction}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.authButtonText}>{t('sendOtp')}</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    // Enhanced OTP Verification Screen
    const renderOtpScreen = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.otpScreenContainer}
        >
            <View style={styles.otpHeader}>
                <TouchableOpacity style={styles.backButton} onPress={goBackFromOtp}>
                    <Ionicons name="arrow-back" size={24} color="#0ba893" />
                </TouchableOpacity>
                <Text style={styles.otpHeaderTitle}>{t('otpVerification')}</Text>
            </View>

            <View style={styles.otpContentContainer}>
                <View style={styles.otpIconContainer}>
                    <View style={styles.otpIconCircle}>
                        <Ionicons name="shield-checkmark-outline" size={40} color="#0ba893" />
                    </View>
                </View>

                <Text style={styles.otpTitle}>{t('verificationCode')}</Text>

                <Text style={styles.otpDescription}>
                    {t('sentVerificationCode')}
                </Text>

                <View style={styles.mobileContainer}>
                    <Ionicons name="call-outline" size={16} color="#0ba893" />
                    <Text style={styles.mobileText}>+91 {mobile}</Text>
                </View>

                <View style={styles.otpInputsContainer}>
                    {otpValues.map((value, index) => (
                        <View key={index} style={styles.otpInputWrapper}>
                            <TextInput
                                ref={otpInputRefs[index]}
                                style={[
                                    styles.otpInput,
                                    value ? styles.otpInputFilled : {}
                                ]}
                                keyboardType="numeric"
                                maxLength={1}
                                value={value}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                selectionColor="#0ba893"
                            />
                            {value ? null : <View style={styles.otpInputDash} />}
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, loading && styles.authButtonDisabled]}
                    onPress={verifyOtp}
                    disabled={loading || otpValues.some(val => val === '')}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.verifyButtonText}>{t('verifyProceed')}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                        {t('didNotReceiveCode')}
                    </Text>

                    {resendActive ? (
                        <TouchableOpacity
                            onPress={handleResendOtp}
                            disabled={loading}
                            style={styles.resendButton}
                        >
                            <Text style={styles.resendButtonText}>{t('resendOtp')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.timerContainer}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.timerText}>{`${t('resendIn')} ${timer}s`}</Text>
                        </View>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );

    return (
        <ScrollView style={styles.container}>
            <StatusBar backgroundColor={appNameController.statusBarColor} barStyle="light-content" />

            <View style={styles.formContainer}>
                {!showOtpScreen && (
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>
                            <Text style={styles.logoTextTeal}>Su</Text>
                            <Text style={styles.logoTextBlack}>hani</Text>
                        </Text>
                        <Text style={styles.tagline}>
                            {t('logRegIntro')}
                        </Text>
                    </View>
                )}

                {!showOtpScreen && (
                    <Text style={styles.registerTitle}>
                        {isLogin ? `${t('loginToAccount')}` : `${t('registerAccount')}`}
                    </Text>
                )}

                {showOtpScreen
                    ? renderOtpScreen()
                    : isLogin
                        ? renderLoginForm()
                        : renderSignupForm()}

                {!showOtpScreen && (
                    <View style={styles.switchAuthContainer}>
                        <Text style={styles.switchAuthText}>
                            {isLogin ? `${t('dontHaveAccount')}` : `${t('alreadyAnAccount')}`}
                        </Text>
                        <TouchableOpacity onPress={toggleAuthMode}>
                            <Text style={styles.switchAuthActionText}>
                                {isLogin ? `${t('signUp')}` : `${t('signIn')}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        flex: 1,
        marginTop: 50,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    logoTextTeal: {

        color: '#0ba893',
    },
    logoTextBlack: {
        color: '#333',
    },
    tagline: {
        color: '#666',
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 18,
        marginBottom: 10,
    },
    registerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 5,
    },
    mobileInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryCode: {
        fontSize: 14,
        fontWeight: '800',
        color: '#333',
        marginRight: 5,
    },
    mobileInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: '#333',
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: '#333',
    },
    inputIcon: {
        padding: 5,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '400',
        marginTop: -8,

        paddingLeft: 5,
    },
    genderContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    genderLabel: {
        fontSize: 15,
        color: '#333',
        marginBottom: 5,
    },
    genderOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    genderButton: {
        marginTop: 7,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#888',
    },
    genderButtonSelected: {
        backgroundColor: '#0ba893',
        borderColor: '#0ba893',
    },
    genderText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '400'
    },
    selectedGenderText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500'
    },
    authButton: {
        backgroundColor: '#0ba893',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        elevation: 2,
    },
    authButtonDisabled: {
        backgroundColor: '#88d4c0',
    },
    authButtonText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 18,
    },
    switchAuthContainer: {
        flexDirection: 'row',
        justifyContent: 'center',

        marginBottom: 20,
    },
    switchAuthText: {
        color: '#666',
        fontSize: 15,
        fontWeight: '500'
    },
    switchAuthActionText: {
        marginLeft: 10,
        color: '#0ba893',
        fontWeight: '700',
        fontSize: 17,
    },
    // Enhanced OTP screen styles
    otpScreenContainer: {
        flex: 1,
    },
    otpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    otpHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginLeft: 15,
    },
    backButton: {
        padding: 5,
    },
    otpContentContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    otpIconContainer: {
        marginVertical: 15,
        alignItems: 'center',
    },
    otpIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 168, 132, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    otpTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
    },
    otpDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    mobileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: 'rgba(0, 168, 132, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    mobileText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    otpInputsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    otpInputWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpInput: {
        width: 45,
        height: 50,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    otpInputFilled: {
        backgroundColor: 'rgba(0, 168, 132, 0.1)',
        borderWidth: 1,
        borderColor: '#0ba893',
    },
    otpInputDash: {
        position: 'absolute',
        bottom: 10,
        width: 20,
        height: 2,
        backgroundColor: '#888',
    },
    verifyButton: {
        backgroundColor: '#0ba893',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        elevation: 2,
    },
    verifyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    resendText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    resendButton: {
        padding: 10,
    },
    resendButtonText: {
        color: '#0ba893',
        fontWeight: '700',
        fontSize: 16,
    },
    resendButtonDisabled: {
        color: '#999',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginTop: 5,
    },
    timerText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#666',
    },
});

export default AuthScreen;

