import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, ScrollView, Image, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BackendUrl } from '@/context/backendUrl'; 
import { FontAwesome6 } from '@expo/vector-icons';

interface Post {
  id: number;
  userID: number;
  back_image: string;
  front_image: string;
  ingredients: string;
  calories: number;
  health_score: number;
  upvotes: number;
} 



export default function CombinedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<'home' | 'grid'>('home');
  const [refreshing, setRefreshing] = useState(false);
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${BackendUrl}/feed/community/upvotes`);
      const json = await response.json();
      setPosts(json.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }; 

  // Refresh when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  ); 

  const handleRefresh = async () => {
    setRefreshing(true);
    const refreshedPosts = await fetchPosts();
    setPosts(refreshedPosts);
    setRefreshing(false);
  };

  // Render a grid item for grid view.
  const renderGridItem = ({ item }: { item: Post }) => {
    const backImageUri = `data:image/jpeg;base64,${item.back_image}`;
    const frontImageUri = `data:image/jpeg;base64,${item.front_image}`;
    return (
      <Pressable style={styles.gridItem} onPress={() => { /* handle detailed view if required */ }}>
        <Image source={{ uri: backImageUri }} style={styles.backImage} resizeMode="cover" />
        <Image source={{ uri: frontImageUri }} style={styles.frontImage} resizeMode="contain" />
      </Pressable>
    );
  }; 

  const renderHomeView = () => (
    <FlatList
      numColumns={1}
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item: post }) => (
        <View style={styles.homeItem}>
          <Text style={styles.titleText}>Post #{post.id}</Text>
          <Image
            source={{ uri: `data:image/jpeg;base64,${post.back_image}` }}
            style={styles.homeImage}
            resizeMode="cover"
          />
          <Text>Calories: {post.calories}</Text>
          <Text>Upvotes: {post.upvotes}</Text>
        </View>
      )}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  ); 

  return (
    <View style={{ flex: 1 }}>
      {viewMode === 'grid' ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGridItem}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.gridContainer}
        />
      ) : (
        renderHomeView()
      )}
      {/* Floating swap button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => setViewMode(viewMode === 'home' ? 'grid' : 'home')}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>{viewMode === 'home' ? '🔳' : '🔲'}</Text>
      </Pressable>
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
  backImage: {
    width: '100%',
    height: '100%',
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
  homeItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  // Floating button styles
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
    zIndex: 999, // Ensure the button is on top
  },
});