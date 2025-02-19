import { StyleSheet, View, useWindowDimensions, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // Import expo-file-system
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { BackendUrl } from '@/context/backendUrl';
import { useAuth } from '@/context/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PictureData {
    uri: string;
}

export default function CameraScreen() {
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [pictures, setPictures] = useState<{ front: PictureData | null, back: PictureData | null }>({ front: null, back: null });
    const [permission, requestPermission] = useCameraPermissions();
    const { userId } = useAuth();
    const cameraRef = useRef<CameraView>(null);
    const [height, setHeight] = useState(0);
    const { width } = useWindowDimensions();

    useEffect(() => {
        const calculateHeight = () => {
            const newHeight = Math.round((width * 16) / 9);
            setHeight(newHeight);
        };
        calculateHeight(); // Initial calculation
    }, [width]);

    useEffect(() => {
        (async () => {
            await requestPermission();
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        })();
    }, []);

    if (!permission?.granted) {
        return <View />;
    }

    function toggleCameraFacing() {
        setFacing(current => current === 'back' ? 'front' : 'back');
    }

    async function takePicture() {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setPictures(prev => ({ ...prev, [facing]: photo }));
            toggleCameraFacing();
        }
    }

    async function submitPicture() {
        if (pictures.front && pictures.back) {
            try {
                // Read the images as Base64 encoded strings
                const frontBase64 = await FileSystem.readAsStringAsync(pictures.front.uri, { encoding: FileSystem.EncodingType.Base64 });
                const backBase64 = await FileSystem.readAsStringAsync(pictures.back.uri, { encoding: FileSystem.EncodingType.Base64 });

                const payload = {
                    front_image: frontBase64,
                    back_image: backBase64,
                    userID: parseInt(userId!),
                    visibility: "public"
                };
                console.log(payload)

                // POST the payload to the backend
                const response = await fetch(`${BackendUrl}/posts/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log("Upload successful");
                    // Optionally navigate or update UI based on a successful upload
                    // navigation.navigate('Main', { pictures });
                } else {
                    console.error("Upload failed:", response.status);
                }
            } catch (error) {
                console.error("Error during submitPicture:", error);
            }
        }
    }

    return (
        <View style={styles.container}>
            <CameraView 
                ref={cameraRef}
                style={[styles.camera, { height: 393 }]}
                facing={facing}
                // resizeMode="cover" // Add resizeMode to handle different screen sizes
            >
                {pictures[facing === 'front' ? 'back' : 'front'] && (
                    <Image
                        source={{ uri: pictures[facing === 'front' ? 'back' : 'front']!.uri }}
                        style={styles.previewImage}
                    />
                )}
            </CameraView>
            <SafeAreaView style={styles.safeArea}>
            <View style={styles.controls}>
                <TouchableOpacity onPress={toggleCameraFacing}>
                    <MaterialIcons name="flip-camera-ios" size={40} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.captureButton, { backgroundColor: pictures.front && pictures.back ? '#28a745' : '#dc3545' }]} onPress={takePicture}>
                    <MaterialIcons name="camera" size={28} color="white" />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={submitPicture}
                    disabled={!pictures.front || !pictures.back}
                >
                    <MaterialIcons 
                        name="check-circle" 
                        size={40} 
                        color={pictures.front && pictures.back ? 'green' : 'gray'} 
                    />
                </TouchableOpacity>
            </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        width: '100%',
        flex: 4,
        borderRadius: 20,
        backgroundColor: 'black',
    },
    controls: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
        borderRadius: 50,
        marginBottom: 70,
        // backgroundColor: 'rgba(255, 255, 0, 0.5)',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red',
    },
    previewImage: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 100,
        height: 150,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
    },
});