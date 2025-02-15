import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, RefreshControl, ScrollView, Image, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BackendUrl } from '@/context/backendUrl';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/context/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Post {
  id: number;
  userId: number;
  back_image: string;
  front_image: string;
  ingredients: string;
  calories: number;
  health_score: number;
  upvotes: number;
  username?: string;
} 

export default function CombinedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<'home' | 'grid'>('home');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userIds, setUserIds] = useState(null)
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${BackendUrl}/feed/community/upvotes`);
      const json = await response.json();
      setPosts(json.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Use useEffect to periodically refresh the posts (every 30 seconds).
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  ); 

  useEffect(() => {
    const fetchUsernames = async () => {
      if (posts.length === 0) return;
  
      try {
        const updatedPosts = await Promise.all(
          posts.map(async (post) => {
            try {
              const response = await fetch(`${BackendUrl}/users/${post.userId}/`);
              const userData = await response.json();
              return { ...post, username: userData.username };
            } catch (error) {
              console.error(`Error fetching username for userId ${post.userId}:`, error);
              return post; // Return post unchanged if fetch fails
            }
          })
        );
  
        setPosts(updatedPosts);
      } catch (e) {
        console.error("Error in fetching usernames:", e);
      }
    };
  
    fetchUsernames();
  }, [posts]); // Runs whenever `posts` updates
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  // Function to trigger the upvote API call.
  const handleUpvote = async (postId: number) => {
    // Optimistically update UI by incrementing the upvote counter
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
      )
    );
  
    try {
      const response = await fetch(`${BackendUrl}/posts/upvote/${postId}`);
      if (!response.ok) {
        // Roll back optimistic update if the API call fails
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId ? { ...post, upvotes: post.upvotes - 1 } : post
          )
        );
        console.error('Failed to upvote post with id', postId);
      }
      // Optionally, you can update only the affected post’s upvote count based on the response if needed.
    } catch (error) {
      // Roll back the update if an error occurs during the fetch call
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, upvotes: post.upvotes - 1 } : post
        )
      );
      console.error('Error during upvote for post', postId, error);
    }
  };

  // Render the list (home) view.
  const renderHomeView = () => (
    <SafeAreaView>
    <FlatList
      key={viewMode}
      numColumns={1}
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={(
        <View style={styles.header}>
          <Image source={require('@/assets/images/BeFed.png')} style={styles.banner} />
        </View>
      )}
      renderItem={({ item: post }) => (
        <Pressable onPress={() => openModal(post)}>
            <View style={styles.homeItem}>
              <Text style={styles.titleText}>{post.username ? post.username : `User ${post.userId}`}</Text>
              <Image
                source={{ uri: `data:image/jpeg;base64,${post.back_image}` }}
                style={styles.homeImage}
                resizeMode="cover"
              />
            <View style={styles.row}>
              <Pressable onPress={() => handleUpvote(post.id)} style={styles.upvoteButton}>
                <FontAwesome6 name="thumbs-up" size={20} color="#007AFF" />
              </Pressable>
              <Text>{post.upvotes}</Text>
            </View>
            </View>
          </Pressable>
      )}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    /></SafeAreaView>
  );

  const openModal = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      {viewMode === 'grid' ? (
        <FlatList
          key={viewMode}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: post }) => {
            const backImageUri = `data:image/jpeg;base64,${post.back_image}`;
            const frontImageUri = `data:image/jpeg;base64,${post.front_image}`;
            return (
              <Pressable style={styles.gridItem} onPress={() => openModal(post)}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: backImageUri }} style={styles.backImage} resizeMode="cover" />
                  <Image source={{ uri: frontImageUri }} style={styles.frontImage} resizeMode="contain" />
                  <Pressable style={styles.gridUpvoteButton} onPress={() => handleUpvote(post.id)}>
                    <FontAwesome6 name="thumbs-up" size={18} color="#fff" />
                    <Text style={styles.gridUpvoteText}>{post.upvotes}</Text>
                  </Pressable>
                </View>
                <Text style={styles.itemText}>Post #{post.id}</Text>
              </Pressable>
            );
          }}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.gridContainer}
        />
      ) : (
        renderHomeView()
      )}
      <Pressable
        style={styles.floatingButton}
        onPress={() => setViewMode(viewMode === 'home' ? 'grid' : 'home')}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>{viewMode === 'home' ? '❤️' : '🌻'}</Text>
      </Pressable>
      {selectedPost && (
        <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
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
            <View style={styles.detailsContainer}>
              <Text style={styles.detailTitle}>Ingredients:</Text>
              {selectedPost.ingredients
                .replace(/[\[\]"]/g, '')
                .split(',')
                .map((ingredient, index) => (
                  <Text key={index} style={styles.ingredientText}>
                    • {ingredient.trim()}
                  </Text>
                ))}
              <Text style={styles.detailText}>Calories: {selectedPost.calories}</Text>
              <Text style={styles.detailText}>Health Score: {selectedPost.health_score}</Text>
              <Text style={styles.detailText}>Upvotes: {selectedPost.upvotes}</Text>
            </View>
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
  gridContainer: {
    padding: 5,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  homeItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  upvoteButton: {
    marginLeft: 10,
    padding: 5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeImage: {
    width: '100%',
    aspectRatio: '4 / 3',
    borderRadius: 10,
    marginVertical: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,
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
  detailsContainer: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 18,
    marginBottom: 5,
  },
  ingredientText: {
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 10,
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  itemText: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    color: '#000',
    fontSize: 16,
  },
  gridUpvoteButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridUpvoteText: {
    color: '#fff',
    marginLeft: 3,
    fontSize: 14,
  },
  header: {
    width: '100%',
    height: 150,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',

  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});