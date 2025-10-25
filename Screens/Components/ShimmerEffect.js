import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const { width, height } = Dimensions.get('window');

// Create a shimmer placeholder
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const CategoryShimmerEffect = () => {
  return (
    <View style={styles.categoryShimmerContainer}>
      {[...Array(8)].map((_, index) => (
        <View key={index} style={styles.categoryShimmerItem}>
          <ShimmerPlaceholder
            style={styles.categoryShimmerImage}
            shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
          />
          <ShimmerPlaceholder
            style={styles.categoryShimmerText}
            shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
          />
        </View>
      ))}
    </View>
  );
};

const ProductShimmerEffect = () => {
  return (
    <View style={styles.productShimmerContainer}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.productShimmerCard}>
          <ShimmerPlaceholder
            style={styles.productShimmerImage}
            shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
          />
          <View style={styles.productShimmerDetails}>
            <ShimmerPlaceholder
              style={styles.productShimmerName}
              shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
            />
            <ShimmerPlaceholder
              style={styles.productShimmerPrice}
              shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
            />
            <ShimmerPlaceholder
              style={styles.productShimmerButton}
              shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryShimmerContainer: {
    flexDirection: 'column',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  categoryShimmerItem: {
    alignItems: 'center',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  categoryShimmerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  categoryShimmerText: {
    width: 50,
    height: 15,
    borderRadius: 4,
  },

  productShimmerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  productShimmerCard: {
    width: width * 0.75,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    elevation: 2,
  },
  productShimmerImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  productShimmerDetails: {
    alignItems: 'center',
  },
  productShimmerName: {
    width: '80%',
    height: 15,
    borderRadius: 4,
    marginBottom: 10,
  },
  productShimmerPrice: {
    width: '60%',
    height: 15,
    borderRadius: 4,
    marginBottom: 10,
  },
  productShimmerButton: {
    width: '90%',
    height: 40,
    borderRadius: 8,
  },
});

export { CategoryShimmerEffect, ProductShimmerEffect };
