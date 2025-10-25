import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import ImageSlider from './Components/ImageSlider';
import HorizontalMenu from './Components/HorizontalMenu';
import AppHeader from './Components/AppHeader';
import axiosInstance, { baseURL } from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import TagGroupDisplay from './Components/TagGroupDisplay';
import UploadElectricianSleep from './Components/UploadElectricianSleep';
import AppPopUp from './Components/AppPopUp';
import appNameController from './Model/appNameController';
import { useDispatch, useSelector } from 'react-redux';
import { setPopupShown, resetPopup } from '../redux/popupSlice';

const HomeScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tagGroup, setTagGroup] = useState([]);
    const [showPopup, setShowPopup] = useState(true);

    const dispatch = useDispatch();
    const isPopupShown = useSelector((state) => state.popup.shown);

    useEffect(() => {
        // Show popup only on app start, not on navigation
        if (!isPopupShown) {
            console.log('Showing popup message'); // Replace with actual popup UI
            dispatch(setPopupShown());
        }
    }, [isPopupShown, dispatch]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/Suhani-Electronics-Backend/f_category.php');
                if (response.data.success) {
                    const formattedCategories = response.data.data.map(category => ({
                        id: category.id,
                        name: category.name,
                        image: { uri: `${baseURL}/Category_main/` + category.logo },
                    }));
                    setCategories(formattedCategories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchTagGroup = async () => {
            try {
                const response = await axiosInstance.get('/Suhani-Electronics-Backend/f_product_group.php');

                if (response.data?.success) {
                    setTagGroup(response?.data?.data);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };

        fetchCategories();
        fetchTagGroup();
    }, []);

    const handleMenuItemPress = (item) => {
        navigation.navigate('CategoryMainScreen', item.id);
    };

    const handlePopupClose = () => {
        console.log("Popup closed callback received");
        setShowPopup(false);
    };

    // Debug
    console.log("HomeScreen rendering, showPopup:", showPopup);

    return (
        <>
            <StatusBar backgroundColor={appNameController.statusBarColor} barStyle="light-content" />
            <View style={{ flex: 1, paddingBottom: 50, backgroundColor: '#fff' }}>
                <AppHeader onRightIconPress={() => navigation.navigate('Cart')} />

                {/* Always render the popup component during initial mount */}
                {isPopupShown &&
                    <AppPopUp onClose={handlePopupClose} />}

                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Shimmer Effect for Categories */}
                    {loading ? (
                        <View style={styles.shimmerContainer}>
                            {[...Array(5)].map((_, index) => (
                                <ShimmerPlaceholder
                                    key={index}
                                    style={styles.shimmerBox}
                                    shimmerColors={['#ebebeb', '#c5c5c5', '#ebebeb']}
                                    LinearGradient={LinearGradient}
                                />
                            ))}
                        </View>
                    ) : (
                        <HorizontalMenu
                            menuItems={categories}
                            onPressItem={handleMenuItemPress}
                            onPressViewAll={() => navigation.navigate('Category')}
                        />
                    )}

                    <ImageSlider />
                    <UploadElectricianSleep />
                    {tagGroup.map((item, index) => (
                        <TagGroupDisplay key={index} tagGroupName={item} />
                    ))}
                </ScrollView>
            </View>
        </>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    shimmerContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 20,
        justifyContent: 'space-between',
    },
    shimmerBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginHorizontal: 8,
    },
});

