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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: 0,
    letterSpacing: 1,
    fontFamily: 'Arial',
  },
  smallimage: {
    height: '100%',
    width: '100%',
    borderRadius: 25,
    objectFit: 'contain',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 25,
    height: vh(50),
    width: vw(90),
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 20,
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 50,
    shadowRadius: 10,
  },
  reactLogo: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  hotbar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
  },
});
