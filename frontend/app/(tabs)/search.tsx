import React, { useState, useEffect } from "react";
import { View, FlatList, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackendUrl } from '@/context/backendUrl';

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
  const [friendStatus, setFriendStatus] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BackendUrl}/users`);
      const data: { users: User[] } = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const addFriend = async (targetUserId: number) => {
    try {
      const response = await fetch(`${BackendUrl}/users/${userId}/friends/add/${targetUserId}/`);
      const data = await response.json();
      
      if (data.successful) {
        setFriendStatus((prev) => ({ ...prev, [targetUserId]: "Friend Added ✅" }));
      } else {
        setFriendStatus((prev) => ({ ...prev, [targetUserId]: data.error || "Error adding friend" }));
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      setFriendStatus((prev) => ({ ...prev, [targetUserId]: "Request failed ❌" }));
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
              {/* Smaller Add button */}
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => addFriend(item.id)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              {friendStatus[item.id] && <Text style={styles.status}>{friendStatus[item.id]}</Text>}
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  card: { marginBottom: 8, padding: 10 },
  loader: { flex: 1, justifyContent: "center" },
  status: { color: "green", marginTop: 5 },
  addButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default UsersList;
