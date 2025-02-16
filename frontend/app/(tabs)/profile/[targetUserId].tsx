import React, { useState, useEffect } from 'react';
import { BackendUrl } from '@/context/backendUrl';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/authContext'; 

function Profile() {
  const { userId } = useAuth();
  const [userData, setUserData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true); 

  useEffect(() => {
    // Check if the user is authenticated (userId exists) before fetching data.
    if (userId) {
      fetch(`${BackendUrl}/users/${userId}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setUserData(data);
          setLoading(false);
        })
        .catch(e => {
          console.error(`Error fetching user data: ${e}`);
          setLoading(false);
        });
    }
  }, [userId]); 

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  } 

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Error loading user details.</Text>
      </View>
    );
  } 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{userData.username}</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.detailText}>Health Score: {userData.health_score}/10</Text>
        <Text style={styles.detailText}>Challenge Progress: {userData.challenge_progress}</Text>
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeItem}>
            • Veggie Victory 🥦: Sneak some greens into your plate and level up your meal!
          </Text>
          <Text style={styles.challengeItem}>
            • Grain Gains 🌾: Swap in whole grains for a meal that fuels you right.
          </Text>
          <Text style={styles.challengeItem}>
            • Power Up with Protein 🍳: Keep your plate packed with muscle-friendly goodness!
          </Text>
          <Text style={styles.challengeItem}>
            • Try No-Fry 🚫🍟: Ditch the fryer for a meal that treats your body better.
          </Text>
          <Text style={styles.challengeItem}>
            • Fuel-Up Faceoff 👑🍴: Earn points for every healthy choice! The top scorer proves they've got the best food game.
          </Text>
        </View>
      </View>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  detailText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  }
}); 
export default Profile; 