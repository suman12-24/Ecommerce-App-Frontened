import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, StatusBar, Modal, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth, logoutAndClearCart } from '../redux/authSlice';
import LinearGradient from 'react-native-linear-gradient';
import appNameController from './Model/appNameController';
import { useTranslation } from 'react-i18next';
const ProfileScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { userId, token, name, email, mobile } = useSelector((state) => state.auth);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const showLogoutConfirmation = () => {
        setShowLogoutModal(true);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideLogoutConfirmation = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowLogoutModal(false);
        });
    };

    const handleLogout = () => {
        hideLogoutConfirmation();
        setTimeout(() => {
            dispatch(logoutAndClearCart());
            navigation.navigate('AccountStack', { screen: 'AuthScreen' });
        }, 200);
    };

    // Handle protected navigation - redirects to login if no token
    const handleProtectedNavigation = (screenName) => {
        if (!token) {
            Alert.alert(
                "Login Required",
                "Please login to access this feature",
                [
                    {
                        text: `${t('cancel')}`,
                        style: "cancel"
                    },
                    {
                        text: `${t('login')}`,
                        onPress: () => navigation.navigate('AuthScreen'),
                    }
                ]
            );
        }
        else if (screenName === `${t('wishlist')}`) {
            navigation.navigate('BottomTabNavigator', { screen: `${t('wishlist')}`, params: { screen: 'WishlistScreen' } });
        }
        else {
            navigation.navigate(t(screenName));
          
        }


    };

    const renderMenuItem = (icon, title, screenName, subtitle = "", rightIcon = "chevron-right") => (
        <TouchableOpacity
            onPress={() => handleProtectedNavigation(screenName)}
            style={styles.menuItem}>

            <View style={styles.menuItemLeft}>
                {icon}
                <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{title}</Text>
                    {subtitle ? <Text style={styles.menuItemSubtitle}>{subtitle}</Text> : null}
                </View>
            </View>
            <MaterialIcons name={rightIcon} size={24} color="#666" />
        </TouchableOpacity>
    );


    const renderHeader = () => {
        if (token) {
            return (
                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : '?'}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{name || 'User'}</Text>
                        <Text style={styles.userContact}>{mobile || 'No phone number'}</Text>
                        <Text style={styles.userContact}>{email || 'No email'}</Text>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.loginPromptContainer}>
                    <View>
                        <Text style={styles.loginPromptTitle}>{t('account')}</Text>
                        <Text style={styles.loginPromptSubtitle}>{t('loginToAccessFeature')}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AuthScreen')}
                        style={styles.loginButton}>
                        <MaterialIcons name="login" size={20} color="#fff" />
                        <Text style={styles.loginButtonText}>{t('login')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    const renderLogoutButton = () => {
        if (token) {
            return (
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={showLogoutConfirmation}
                >
                    <MaterialIcons name="logout" size={20} color="#ff4444" style={styles.logoutIcon} />
                    <Text style={styles.logoutText}>{t('logOut')}</Text>
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <>
            <StatusBar
                barStyle="light-content"
                translucent={false}
                backgroundColor={appNameController.statusBarColor}
            />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={['#0baf9a', '#0ba893']}
                    style={styles.header}>
                    {renderHeader()}
                </LinearGradient>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('myOrders')}</Text>
                    {renderMenuItem(
                        <MaterialIcons name="shopping-bag" size={24} color="#0ba893" />,
                        `${t('orders')}`,
                        "AllOrderDetails",
                        `${t('checkOrderStatus')}`
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('accountSettings')}</Text>
                    {renderMenuItem(<MaterialIcons name="person" size={24} color="#0ba893" />, `${t('editProfile')}`, "UserEditProfile")}
                    {renderMenuItem(<MaterialIcons name="location-on" size={24} color="#0ba893" />, `${t('saveAddress')}`, "ViewCustomerAddress")}
                    {renderMenuItem(
                        <MaterialCommunityIcons name="file-document" size={24} color="#0ba893" />,
                        `${t('viewElectricianSleep')}`,
                        "ViewElectricianSleep"
                    )}
                    {/* {renderMenuItem(<MaterialIcons name="local-offer" size={24} color="#0ba893" />, `${t('coupans')}`, "OfferScreen")} */}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('myActivity')}</Text>
                    {renderMenuItem(<MaterialIcons name="favorite" size={24} color="#0ba893" />, `${t('myWhislist')}`, `${t('wishlist')}`)}
                    {/* {renderMenuItem(<MaterialIcons name="star" size={24} color="#0ba893" />, "My Reviews & Ratings", "ReviewsRatings")}
                    {renderMenuItem(<MaterialIcons name="question-answer" size={24} color="#0ba893" />, "My Questions & Answers", "QuestionsAnswers")}
                    {renderMenuItem(<MaterialIcons name="question-answer" size={24} color="#0ba893" />, "Demo PDF Creation", "DemoPdf")} */}
                    {renderMenuItem(<MaterialIcons name="privacy-tip" size={24} color="#0ba893" />, `${t('privacyPolicy')}`, "PrivacyPolicy")}

                </View>

                {renderLogoutButton()}


            </ScrollView>

            {/* Custom Animated Logout Modal */}
            <Modal
                transparent={true}
                visible={showLogoutModal}
                onRequestClose={hideLogoutConfirmation}
                animationType="none"
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={hideLogoutConfirmation}
                >
                    <Animated.View
                        style={[
                            styles.logoutConfirmation,
                            {
                                opacity: opacityAnim,
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        <View style={styles.logoutIconContainer}>
                            <MaterialIcons name="logout" size={36} color="#fff" />
                        </View>
                        <Text style={styles.logoutConfirmTitle}>{t('logOut')}</Text>
                        <Text style={styles.logoutConfirmMessage}>{t('sureWantToLogout')}</Text>
                        <View style={styles.logoutConfirmButtons}>
                            <TouchableOpacity
                                style={[styles.logoutConfirmButton, styles.cancelButton]}
                                onPress={hideLogoutConfirmation}
                            >
                                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.logoutConfirmButton, styles.confirmButton]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.confirmButtonText}>{t('logOut')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 15,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        elevation: 2,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.7)',
    },
    avatarText: {
        fontSize: 26,
        color: '#0da386',
        fontWeight: 'bold',
    },
    userInfo: {
        marginLeft: 20,
    },
    userName: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '800',
    },
    userContact: {
        fontSize: 15,
        color: '#fff',
        marginTop: 3,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 8,
        marginTop: 10,
        paddingVertical: 5,
        borderRadius: 12,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#555',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemContent: {
        marginLeft: 18,
    },
    menuItemTitle: {
        fontSize: 15,
        color: '#212121',
        fontWeight: '500',
    },
    menuItemSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    loginPromptContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loginPromptTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff'
    },
    loginPromptSubtitle: {
        fontSize: 15,
        color: '#fff',
        marginTop: 4,
    },
    loginButton: {
        width: 90,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(233, 229, 229, 0.99)',
    },
    loginButtonText: {
        fontWeight: '500',
        fontSize: 17,
        color: '#fff',
        paddingLeft: 5
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        elevation: 2,
    },
    logoutIcon: {
        marginRight: 8,
    },
    logoutText: {
        color: '#ff4444',
        fontSize: 16,
        fontWeight: '600',
    },
    // Custom Logout Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutConfirmation: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '80%',
        alignItems: 'center',
        elevation: 5,
    },
    logoutIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    logoutConfirmTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    logoutConfirmMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    logoutConfirmButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    logoutConfirmButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f1f1f1',
    },
    confirmButton: {
        backgroundColor: '#ff4444',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

