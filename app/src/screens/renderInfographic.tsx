import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

const renderInfographic = (url: string, index: number) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
        try {
          const response = await axios.get(url, {
            responseType: 'arraybuffer',
          });

          // Get the content type from the response headers
          const contentType = response.headers['content-type'];

          if (!contentType) {
            throw new Error('Content type not found in response headers');
          }

          // Convert the binary data to Base64 and use the content type dynamically
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
      <View key={index} style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#000" />
        <Text>Loading infographic...</Text>
      </View>
    );
  }

  if (!imageData) {
    return (
      <View key={index} style={styles.errorContainer}>
        <Text>Failed to load infographic</Text>
      </View>
    );
  }

  return (
    <Image
      key={index}
      source={{ uri: imageData }}
      style={{ width: '100%', height: 200 }}
      resizeMode="contain"
    />
  );
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
  });

  export default renderInfographic;
