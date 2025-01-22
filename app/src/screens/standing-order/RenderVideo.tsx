import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Video from 'react-native-video'; // Import react-native-video for video playback
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface RenderVideoProps {
  video: {
    type: 'video';
    src: string;
    title: string;
    fileName: string;
    description?: string;
    openExternal?: boolean;
    translate?: boolean;
    youtube?: boolean;
  };
}

const RenderVideo: React.FC<RenderVideoProps> = ({ video }) => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('@auth_token');
        const response = await axios.get(video.src, {
          responseType: 'arraybuffer', // Fetch binary data
          headers: {
            Authorization: `Bearer ${accessToken}`, // Pass token if required
          },
        });

        const contentType = response.headers['content-type'] || 'video/mp4'; // Fallback to MP4
        const base64 = `data:${contentType};base64,${Buffer.from(
          response.data,
          'binary'
        ).toString('base64')}`;

        setVideoUri(base64);
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [video.src]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#000" />
        <Text>Loading video...</Text>
      </View>
    );
  }

  if (!videoUri) {
    return (
      <View style={styles.errorContainer}>
        <Text>Failed to load video</Text>
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      {video.title && <Text style={styles.title}>{video.title}</Text>}
      <Video
        source={{ uri: videoUri }}
        style={styles.video}
        resizeMode="contain"
        controls={true} // Enable video player controls
      />
      {video.description && <Text style={styles.description}>{video.description}</Text>}
      {video.openExternal && (
        <TouchableOpacity
          style={styles.externalButton}
          onPress={() => {
            // Handle opening the video in an external app if required
          }}
        >
          <Text style={styles.externalButtonText}>Open Externally</Text>
        </TouchableOpacity>
      )}
    </View>
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
  videoContainer: {
    width: '100%',
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000', // Black background for better contrast
  },
  externalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  externalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RenderVideo;
