import { BackendUrl } from '@/context/backendUrl';
import React, { useState, useEffect, useCallback } from 'react';
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

const POSTS_PER_PAGE = 10; // adjust as needed 

interface Post {
  id: number;
  back_image: string;
  front_image: string;
  ingredients: string;
  calories: number;
  health_score: number;
  upvotes: number;
}

export default function CommunityFeedGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post|null>(null);
  const [modalVisible, setModalVisible] = useState(false); 

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${BackendUrl}/feed/community/upvotes`);
      const json = await response.json();
      return json.posts || [];
    } catch (error) {
      console.error('Error fetching posts', error);
      return [];
    }
  }; 

  useEffect(() => {
    async function loadInitialPosts() {
      const initialPosts = await fetchPosts(1);
      setPosts(initialPosts);
    }
    loadInitialPosts();
  }, []); 

  // Render each grid post
  const renderPostItem = ({ item }: { item: Post }) => {
    // When using base64, you need the URI format like: 'data:image/jpeg;base64,' + item.back_image 
    // Adjust the media type (jpeg/png) according to your data
    const backImageUri = `data:image/jpeg;base64,${item.back_image}`;
    const frontImageUri = `data:image/jpeg;base64,${item.front_image}`;
    return (
      <Pressable
        style={styles.itemContainer}
        onPress={() => {
          setSelectedPost(item);
          setModalVisible(true);
        }}
      >
        {/* {/* Back image as the background /} */}
        <Image
          source={{ uri: backImageUri }}
          style={styles.backImage}
          resizeMode="cover"
        />
        {/* {/  Front image displayed at top right */} */}
        <Image
          source={{ uri: frontImageUri }}
          style={styles.frontImage}
          resizeMode="contain"
        />
      </Pressable>
    );
  }; 

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPostItem}
        numColumns={2} // Adjust number of columns as needed
        // onEndReached={loadMorePosts}
        // onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color="#000" /> : null}
      /> 
  {/* Modal to show detailed post info */}
  {selectedPost && (
    <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
      transparent={false}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Post Details</Text>
        <Image
          source={{ uri: `data:image/jpeg;base64,${selectedPost.back_image}` }}
          style={styles.modalBackImage}
          resizeMode="cover"
        />
        <Image
          source={{ uri: `data:image/jpeg;base64,${selectedPost.front_image}` }}
          style={styles.modalFrontImage}
          resizeMode="contain"
        />
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
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1, // makes the grid items square
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  backImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  frontImage: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
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
}); 