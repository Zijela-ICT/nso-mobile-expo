import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer'; // Import the Buffer polyfill

interface RenderInfographicProps {
  url: string;
  index: number;
}

const RenderInfographic: React.FC<RenderInfographicProps> = ({ url }) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('@auth_token');
        const response = await axios.get(url, {
          responseType: 'arraybuffer', // Fetch binary data
          headers: {
            Authorization: `Bearer ${accessToken}`, // Pass token if required
          },
        });

        // Fallback to "image/png" if Content-Type is missing
        const contentType = response.headers['content-type'] || 'image/png';

        // Convert binary data to Base64 using Buffer
        const base64 = `data:${contentType};base64,${Buffer.from(
          response.data,
          'binary'
        ).toString('base64')}`;

        setImageData(base64);
      } catch (error) {
        console.error('Error fetching infographic image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [url]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#000" />
        <Text>Loading infographic...</Text>
      </View>
    );
  }

  if (!imageData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Failed to load infographic</Text>
      </View>
    );
  }

  return <Image source={{ uri: imageData }} style={styles.image} resizeMode="contain" />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 200,
  },
});

export default RenderInfographic;
