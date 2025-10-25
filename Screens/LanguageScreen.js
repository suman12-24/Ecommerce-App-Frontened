// Screens/LanguageScreen.js
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentLanguage } from '../redux/languageSlice';
import { setFirstLaunchComplete } from '../redux/firstLaunchSlice'; // Import the new action
import { setLanguage } from '../localization/i18n';
import appNameController from './Model/appNameController';

const LanguageScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currentLanguage = useSelector((state) => state.language.currentLanguage);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [isButtonPressed, setIsButtonPressed] = useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Define available languages with more details - only English and Bengali
    const languages = [
        {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flagEmoji: '🇺🇸'
        },
        {
            code: 'bn',
            name: 'Bengali',
            nativeName: 'বাংলা',
            flagEmoji: '🇮🇳'
        }
    ];

    const handleLanguageSelection = (language) => {
        setSelectedLanguage(language);

        // Add haptic feedback animation
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleSelectLanguage = async () => {
        if (selectedLanguage) {
            // Show button press effect
            setIsButtonPressed(true);
            setTimeout(() => setIsButtonPressed(false), 200);

            // Set language
            await setLanguage(selectedLanguage);
            dispatch(setCurrentLanguage(selectedLanguage));
            
            // Mark first launch as complete
            dispatch(setFirstLaunchComplete());

            // Navigate to the main app
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabNavigator' }],
            });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={appNameController.statusBarColor} barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('selectLanguage')}</Text>
            </View>

            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome / স্বাগতম</Text>
                <Text style={styles.subtitle}>{t('choosePreferredLanguage')}</Text>
            </View>

            <View style={styles.content}>
                {languages.map((language) => (
                    <Animated.View
                        key={language.code}
                        style={[
                            { transform: [{ scale: selectedLanguage === language.code ? buttonScale : 1 }] }
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.languageOption,
                                selectedLanguage === language.code && styles.selectedOption
                            ]}
                            onPress={() => handleLanguageSelection(language.code)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.flagEmoji}>{language.flagEmoji}</Text>

                            <View style={styles.languageInfo}>
                                <Text style={[
                                    styles.languageName,
                                    selectedLanguage === language.code && styles.selectedText
                                ]}>{language.name}</Text>
                                <Text style={[
                                    styles.nativeLanguageName,
                                    selectedLanguage === language.code && styles.selectedSubText
                                ]}>{language.nativeName}</Text>
                            </View>

                            {selectedLanguage === language.code && (
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.selectButton,
                        !selectedLanguage && styles.disabledButton,
                        isButtonPressed && styles.pressedButton
                    ]}
                    onPress={handleSelectLanguage}
                    disabled={!selectedLanguage}
                    activeOpacity={0.8}
                >
                    <Text style={styles.selectButtonText}>{t('select')}</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

export default LanguageScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: appNameController.statusBarColor,
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    welcomeContainer: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        marginBottom: 16,
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    selectedOption: {
        //backgroundColor: `${appNameController.selectedCategoryBackgroundColor}15`, // Using alpha for transparency
        borderColor: appNameController.textColor,
        borderWidth: 2,
    },
    flagEmoji: {
        fontSize: 28,
        marginRight: 14,
    },
    languageInfo: {
        flex: 1,
        marginLeft: 4,
    },
    languageName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },
    nativeLanguageName: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    selectedText: {
        color: appNameController.textColor,
        fontWeight: 'bold',
    },
    selectedSubText: {
        color: appNameController.textColor,
    },
    checkmark: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: appNameController.textColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    footer: {
        marginBottom: 60,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#ffffff',
    },
    selectButton: {
        backgroundColor: appNameController.textColor,
        padding: 10,
        alignItems: 'center',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        opacity: 0.7,
        elevation: 1,
    },
    pressedButton: {
        backgroundColor: appNameController.textColor,
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    selectButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});