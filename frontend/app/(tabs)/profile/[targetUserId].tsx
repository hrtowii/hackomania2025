import React, { useState, useEffect } from 'react'
import { BackendUrl } from '@/context/backendUrl';
import { View, ActivityIndicator, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/authContext';
import { useLocalSearchParams } from 'expo-router';
function profile() {
    const {targetUserId} = useLocalSearchParams();
    console.log(targetUserId)
    const {userId} = useAuth();
    const [userData, setUserData] = useState<any>({})
    const [friendStatus, setFriendStatus] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        try {
            fetch(`${BackendUrl}/users/${targetUserId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setUserData(data)
                setLoading(false)
            })
        } catch (e) {
            console.log(`error: ${e}`)
        }
    }, [])

    const addFriend = (targetUserId: number) => {
        try {
            fetch(`${BackendUrl}/users/${userId}/friends/add/${targetUserId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.successful) {
                    setFriendStatus("successfully added friend")
                } else {
                    setFriendStatus(data.error || 'Error adding friend');
                }
            })
        } catch (e) {
            console.log(`error: ${e}`)
        }
    }
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
        <Text style={styles.detailText}>
          Health Score: {userData.health_score}
        </Text>
        <Text style={styles.detailText}>
          Challenge Progress: {userData.challenge_progress}
        </Text>
      </View>
    
      {userId !== userData.id && (
        <TouchableOpacity style={styles.button} onPress={() => addFriend(1)}>
          <Text style={styles.buttonText}>Add Friend</Text>
        </TouchableOpacity>
      )}
    
      {friendStatus ? (
        <Text style={styles.statusMessage}>{friendStatus}</Text>
      ) : null}
    </View>
    
      );
    }; 
    
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
      },
      button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
      },
      buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
      },
      statusMessage: {
        marginTop: 15,
        fontSize: 16,
        color: '#007BFF',
      }
    }); 

export default profile
