import React, { useState, useEffect } from 'react';
import { BackendUrl } from '@/context/backendUrl';
import { View, ActivityIndicator, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/authContext';
import { useLocalSearchParams } from 'expo-router';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the user data structure
interface UserData {
  id: number;
  username: string;
  health_score: number;
  challenge_progress: string; // Adjust type based on API response
}

function Profile() {
  let { targetUserId } = useLocalSearchParams();
  if (!targetUserId) {
    targetUserId = "2";
  }

  const { userId } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [friendStatus, setFriendStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BackendUrl}/Users`);
      const data: UserData[] = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch profile details of target user
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BackendUrl}/users/${targetUserId}`);
      const data: UserData = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add Friend Function
  const addFriend = async () => {
    try {
      const response = await fetch(`${BackendUrl}/users/${userId}/friends/add/${targetUserId}/`);
      const data = await response.json();
      if (data.successful) {
        setFriendStatus("Successfully added friend");
      } else {
        setFriendStatus(data.error || 'Error adding friend');
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      setFriendStatus("Failed to add friend");
    }
  };

  // Handle Search Function
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filtered = users.filter(user => user.username.toLowerCase().includes(text.toLowerCase()));
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserProfile();
  }, []);

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
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search Users..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.email}>{item.health_score}</Text>
          </Card>
        )}
      />

      {/* Profile Section */}
      <Text style={styles.title}>{userData.username}</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.detailText}>Health Score: {userData.health_score}</Text>
        <Text style={styles.detailText}>Challenge Progress: {userData.challenge_progress}</Text>
      </View>

      {/* Add Friend Button */}
      {Number(userId) !== userData.id && (
      <TouchableOpacity style={styles.button} onPress={addFriend}>
        <Text style={styles.buttonText}>Add Friend</Text>
      </TouchableOpacity>
)}


      {/* Friend Status Message */}
      {friendStatus ? <Text style={styles.statusMessage}>{friendStatus}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 50,
  },
  searchBar: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  card: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
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
    alignItems: 'center',
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
    textAlign: 'center',
  },
});

export default Profile;
