import { StyleSheet, Text, View, TouchableOpacity, Animated, TouchableWithoutFeedback, Image, ScrollView, Dimensions, Modal, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import appNameController from '../Model/appNameController';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logoutAndClearCart } from '../../redux/authSlice';
import { useTranslation } from 'react-i18next';
const { width, height } = Dimensions.get('window');

const AppHeader = (
    {
    leftIcon = { name: "menu-outline", size: 28 },
    rightIcon = { name: "person-outline", size: 25 },
    onLeftIconPress,
    headerStyle = {},
    titleStyle = {},
    iconContainerStyle = {},
    sidebarWidth = 250,
    sidebarHeaderTitle = "Menu",
    iconComponent: Icon = Ionicons
}
) => {
    const { token } = useSelector(state => state.auth);
    const { name, email } = useSelector(state => state.auth);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [isRightMenuVisible, setIsRightMenuVisible] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(-sidebarWidth)).current;
    const rightMenuOpacity = useRef(new Animated.Value(0)).current;
    const rightMenuTranslateY = useRef(new Animated.Value(-20)).current;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    // Menu items based on the provided image
    const menuItems = [
        { name: t('home'), icon: 'home-outline', route: `${t('home')}`, requiresAuth: false },
        { name: t('shopByCategory'), icon: 'grid-outline', route: `${t('category')}`, requiresAuth: false },
        { name: t('orders'), icon: 'receipt-outline', route: 'AllOrderDetails', requiresAuth: true },
        { name: t('cart'), icon: 'cart-outline', route: `${t('cart')}`, requiresAuth: false },
        { name: t('wishlist'), icon: 'heart-outline', route: `${t('wishlist')}`, requiresAuth: false },
        { name: t('account'), icon: 'person-outline', route: 'AccountStack', requiresAuth: false },
        { name: t('privacyPolicy'), icon: 'lock-closed-outline', route: 'PrivacyPolicy', requiresAuth: false },
        { name: t('language'), icon: 'language-outline', route: 'LanguageScreen', requiresAuth: false },
    ];

    // Get the first character of the user's name
    const getFirstCharacter = () => {
        if (name && name.length > 0) {
            return name.charAt(0).toUpperCase();
        }
        return '';
    };

    useEffect(() => {
        Animated.timing(sidebarTranslateX, {
            toValue: isSidebarVisible ? 0 : -sidebarWidth,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isSidebarVisible]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(rightMenuOpacity, {
                toValue: isRightMenuVisible ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(rightMenuTranslateY, {
                toValue: isRightMenuVisible ? 0 : -20,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    }, [isRightMenuVisible]);

    const handleLeftIconPress = () => {
        if (onLeftIconPress) {
            onLeftIconPress();
        } else {
            setIsSidebarVisible(true);
        }
    };

    const handleRightIconPress = () => {
        setIsRightMenuVisible(!isRightMenuVisible);
    };

    const handleSearchIconPress = () => {
        navigation.navigate('SearchScreen');
    };

    const handleCloseSidebar = () => {
        setIsSidebarVisible(false);
    };

    const handleCloseRightMenu = () => {
        setIsRightMenuVisible(false);
    };

    const handleMenuItemPress = (route, params = {}) => {
        const menuItem = menuItems.find(item => item.route === route);

        // Check if menu item requires authentication
        if (menuItem && menuItem.requiresAuth && !token) {
            // Show login modal if not authenticated
            setShowLoginModal(true);
            setIsSidebarVisible(false);
        }
        else if (menuItem && menuItem.route === 'AllOrderDetails' && token && menuItem.requiresAuth) {
            // Navigate to nested screen via AccountTab > AllOrderDetails
            navigation.navigate('AccountStack', { screen: 'AllOrderDetails' });
        }
        else if (menuItem && menuItem.route === 'CartScreen') {
            // Navigate to nested screen via AccountTab > Wishlist
            navigation.navigate('Cart');
        }
        else if (menuItem && menuItem.route === 'PrivacyPolicy') {
            // Navigate to nested screen via AccountTab > Wishlist
            navigation.navigate('AccountStack', { screen: 'PrivacyPolicy' });
        }
        else {
            // Navigate to the route if authenticated or auth not required
            navigation.navigate(route, params);
            setIsSidebarVisible(false);
        }
    };

    const handleLogin = () => {
        setShowLoginModal(false);
        navigation.navigate('AccountStack', { screen: 'AuthScreen' });
    };

    const handleLogout = () => {
        // Add logout logic here - this would typically dispatch a logout action
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: () => {
                        setTimeout(() => {
                            dispatch(logoutAndClearCart());
                            navigation.navigate('AccountStack', { screen: 'AuthScreen' });
                        }, 200);
                    }
                }
            ]
        );
    };

    return (
        <>
            <View style={[styles.headerContainer, headerStyle]}>
                {/* Left Menu Icon */}
                <TouchableOpacity
                    style={[styles.iconButton, iconContainerStyle]}
                    onPress={handleLeftIconPress}
                >
                    <Icon name={leftIcon.name} size={leftIcon.size} color={appNameController.statusBarColor} />
                </TouchableOpacity>
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <View style={{ width: '10%' }}>
                        <Image
                            source={require('../../Assets/splash.png')}
                            style={{
                                marginVertical: 4,
                                width: 40,
                                height: 40,
                            }}
                            resizeMode="center"
                        />
                    </View>
                    <Text style={[styles.appName, titleStyle]}>{appNameController.appName}</Text>
                </View>
                <View style={styles.rightIconsContainer}>
                    {/* Profile/User Icon Button */}
                    <TouchableOpacity
                        style={[styles.iconButton, iconContainerStyle]}
                        onPress={handleRightIconPress}
                    >
                        {token ? (
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{getFirstCharacter()}</Text>
                            </View>
                        ) : (
                            <Icon name={rightIcon.name} size={rightIcon.size} color={appNameController.statusBarColor} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Login Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showLoginModal}
                onRequestClose={() => setShowLoginModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowLoginModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{t('signIn')} {t('required')}</Text>
                                    <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                                        <Icon name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.modalText}>
                                    {t('plaeseSignIn')}
                                </Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setShowLoginModal(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.loginButton}
                                        onPress={handleLogin}
                                    >
                                        <Text style={styles.loginButtonText}>{t('signIn')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Sidebar Menu - Updated to match the provided image */}
            <Animated.View style={[
                styles.sidebar,
                {
                    transform: [{ translateX: sidebarTranslateX }],
                    width: sidebarWidth
                }
            ]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* User Profile Section */}
                    <View style={styles.userProfileSection}>
                        <View style={styles.profileImage}>
                            {token ? (
                                <Text style={[styles.avatarText, { color: '#999' }]}>{getFirstCharacter()}</Text>
                            ) : (
                                <Icon name="person" size={28} color="#999" />
                            )}
                        </View>

                        <View style={styles.userInfo}>
                            {token ?
                                (
                                    <>
                                        <TouchableOpacity

                                            onPress={() => navigation.navigate('AccountStack')}>
                                            <Text numberOfLines={1} style={styles.userName}>{name.length > 20 ? `${name.substring(0, 20)}...` : name || "No User Found"}</Text>
                                            <Text numberOfLines={1} style={styles.userEmail}>{email.length > 20 ? `${email.substring(0, 20)}...` : email || "No email Found"}</Text>
                                        </TouchableOpacity>
                                    </>
                                )
                                :
                                (<>
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate('AccountStack', { screen: 'AuthScreen' });
                                        setIsSidebarVisible(false);
                                    }}>
                                        <Text style={styles.userName}>{t('signIn')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate('AccountStack', { screen: 'AuthScreen' });
                                        setIsSidebarVisible(false);
                                    }}>
                                        <Text style={styles.userEmail}>{t('createanAccount')}</Text>
                                    </TouchableOpacity>
                                </>
                                )}
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.menuItemsContainer}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => handleMenuItemPress(item.route)}
                            >
                                <View style={styles.menuItemIconContainer}>
                                    <Icon name={item.icon} size={22} color="#333" />
                                </View>
                                <Text style={styles.menuItemText}>{item.name}</Text>
                                <Icon name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Conditional Section - Contact Support or Login */}
                    {token ? (
                        // Contact Support Section for logged in users
                        <View style={styles.contactSupportContainer}>
                            <Text style={styles.contactSupportTitle}>{t('contactSupport')}</Text>
                            <Text style={styles.contactSupportText}>
                                {t('contactSupportIntro')}
                            </Text>
                            <TouchableOpacity
                                style={styles.contactUsButton}
                                onPress={() => handleMenuItemPress('ContactSupport')}
                            >
                                <Text style={styles.contactUsButtonText}>{t('contactUs')}</Text>
                            </TouchableOpacity>

                            {/* Logout Button */}
                            <TouchableOpacity
                                style={[styles.contactUsButton, { backgroundColor: '#f44336', marginTop: 10 }]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.contactUsButtonText}>{t('logOut')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Login Section for guests
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginContainerTitle}>{t('signIn')}</Text>
                            <Text style={styles.loginContainerText}>
                                {t('signInIntro')}
                            </Text>
                            <TouchableOpacity
                                style={styles.contactUsButton}
                                onPress={() => {
                                    navigation.navigate('AccountStack', { screen: 'AuthScreen' });
                                    setIsSidebarVisible(false);
                                }}
                            >
                                <Text style={styles.contactUsButtonText}>{t('signIn')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </Animated.View>

            {/* Only render right profile menu when it's visible */}
            {isRightMenuVisible && (
                <Animated.View
                    style={[
                        styles.profileMenu,
                        {
                            opacity: rightMenuOpacity,
                            transform: [{ translateY: rightMenuTranslateY }]
                        }
                    ]}
                >
                    {token ? (
                        <>
                            <TouchableOpacity
                                style={styles.profileMenuItem}
                                onPress={() => {
                                    handleMenuItemPress('AccountStack', { screen: 'ProfileScreen' });
                                    handleCloseRightMenu();
                                }}
                            >
                                <Icon name="person-outline" size={20} color="#333" />
                                <Text style={styles.profileMenuItemText}>{t('profile')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.profileMenuItem, styles.lastMenuItem]}
                                onPress={handleLogout}
                            >
                                <Icon name="log-out-outline" size={20} color="#333" />
                                <Text style={styles.profileMenuItemText}>{t('logOut')}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.profileMenuItem}
                                onPress={() => {
                                    handleMenuItemPress('AccountStack', { screen: 'AuthScreen' });
                                    handleCloseRightMenu();
                                }}
                            >
                                <Icon name="log-in-outline" size={20} color="#333" />
                                <Text style={styles.profileMenuItemText}>{t('login')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.profileMenuItem, styles.lastMenuItem]}
                                onPress={() => {
                                    handleMenuItemPress('AccountStack', { screen: 'AuthScreen' });
                                    handleCloseRightMenu();
                                }}
                            >
                                <Icon name="person-add-outline" size={20} color="#333" />
                                <Text style={styles.profileMenuItemText}>{t('register')}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Animated.View>
            )}

            {/* Overlay for closing menus */}
            {(isSidebarVisible || isRightMenuVisible) && (
                <TouchableWithoutFeedback
                    onPress={() => {
                        if (isSidebarVisible) {
                            handleCloseSidebar();
                        } else if (isRightMenuVisible) {
                            handleCloseRightMenu();
                        }
                    }}
                >
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        zIndex: 100,
    },
    iconButton: {
        padding: 8,
    },
    appName: {
        marginLeft: 5,
        fontSize: 24,
        fontWeight: '700',
        color: appNameController.statusBarColor,
    },
    rightIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 200,
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 300,
        paddingVertical: 20,
    },
    userProfileSection: {
        width: "100%",
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingBottom: 10,
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    profileImage: {

        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        width: "70%",
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        fontWeight: '400',

        color: '#888',
        marginTop: 2,
    },
    menuItemsContainer: {
        paddingTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    menuItemIconContainer: {
        width: 25,
        alignItems: 'center',
        marginRight: 10,
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    contactSupportContainer: {
        marginTop: 20,
        backgroundColor: '#f0f8ff',
        margin: 15,
        padding: 15,
        borderRadius: 10,
    },
    contactSupportTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    contactSupportText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 12,
    },
    loginContainer: {
        marginTop: 20,
        backgroundColor: '#f0f8ff',
        margin: 15,
        padding: 15,
        borderRadius: 10,
    },
    loginContainerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    loginContainerText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 12,
    },
    contactUsButton: {
        backgroundColor: '#00C998',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    contactUsButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    profileMenu: {
        position: 'absolute',
        top: 42,
        right: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        zIndex: 300,
        padding: 5,
        width: 120,
        elevation: 2,
    },
    profileMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    profileMenuItemText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: appNameController.statusBarColor,
        borderWidth: 0.3,
        borderColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.8,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    modalText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 15,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: appNameController.statusBarColor,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default AppHeader;

