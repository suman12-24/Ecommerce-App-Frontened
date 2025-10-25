import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { PermissionsAndroid, Platform } from 'react-native';

const DemoPdf = () => {
    const [pdfPath, setPdfPath] = useState(null);

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const generatePDF = async () => {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to save PDF.');
            return;
        }

        try {
            const options = {
                html: `
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { text-align: center; color: #007bff; }
                            p { font-size: 16px; text-align: justify; }
                            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: gray; }
                        </style>
                    </head>
                    <body>
                        <h1>Hello, this is a PDF!</h1>
                        <p>This PDF was generated in React Native using react-native-html-to-pdf.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</p>
                        <p>Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.</p>
                        <div class="footer">Generated on ${new Date().toLocaleDateString()}</div>
                    </body>
                    </html>
                `,
                fileName: 'my_pdf_document',
                directory: 'Documents',
            };

            const file = await RNHTMLtoPDF.convert(options);
            setPdfPath(file.filePath);
            Alert.alert('PDF Generated', `Saved at: ${file.filePath}`);
        } catch (error) {
            console.error('PDF generation error:', error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 }}>
            <TouchableOpacity
                onPress={generatePDF}
                style={{
                    backgroundColor: '#007bff',
                    padding: 12,
                    borderRadius: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 3,
                }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Generate PDF</Text>
            </TouchableOpacity>
            {pdfPath && (
                <ScrollView style={{ marginTop: 20, padding: 10, backgroundColor: '#fff', borderRadius: 5, elevation: 2 }}>
                    <Text style={{ color: '#333', fontSize: 14, textAlign: 'center' }}>PDF saved at:</Text>
                    <Text style={{ color: 'blue', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>{pdfPath}</Text>
                </ScrollView>
            )}
        </View>
    );
};

export default DemoPdf;