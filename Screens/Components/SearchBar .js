import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Use Ionicons for the search and clear icons
import { useTranslation } from 'react-i18next';
const SearchBar = ({ placeholder = "Search for products...", navigation }) => {
    const [searchText, setSearchText] = useState('');
    const { t } = useTranslation();
    const handleClear = () => {
        setSearchText('');
    };

    return (
        <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')} style={styles.container}
            activeOpacity={1}
        >
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#888" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('searchProduct')}
                    placeholderTextColor="#888"
                    value={searchText}
                    editable={false}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        paddingHorizontal: 15,
        width: "100%"
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        padding: 5,
    },
});

export default SearchBar;
