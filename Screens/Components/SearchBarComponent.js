import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const SearchBarComponent = ({
  placeholder = "Search for products...",
  onSearch = () => { },
  onClear = () => { },
  style = {},
  accentColor = '#6c5ce7',
  darkMode = false,
  navigationDestination = 'SearchScreen',
  width = '100%' // Added width prop to control search bar width
}) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
const {t}=useTranslation();
  const handleClear = () => {
    setSearchText('');
    onClear();
  };

  // Navigate to search screen when search bar is clicked
  const handleSearchBarClick = () => {
    navigation.navigate(navigationDestination);
  };

  const theme = {
    background: darkMode ? '#1a1a2e' : '#fff',
    searchBg: darkMode ? '#252543' : '#f7f7fc',
    text: darkMode ? '#ffffff' : '#333',
    placeholder: darkMode ? '#9999ad' : '#9a9a9a',
    icon: darkMode ? '#9999ad' : '#666',
    accent: accentColor,
    cancel: darkMode ? '#e1e1ff' : accentColor,
    border: darkMode ? '#3a3a5c' : '#e6e6ef',
    shadowColor: darkMode ? '#000' : '#6c5ce740',
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleSearchBarClick}
        style={{ width }}
      >
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.searchBg,
              borderColor: theme.border,
            }
          ]}
        >
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={20} color={theme.icon} />
          </View>

          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={`${t('searchProduct')}...`}
            value={searchText}
            editable={false}
            placeholderTextColor={theme.placeholder}
            pointerEvents="none"
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearIcon}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <View style={[styles.clearButton, { backgroundColor: theme.border }]}>
                <Ionicons name="close" size={12} color={theme.icon} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center', // Center the search bar
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    shadowColor: '#6c5ce740',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    paddingRight: 8,
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    fontWeight: '400',
  },
  clearIcon: {
    padding: 4,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SearchBarComponent;