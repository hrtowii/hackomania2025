import React, { useState, useCallback, useEffect } from 'react';
import { View, Button, FlatList, RefreshControl, ScrollView, Image, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BackendUrl } from '@/context/backendUrl'; 

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

  // Refresh when the screen is focused (revisiting the page)
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  ); 

  // Pull-to-refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts().finally(() => setRefreshing(false));
  }, []); 

  // Render a grid item for grid view; adjust styles as needed.
  const renderGridItem = ({ item }: { item: Post }) => {
    // When using base64 images, prepend the proper prefix.
    const backImageUri = `data:image/jpeg;base64,${item.back_image}`;
    const frontImageUri = `data:image/jpeg;base64,${item.front_image}`;
    return (
      <Pressable style={styles.gridItem} onPress={() => { /* handle detailed view if required */ }}>
              <Button
        title={`Switch to ${viewMode === 'home' ? 'Grid' : 'Home'} View`}
        onPress={() => setViewMode(viewMode === 'home' ? 'grid' : 'home')}
      />
        <Image source={{ uri: backImageUri }} style={styles.backImage} resizeMode="cover" />
        <Image source={{ uri: frontImageUri }} style={styles.frontImage} resizeMode="contain" />
      </Pressable>
      </View>
    );
  }; 

  // Render the home view however you need; here’s an illustrative example.
  const renderHomeView = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {posts.map((post) => (
        <View key={post.id} style={styles.homeItem}>
          <Text style={styles.titleText}>Post #{post.id}</Text>
          {/* Use one of the images as representation */}
          <Button
        title={`Switch to ${viewMode === 'home' ? 'Grid' : 'Home'} View`}
        onPress={() => setViewMode(viewMode === 'home' ? 'grid' : 'home')}
      />
          <Image
            source={{ uri: `data:image/jpeg;base64,${post.back_image}` }}
            style={styles.homeImage}
            resizeMode="cover"
          />
          <Text>Calories: {post.calories}</Text>
          <Text>Upvotes: {post.upvotes}</Text>
        </View>
      ))}
    </ScrollView>
  ); 

  return (
    <View style={{ flex: 1 }}>
      {viewMode === 'grid' ? (
        <>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGridItem}
          numColumns={2}      // or 1 if you want a single column grid
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.gridContainer}
        />
        </>
      ) : (
        renderHomeView()
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
}); 
