import {createSlice} from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalQuantity: 0,
    coupon: null, // ✅ Add this to store coupon details
    deliveryAddress: null,
    priceSummary: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const itemIndex = state.items.findIndex(
        item => item.id === action.payload.id,
      );
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity += 1;
      } else {
        state.items.push({...action.payload, quantity: 1});
      }
      state.totalQuantity += 1;
    },
    addMultipleToCart: (state, action) => {
      action.payload.forEach(product => {
        const itemIndex = state.items.findIndex(item => item.id === product.id);
        if (itemIndex >= 0) {
          state.items[itemIndex].quantity += product.quantity || 1; // ✅ Corrected quantity update
        } else {
          state.items.push({...product, quantity: product.quantity || 1});
        }
        state.totalQuantity += product.quantity || 1; // ✅ Add correct quantity
      });
    },
    incrementQuantity: (state, action) => {
      const itemIndex = state.items.findIndex(
        item => item.id === action.payload.id,
      );
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity += 1;
        state.totalQuantity += 1;
      }
    },
    decrementQuantity: (state, action) => {
      const itemIndex = state.items.findIndex(
        item => item.id === action.payload.id,
      );
      if (itemIndex >= 0) {
        if (state.items[itemIndex].quantity > 1) {
          state.items[itemIndex].quantity -= 1;
          state.totalQuantity = Math.max(0, state.totalQuantity - 1); // ✅ Prevent negative totalQuantity
        } else {
          state.items = state.items.filter(
            item => item.id !== action.payload.id,
          );
          state.totalQuantity = Math.max(0, state.totalQuantity - 1);
        }
      }
    },
    removeFromCart: (state, action) => {
      const removedItem = state.items.find(
        item => item.id === action.payload.id,
      );
      if (removedItem) {
        state.totalQuantity = Math.max(
          0,
          state.totalQuantity - removedItem.quantity,
        ); // ✅ Prevent negative totalQuantity
        state.items = state.items.filter(item => item.id !== action.payload.id);
      }
    },
    updateCartQuantity: (state, action) => {
      const {id, quantity} = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);

      if (itemIndex >= 0) {
        if (quantity > 0) {
          state.items[itemIndex].quantity = quantity;
          state.totalQuantity = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
        } else {
          state.items.splice(itemIndex, 1); // ✅ Remove item if quantity is 0 or less
          state.totalQuantity = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
        }
      }
    },
    clearCart: state => {
      state.items = [];
      state.totalQuantity = 0;
    },

    // ✅ Add this reducer to update cart items from API
    setCartItems: (state, action) => {
      state.items = action.payload;
      state.totalQuantity = action.payload.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload; // Store the coupon details
    },
    removeSelectedCoupon: state => {
      state.coupon = null; // Remove the coupon
    },
    setDeliveryAddress: (state, action) => {
      state.deliveryAddress = action.payload;
    },
    clearDeliveryAddress: state => {
      state.deliveryAddress = null;
    },
    setPriceSummary: (state, action) => {
      state.priceSummary = action.payload;
    },
    clearPriceSummary: state => {
      state.priceSummary = null;
    },
  },
});

export const {
  addToCart,
  addMultipleToCart,
  incrementQuantity,
  decrementQuantity,
  updateCartQuantity,
  removeFromCart,
  setCartItems,
  clearCart,
  applyCoupon,
  removeSelectedCoupon,
  setDeliveryAddress,
  clearDeliveryAddress,
  setPriceSummary,
  clearPriceSummary,
} = cartSlice.actions;

export default cartSlice.reducer;
