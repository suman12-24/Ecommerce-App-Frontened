import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import appNameController from '../Model/appNameController';
import { useTranslation } from 'react-i18next';
const MenuItem = React.memo(({ item, onPress }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useTranslation();
  const handleLoadStart = useCallback(() => setIsLoading(true), []);
  const handleLoadEnd = useCallback(() => setIsLoading(false), []);

  return (

    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={appNameController.activityIndicatorColor} />
          </View>
        )}
        <LinearGradient
          colors={['#f5f7fa', '#eef1f6']}
          style={styles.gradientBackground}
        />
        <Image
          source={item.image}
          style={styles.menuImage}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.menuText} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
    </TouchableOpacity>
  );
});

const ViewAllButton = React.memo(({ onPress }) => {
  // Add useTranslation hook here
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity
      style={styles.viewAllButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#E0EAFC', '#CFDEF3']}
        style={styles.viewAllCircle}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.viewAllIcon}>→</Text>
        </View>
      </LinearGradient>
      <Text style={styles.viewAllText}>{t('viewAll')}</Text>
    </TouchableOpacity>
  );
});

const HorizontalMenu = ({ menuItems, onPressItem, onPressViewAll }) => {
  const renderItem = useCallback(({ item }) => (
    <MenuItem item={item} onPress={onPressItem} />
  ), [onPressItem]);

  const keyExtractor = useCallback((item, index) => `menu-item-${index}`, []);

  const ListFooterComponent = useMemo(() => (
    <ViewAllButton onPress={onPressViewAll} />
  ), [onPressViewAll]);

  return (
    <View style={styles.menuContainer}>
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={ListFooterComponent}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );


};

const styles = StyleSheet.create({
  menuContainer: {
    paddingVertical: 5,
  },
  listContent: {
    paddingHorizontal: 5,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    width: 75,
  },
  imageContainer: {
    width: 70,
    height: 70,
    position: 'relative',
    marginBottom: 5,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuImage: {
    width: '80%',
    height: '80%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderRadius: 20,
  },
  menuText: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    width: 80,
  },
  viewAllButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  viewAllCircle: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    width: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  viewAllIcon: {
    marginTop: -10,
    fontSize: 25,
    color: '#555',
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

});

export default React.memo(HorizontalMenu);

