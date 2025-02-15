import { BackendUrl } from '@/context/backendUrl';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator
} from 'react-native';

interface Post {
  id: number;
  userID: number;
  back_image: string;
  front_image: string;
  ingredients: string;
  calories: number;
  health_score: number;
  upvotes: number;
  username: string;
}

export default function CommunityFeedGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${BackendUrl}/feed/community/upvotes`);
      const json = await response.json();
      console.log(json.posts)
      return json.posts || [];
    } catch (error) {
      console.error('Error fetching posts', error);
      return [];
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const refreshedPosts = await fetchPosts();
    setPosts(refreshedPosts);
    setRefreshing(false);
  };

  useEffect(() => {
    async function loadInitialPosts() {
      const initialPosts = await fetchPosts();
      setPosts(initialPosts);
    }
    loadInitialPosts();
  }, []);

  const renderPostItem = ({ item }: { item: Post }) => {
    const backImageUri = `data:image/jpeg;base64,${item.back_image}`;
    const frontImageUri = `data:image/jpeg;base64,${item.front_image}`;

    return (
      <View>
        <View style={styles.hotbar}>
          <Text></Text>
          </View>
      <Pressable
        style={styles.itemContainer}
        onPress={() => {
          setSelectedPost(item);
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: backImageUri }} style={styles.backImage} resizeMode="cover" />
        <Image source={{ uri: frontImageUri }} style={styles.frontImage} resizeMode="contain" />
      </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPostItem}
        numColumns={1} // Single column layout
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color="#000" /> : null}
      />
      {selectedPost && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
          transparent={false}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Post Details</Text>
            <Image source={{ uri: `data:image/jpeg;base64,${selectedPost.back_image}` }} style={styles.modalBackImage} resizeMode="cover" />
            <Image source={{ uri: `data:image/jpeg;base64,${selectedPost.front_image}` }} style={styles.modalFrontImage} resizeMode="contain" />
            <Text>Ingredients: {selectedPost.ingredients}</Text>
            <Text>Calories: {selectedPost.calories}</Text>
            <Text>Health Score: {selectedPost.health_score}</Text>
            <Text>Upvotes: {selectedPost.upvotes}</Text>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  itemContainer: {
    width: '100%',
    marginVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  backImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
  },
  frontImage: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalBackImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  modalFrontImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    alignSelf: 'center',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  hotbar:{
    flex:1
  },
});
