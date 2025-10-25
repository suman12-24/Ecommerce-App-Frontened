import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldAlert, ShieldCheck, PackageCheck, PackageX, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
const StockIndicator = ({ stock }) => {
    const {t}=useTranslation();
    const isLowStock = stock <= 5;

    return (
        <View style={[
            styles.container,
            isLowStock ? styles.lowStockContainer : styles.inStockContainer
        ]}>
            <View style={styles.iconWrapper}>
                {isLowStock ? (
                    <>
                        <AlertTriangle color="#DC2626" size={24} style={styles.warningIcon} />
                        <ShieldAlert color="#DC2626" size={24} style={styles.shieldIcon} />
                    </>
                ) : (
                    <>
                        <PackageCheck color="#0ba893" size={24} style={styles.checkIcon} />
                        <ShieldCheck color="#0ba893" size={24} style={styles.shieldIcon} />
                    </>
                )}
            </View>

            <View style={styles.textContainer}>
                <Text style={[
                    styles.stockTitle,
                    isLowStock ? styles.lowStockText : styles.inStockText
                ]}>
                    {isLowStock ? `${t('lowStockAlert')}` : `${t('inStock')}`}
                </Text>
                <Text style={[
                    styles.stockSubtitle,
                    isLowStock ? styles.lowStockSubtitle : styles.inStockSubtitle
                ]}>
                    {isLowStock
                        ? `${t('only')} ${stock} ${t('itemRemaining')}`
                        : `${t('plentyStockAvilable')}`}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginLeft: 18,
        marginRight: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    lowStockContainer: {
        backgroundColor: '#FFF0F0',
        borderColor: '#FF6347',
    },
    inStockContainer: {
        backgroundColor: '#F0FFF0',
        borderColor: '#0ba893',
    },
    iconWrapper: {
        position: 'relative',
        marginRight: 15,
        width: 30,
        height: 30,
    },
    shieldIcon: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    warningIcon: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    checkIcon: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    textContainer: {
        flex: 1,
    },
    stockTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    stockSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    lowStockText: {
        color: '#B22222',
    },
    inStockText: {
        color: '#0ba893',
    },
    lowStockSubtitle: {
        color: '#DC2626',
    },
    inStockSubtitle: {
        color: '#0ba893',
    },
});

export default StockIndicator;