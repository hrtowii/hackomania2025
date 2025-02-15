import { BackendUrl } from '@/context/backendUrl';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Leaderboard from 'react-native-leaderboard';

const LData = [
    { userName: 'Joe', highScore: 52 },
    { userName: 'Jenny', highScore: 120 },
];

export default function LeaderboardComponent() {
    return (
        <View style={styles.container}>
            <Leaderboard
                data={fetchPosts}
                sortBy='highScore'
                labelBy='userName'
            />
        </View>
    );
}

const fetchPosts = async () => {
    try {
        const response = await fetch(`${BackendUrl}/feed`);
        const json = await response.json();
        return json.posts || [];
    } catch (error) {
        console.error('Error fetching posts', error);
        return [];
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});