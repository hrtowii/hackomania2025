import { BackendUrl } from '@/context/backendUrl';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Image } from 'react-native';
import Leaderboard from 'react-native-leaderboard';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LeaderboardComponent() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BackendUrl}/leaderboard/health/10`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json();

                const transformedData = result.users.map((user, index) => ({
                    rank: index + 1, // Add rank
                    userName: user.username,
                    highScore: user.health_score_avg,
                    avatar: `https://i.pravatar.cc/150?u=${user.username}`, // Example avatar URL
                }));

                setLeaderboardData(transformedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.container}>
            {renderHeader()}
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
        fontSize: 32, // Larger font size
        fontWeight: 'bold',
        color: '#000', // Black color for the text
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
        fontSize: 18, // Larger font size
        fontWeight: '600',
        color: '#000', // Black color for the text
    },
    score: {
        fontSize: 18, // Larger font size
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
});