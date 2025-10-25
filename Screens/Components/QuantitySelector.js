import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
const QuantitySelector = ({ value, onSelect, stock }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const quantityBoxRef = useRef(null);
    const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });

    // Open dropdown below quantity box
    const openModal = () => {
        if (quantityBoxRef.current) {
            quantityBoxRef.current.measure((fx, fy, width, height, px, py) => {
                setBoxPosition({ top: py + height + 5, left: px });
            });
        }
        setModalVisible(true);
    };

    // Select quantity and close modal
    const handleSelect = (num) => {
        onSelect(num);
        setModalVisible(false);
    };

    return (
        <View>
            {/* Quantity Box (like HTML select) */}
            <TouchableOpacity
                ref={quantityBoxRef}
                style={styles.quantityBox}
                onPress={openModal}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Text style={{ fontSize: 13, fontWeight: "500", color: 'black' }}>Qty:</Text>
                    <Text style={[styles.quantityText, { textAlign: 'center' }]}>{value}</Text>
                    <Icon name="arrow-drop-down" size={25} color="#000" />
                </View>
            </TouchableOpacity>

            {/* Small Dropdown Modal (Like an HTML <select>) */}
            {modalVisible && (
                <Modal transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        <View
                            style={[
                                styles.modalContent,
                                { top: boxPosition.top, left: boxPosition.left }
                            ]}
                        >
                            <FlatList
                                data={Array.from({ length: stock?.stock }, (_, i) => i + 1)}
                                keyExtractor={(item) => item.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={styles.modalText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                style={styles.modalList}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    quantityBox: {
        width: 85,
        height: 30,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 5,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-evenly',
        backgroundColor: "#fff",
    },
    quantityText: {
        fontSize: 14,
        fontWeight: "500",
        color: 'black'
    },
    overlay: {
        flex: 1,
        // backgroundColor: "rgba(0,0,0,0.1)", // Light background effect
        justifyContent: "flex-start",
    },
    modalContent: {
        position: "absolute",
        marginTop: -25,
        width: 70,
        backgroundColor: "#fff",
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        maxHeight: 125, // Restrict height (scrollable)
    },
    modalList: {
        maxHeight: 200, // Enables scrolling when needed
    },
    modalItem: {
        padding: 10,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalText: {
        fontSize: 16,
    },
});

export default QuantitySelector;
