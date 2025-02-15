import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { vw, vh } from 'react-native-expo-viewport-units'; // For viewport-based sizes
import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-gesture-handler';

type ItemData = {
  id: string;
  title: string;
};

const getItem = (_data: unknown, index: number): ItemData => ({
  id: `item-${index}`,  // Use a more stable ID (item-${index} for example)
  title: `Item ${index + 1}`,
});

const getItemCount = (_data: unknown) => 50;

type ItemProps = {
  title: string;
};

// const getImage = async () => {
//   try {
//     const response = await fetch(`${BackendUrl}/posts`, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email: email.value, password: password.value }),
//     });
//     const data = await response.json();
//   } catch {

//   }
// };

const Item = ({title}: ItemProps) => (
  <View style={styles.item}>
    <View style={styles.hotbar}>
      <FastImage source={require('@/assets/images/\BeFed.png')} style={styles.reactLogo} />
      <Text style={styles.title}>{title}</Text>
    </View>

    <FastImage source={require('@/assets/images/\BeFed.png')} style={styles.smallimage} />
  </View>
);

export default function HomeScreen() {
  const data = new Array(50).fill(null).map((_, index) => getItem(null, index)); // Generate mock data for FlatList

  return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        renderItem={({item}) => <Item title={item.title} />}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  </SafeAreaProvider>
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
    height: 200,
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
});
