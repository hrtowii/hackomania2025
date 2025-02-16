import { BackendUrl } from '@/context/backendUrl';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Image, TextInput, Button, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Leaderboard from 'react-native-leaderboard';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from "react-native-modal";

export default function LeaderboardComponent() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leaderboardType, setLeaderboardType] = useState('health');
    const [numEntries, setNumEntries] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let url;
                if (leaderboardType === 'health') {
                    url = `${BackendUrl}/leaderboard/health/${numEntries}`;
                } else {
                    url = `${BackendUrl}/challenge_leaderboard/${leaderboardType}/${numEntries}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json();

                const transformedData = result.users.map((user, index) => ({
                    rank: index + 1, // Add rank
                    userName: user.username,
                    highScore: leaderboardType === 'health' ? user.health_score_avg : user.points,
                }));

                setLeaderboardData(transformedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [leaderboardType, numEntries]);

    const GradientText = ({ children }) => (
        <MaskedView maskElement={<Text style={styles.headerText}>{children}</Text>}>
            <LinearGradient
                colors={['#6a11cb', '#2575fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={[styles.headerText, { opacity: 0 }]}>{children}</Text>
            </LinearGradient>
        </MaskedView>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <GradientText>Leaderboard</GradientText>
        </View>
    );

    const renderRow = (item, index) => (
        <View style={styles.row}>
            <Text style={styles.rank}>{item.rank}</Text>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.score}>{item.highScore.toFixed(2)}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6a11cb" />
                <Text style={styles.loadingText}>Loading Leaderboard...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <MaterialIcons name="error-outline" size={50} color="#ff4444" />
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }



    function ModalTester() {
        const [isModalVisible, setModalVisible] = useState(false);
    
        const toggleModal = () => {
            setModalVisible(!isModalVisible);
        };
    
        return (
            <View>
                <Pressable onPress={toggleModal} style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>Show challenge details!</Text>
                </Pressable>
    
                <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Challenge Details</Text>
                        <Text style={styles.cardDescription}>
                            #1: Veggie Victory 🥦. Sneak some greens into your plate and level up your meal!{"\n"}{"\n"}
                            #2: Grain Gains 🌾. Swap in whole grains for a meal that fuels you right.{"\n"}{"\n"}
                            #3: Power Up with Protein 🍳. Keep your plate packed with muscle-friendly goodness!{"\n"}{"\n"}
                            #4: Try No-Fry 🚫🍟. Ditch the fryer for a meal that treats your body better.{"\n"}{"\n"}
                            #5: Fuel-Up Faceoff 👑🍴. Earn points for every healthy choice! The top scorer proves they've got the best food game.{"\n"}
                        </Text>
                        <Pressable onPress={toggleModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Got It!</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            </View>
        );
    }    
  

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.container}>
            {renderHeader()}

            <View style={styles.controls}>
                <Picker
                    selectedValue={leaderboardType}
                    style={styles.picker}
                    onValueChange={(itemValue) => setLeaderboardType(itemValue)}
                >
                    <Picker.Item label="Health Leaderboard" value="health" />
                    <Picker.Item label="Challenge 1 Leaderboard" value="1" />
                    <Picker.Item label="Challenge 2 Leaderboard" value="2" />
                    <Picker.Item label="Challenge 3 Leaderboard" value="3" />
                    <Picker.Item label="Challenge 4 Leaderboard" value="4" />
                    <Picker.Item label="Challenge 5 Leaderboard" value="5" />
                    {/* Add more challenges as needed */}
                </Picker>


    
            </View>
            <ModalTester />
            <Text style={styles.label}>Num of entries:</Text>
            <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(numEntries)}
                    onChangeText={(text) => setNumEntries(Number(text))}
                    placeholder="Number of entries"
                />

            <Leaderboard
                data={leaderboardData}
                sortBy='highScore'
                labelBy='userName'
                renderRow={renderRow}
                style={styles.leaderboard}
            />
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6a11cb',
        marginBottom: 10,
    },
    cardDescription: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    closeButton: {
        backgroundColor: '#6a11cb',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    showButton: {
        backgroundColor: '#2575fc',
        padding: 10,
        borderRadius: 8,
        alignSelf: 'center',
        marginTop: 10,
    },
    showButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
    leaderboard: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    label: {
        textAlign: 'left',
        paddingLeft: 12,
        marginTop: 10
    },
    rank: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6a11cb',
        marginRight: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    score: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2575fc',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6a11cb',
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#ff4444',
        textAlign: 'center',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    picker: {
        flex: 1,
        marginRight: 10,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        margin: 10
    },
    viewDetailsButton: {
        backgroundColor: '#2575fc',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 10,
    },
    
    viewDetailsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }    
});