import { StyleSheet, View, useWindowDimensions, TouchableOpacity, Image } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

interface PictureData {
    uri: string;
}

export default function CameraScreen() {
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [pictures, setPictures] = useState<{ front: PictureData | null, back: PictureData | null }>({ front: null, back: null });
    const [permission, requestPermission] = useCameraPermissions();
    const navigation = useNavigation();
    const cameraRef = useRef<CameraView>(null);
    const { width } = useWindowDimensions();
    const height = Math.round((width * 16) / 9);

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

    function submitPicture() {
        if (pictures.front && pictures.back) {
            // navigation.navigate('Main', { pictures });
        }
    }

    return (
        <View style={styles.container}>
            <CameraView 
                ref={cameraRef}
                style={[styles.camera, { height }]}
                facing={facing}
            >
                {pictures[facing === 'front' ? 'back' : 'front'] && (
                    <Image
                        source={{ uri: pictures[facing === 'front' ? 'back' : 'front']!.uri }}
                        style={styles.previewImage}
                    />
                )}
            </CameraView>

            <View style={styles.controls}>
                <TouchableOpacity onPress={toggleCameraFacing}>
                    <MaterialIcons name="flip-camera-ios" size={40} color="white" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.captureButton}
                    onPress={takePicture}
                />

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        width: '100%',
    },
    controls: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
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
    }
});