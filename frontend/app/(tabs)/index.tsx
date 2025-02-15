import { Image, StyleSheet, Platform, VirtualizedList, StatusBar, Text, View, Pressable} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import {BackendUrl} from '@/context/backendUrl';

type ItemData = {
  id: string;
  title: string;
};

const getItem = (_data: unknown, index: number): ItemData => ({
  id: Math.random().toString(12).substring(0),
  title: `Item ${index + 1}`,
});

const getItemCount = (_data: unknown) => 50;

type ItemProps = {
  title: string;
};

const getImage = async () => {
  try {
    const response = await fetch(`${BackendUrl}/posts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    const data = await response.json();
};

const Item = ({title}: ItemProps) => (
  <View style={styles.item}>
    <View style={styles.hotbar}>
      <Image source={require('@/assets/images/\BeFed.png')}style={styles.reactLogo}></Image>
      <Text style={styles.title}>{title}</Text>
    </View>

    <Image source={require('@/assets/images/\BeFed.png')}
    style={styles.smallimage}
    >
    </Image>
  </View>
);

export default function HomeScreen() {
  return (
      <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
      <VirtualizedList
        initialNumToRender={4}
        renderItem={({item}) => <Item title={item.title} />}
        getItemCount={getItemCount}
        getItem={getItem}
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
    fontSize: 24,  // Font size for the title
    fontWeight: 'bold',  // Makes the title bold
    color: '#333',  // Text color (dark grey)
    textAlign: 'left',  // Aligns the text to the left
    marginBottom: 0,  // Space below the title
    letterSpacing: 1,  // Adds space between letters for a stylized effect
    fontFamily: 'Arial',  // Optional: you can customize the font family
  },  
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  smallimage: {
    height: '100%',
    width: '100%',
    borderRadius: 25,
    objectFit: 'contain',
  },
  container:{
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
    // bottom: 0,
    // left: 0,
    // position: 'absolute',
  },
  hotbar:{
    width: '100%',
    // height: '20%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '12px'
  }
});
