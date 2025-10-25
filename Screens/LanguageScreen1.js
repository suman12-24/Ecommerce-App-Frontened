// Screens/LanguageScreen.js
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentLanguage } from '../redux/languageSlice';
import { setLanguage, getSavedLanguage } from '../localization/i18n';
import appNameController from './Model/appNameController';

const LanguageScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currentLanguage = useSelector((state) => state.language.currentLanguage);
    const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

    useEffect(() => {
        // Load the saved language when component mounts
        const loadLanguage = async () => {
            const language = await getSavedLanguage();
            setSelectedLanguage(language);
            dispatch(setCurrentLanguage(language));
        };

        if (!currentLanguage) {
            loadLanguage();
        } else {
            setSelectedLanguage(currentLanguage);
        }
    }, [dispatch, currentLanguage]);

    const handleLanguageChange = async (language) => {
        setSelectedLanguage(language);
        await setLanguage(language);
        dispatch(setCurrentLanguage(language));
    };

    const handleContinue = () => {
        // Navigate to the next screen or go back
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Navigate to your home screen or main screen
            navigation.replace('Home'); // Replace with your main screen name
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={appNameController.statusBarColor} barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('selectLanguage')}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>{t('choosePreferredLanguage')}</Text>

                <TouchableOpacity
                    style={[
                        styles.languageOption,
                        selectedLanguage === 'en' && styles.selectedOption
                    ]}
                    onPress={() => handleLanguageChange('en')}
                >
                    <View style={styles.languageInfo}>
                        <Text style={[
                            styles.languageName,
                            selectedLanguage === 'en' && styles.selectedText
                        ]}>English</Text>
                        <Text style={[
                            styles.nativeLanguageName,
                            selectedLanguage === 'en' && styles.selectedText
                        ]}>English</Text>
                    </View>

                    {selectedLanguage === 'en' && (
                        <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.languageOption,
                        selectedLanguage === 'bn' && styles.selectedOption
                    ]}
                    onPress={() => handleLanguageChange('bn')}
                >
                    <View style={styles.languageInfo}>
                        <Text style={[
                            styles.languageName,
                            selectedLanguage === 'bn' && styles.selectedText
                        ]}>Bengali</Text>
                        <Text style={[
                            styles.nativeLanguageName,
                            selectedLanguage === 'bn' && styles.selectedText
                        ]}>বাংলা</Text>
                    </View>

                    {selectedLanguage === 'bn' && (
                        <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleContinue}
            >
                <Text style={styles.confirmButtonText}>{t('continue')}</Text>
            </TouchableOpacity> */}
        </View>
    );
};

export default LanguageScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        backgroundColor: appNameController.statusBarColor,
        padding: 16,
        alignItems: 'center',
        elevation: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedOption: {
        backgroundColor: appNameController.selectedCategoryBackgroundColor,
        borderColor: appNameController.textColor,
    },
    languageInfo: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    nativeLanguageName: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    selectedText: {
        color: appNameController.textColor,
        fontWeight: 'bold',
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: appNameController.textColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    confirmButton: {
        backgroundColor: appNameController.textColor,
        padding: 16,
        alignItems: 'center',
        margin: 20,
        borderRadius: 8,
    },
    confirmButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});