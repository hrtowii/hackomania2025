import React, { useState, useEffect } from "react";
import { FlatList, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackendUrl } from '@/context/backendUrl';
import { useFocusEffect } from "expo-router";

type User = {
  id: number;
  username: string;
};

const userId = 1; // Replace this with the actual logged-in user ID

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addedFriends, setAddedFriends] = useState<Set<number>>(new Set());

  useFocusEffect(() => {
    fetchUsers();
  },);

  const fetchUsers = async () => {
      const response = await fetch(`${BackendUrl}/users`);
      const data: { users: User[] } = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const addFriend = async (targetUserId: number) => {
    // Remove the button immediately
    setAddedFriends(prev => new Set(prev).add(targetUserId));

    try {
      const response = await fetch(`${BackendUrl}/users/${userId}/friends/add/${targetUserId}/`);
      const data = await response.json();
      // Handle successful addition or any error if needed
      if (!data.successful) {
        // You can show an error message or handle failure case here if required
        console.error("Failed to add friend");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator animating={true} style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search users..."
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item: User) => item.id.toString()}
        renderItem={({ item }: { item: User }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text>{item.username}</Text>
              {/* Remove button immediately upon click */}
              {!addedFriends.has(item.id) && (
                <TouchableOpacity 
                  style={styles.addButton} 
                  onPress={() => addFriend(item.id)}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#fff',
  },
  card: { marginBottom: 8, padding: 10, backgroundColor: '#fff2b2' },
  loader: { flex: 1, justifyContent: "center" },
  addButton: {
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default UsersList;
