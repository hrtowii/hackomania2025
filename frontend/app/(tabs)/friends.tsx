import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  Modal,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { BackendUrl } from '@/context/backendUrl';
import { useAuth } from '@/context/authContext';

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

const FeedScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [feedType, setFeedType] = useState<'healthy' | 'friends' | 'community'>('community');
  const [sortMethod, setSortMethod] = useState<'upvotes' | 'recency' | 'health'>('upvotes');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
const {userId} = useAuth();
const fetchPosts = useCallback(async () => {
  let url = '';
  if (feedType === 'healthy') {
    url = `${BackendUrl}/feed/healthy/${sortMethod}`;
  } else if (feedType === 'friends') {
    url = `${BackendUrl}/feed/${userId}/friends/${sortMethod}`;
  } else {
    url = `${BackendUrl}/feed/community/${sortMethod}`;
  }

  try {
    const response = await fetch(url);
    const json = await response.json();
    const postsData = json.posts || [];

    // Fetch all users once, then map the posts
    const userIds = postsData.map((post:Post) => post.userId);
    const uniqueUserIds = [...new Set(userIds)];

    const usersResponse = await fetch(`${BackendUrl}/users/bulk/${uniqueUserIds.join(',')}`);
    const usersData = await usersResponse.json();
    const usersMap = usersData.reduce((acc: { [key: number]: string }, user: { id: number, username: string }) => {
      acc[user.id] = user.username;
      return acc;
    }, {});

    // Map posts with usernames
    const postsWithUsernames = postsData.map((post: Post) => ({
      ...post,
      username: usersMap[post.userId] || `User ${post.userId}`
    }));

    setPosts(postsWithUsernames);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}, [feedType, sortMethod, userId]);


  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleUpvote = async (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
    ));
    
    try {
      await fetch(`${BackendUrl}/posts/upvote/${postId}`);
    } catch (error) {
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, upvotes: post.upvotes - 1 } : post
      ));
    }
  };

  const renderListItem = ({ item }: { item: Post }) => (
    <Pressable onPress={() => { setSelectedPost(item); setModalVisible(true); }}>
      <View style={styles.listItem}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: `data:image/jpeg;base64,${item.back_image}` }} style={styles.listImage} />
          <Image source={{ uri: `data:image/jpeg;base64,${item.front_image}` }} style={styles.avatar} />
          <Pressable style={styles.upvoteButton} onPress={() => handleUpvote(item.id)}>
            <FontAwesome6 name="thumbs-up" size={16} color="white" />
            <Text style={styles.upvoteText}>{item.upvotes}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const renderGridItem = ({ item }: { item: Post }) => (
    <Pressable style={styles.gridItem} onPress={() => { setSelectedPost(item); setModalVisible(true); }}>
      <Image source={{ uri: `data:image/jpeg;base64,${item.back_image}` }} style={styles.gridImage} />
      <Image source={{ uri: `data:image/jpeg;base64,${item.front_image}` }} style={styles.gridAvatar} />
      <Pressable style={styles.gridUpvote} onPress={() => handleUpvote(item.id)}>
        <FontAwesome6 name="thumbs-up" size={14} color="white" />
        <Text style={styles.gridUpvoteText}>{item.upvotes}</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/befedblack.png')} style={styles.banner} />
        <View style={styles.pickers}>
          <Picker
            selectedValue={feedType}
            onValueChange={setFeedType}
            style={styles.picker}
            dropdownIconColor="#000">
            <Picker.Item label="Healthy" value="healthy" />
            <Picker.Item label="Friends" value="friends" />
            <Picker.Item label="Community" value="community" />
          </Picker>
          <Picker
            selectedValue={sortMethod}
            onValueChange={setSortMethod}
            style={styles.picker}
            dropdownIconColor="#000">
            <Picker.Item label="Upvotes" value="upvotes" />
            <Picker.Item label="Recency" value="recency" />
            <Picker.Item label="Health" value="health" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={posts}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={item => item.id.toString()}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
      />

      <Pressable style={styles.viewToggle} onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}>
        <Text style={styles.toggleText}>{viewMode === 'grid' ? '☀️' : '🌙'}</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          {selectedPost && (
            <>
              <Image source={{ uri: `data:image/jpeg;base64,${selectedPost.back_image}` }} style={styles.modalImage} />
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ingredients</Text>
                {selectedPost.ingredients.split(',').map((ingredient, i) => (
                  <Text key={i} style={styles.ingredient}>• {ingredient.trim()}</Text>
                ))}
                <View style={styles.stats}>
                  <Text>Calories: {selectedPost.calories}</Text>
                  <Text>Health Score: {selectedPost.health_score}</Text>
                  <Text>Upvotes: {selectedPost.upvotes}</Text>
                </View>
                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3A4',
  },
  header: {
    paddingBottom: 10,
  },
  banner: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  pickers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  listContent: {
    paddingBottom: 100,
  },
  listItem: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  gridAvatar: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'white',
  },
  upvoteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  gridUpvote: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 15,
    alignItems: 'center',
  },
  upvoteText: {
    color: 'white',
    marginLeft: 5,
  },
  gridUpvoteText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 3,
  },
  viewToggle: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  toggleText: {
    fontSize: 24,
  },
  modal: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 5,
  },
  stats: {
    marginVertical: 15,
    gap: 5,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default FeedScreen;