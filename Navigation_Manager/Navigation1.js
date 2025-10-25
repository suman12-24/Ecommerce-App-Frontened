import { Platform, Settings, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../Screens/ProfileScreen';
import HomeScreen from '../Screens/HomeScreen';
import CustomTabBar from '../Components/CustomTabBar';
import SettingsScreen from '../Screens/SettingsScreen';
import CartScreen from '../Screens/CartScreen';
import WishlistScreen from '../Screens/WishlistScreen';
import MenuScreen from '../Screens/MenuScreen';
import ProductDetailsScreen from '../Screens/ProductDetailsScreen';
import SearchScreen from '../Screens/SearchScreen';
import AllOrderDetails from '../Screens/AllOrderDetails';
import RegistrationAndLoginScreen from '../Screens/RegistrationAndLoginScreen';
import OrderSummaryPage from '../Screens/SelectDeliveryAddress';
import SubCategory from '../Screens/CategoryMainScreen';
import CategoryMainScreen from '../Screens/CategoryMainScreen';
import ViewAllProductScreen from '../Screens/ViewAllProductScreen';
import ViewCustomerAddress from '../Screens/ViewCustomerAddress';
import AddCustomerAddress from '../Screens/AddCustomerAddress';
import EditCustomerAddress from '../Screens/EditCustomerAddress';
import CategoryScreen from '../Screens/CategoryScreen';
import ProductListingScreen from '../Screens/ProductListingScreen';
import AuthScreen from '../Screens/AuthScreen';

const Navigation = () => {
    const Stack = createNativeStackNavigator();

    const HomeStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="HomeScreen"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="SearchScreen"
                    component={SearchScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="RegistrationAndLoginScreen"
                    component={RegistrationAndLoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="CategoryMainScreen"
                    component={CategoryMainScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ViewAllProductScreen"
                    component={ViewAllProductScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        )
    }

    const AccountStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="ProfileScreen"
                    component={ProfileScreen}
                    options={{ headerShown: false }}
                />


                <Stack.Screen
                    name="AllOrderDetails"
                    component={AllOrderDetails}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ViewCustomerAddress"
                    component={ViewCustomerAddress}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AddCustomerAddress"
                    component={AddCustomerAddress}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EditCustomerAddress"
                    component={EditCustomerAddress}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AuthScreen"
                    component={AuthScreen}
                    options={{ headerShown: false }}
                />

            </Stack.Navigator>
        )
    }

    const CartStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="CartScreen"
                    component={CartScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name='OrderSummaryPage'
                    component={OrderSummaryPage}
                />
            </Stack.Navigator>
        )
    }

    const WishlistStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="WishlistScreen"
                    component={WishlistScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        )
    }

    const MenuStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="MenuScreen"
                    component={MenuScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        )
    }

    const CategoryStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="CategoryScreen"
                    component={CategoryScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ProductListingScreen"
                    component={ProductListingScreen}
                    options={({ route }) => ({
                        title: route.params.subcategoryName
                    })}
                />
            </Stack.Navigator>)
    }

    const BottomTabNavigator = () => {
        return (
            <Tab.Navigator
                tabBar={props => <CustomTabBar {...props} />}
                screenOptions={{ headerShown: false }}
            >
                <Tab.Screen name="Home" component={HomeStack} />
                <Tab.Screen name="Account" component={AccountStack} />
                <Tab.Screen name="Category" component={CategoryStack} />
                <Tab.Screen name="Search" component={SearchScreen} />
                <Tab.Screen name="Cart" component={CartStack} />
                <Tab.Screen name="Wishlist" component={WishlistStack} />
            </Tab.Navigator>
        )
    }

    const Tab = createBottomTabNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator >
                <Stack.Screen
                    name="BottomTabNavigator"
                    component={BottomTabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ProductDetailsScreen"
                    component={ProductDetailsScreen}
                    options={{ headerShown: false }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navigation
const styles = StyleSheet.create({})