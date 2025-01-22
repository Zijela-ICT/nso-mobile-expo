import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { getDistance } from 'geolib';
import * as Location from 'expo-location';
import { Header } from '@/components';
import { FacilitiesDataResponse, useFetchFacilities } from '@/hooks/api/queries/facilities';
import { Locate, ZoomIn, ZoomOut } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const INITIAL_ZOOM = 15;

const Facilities = () => {
  const mapRef = useRef<MapView>(null);
  const { data, isLoading } = useFetchFacilities();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [radius, setRadius] = useState(20);
  const [nearbyFacilities, setNearbyFacilities] = useState<FacilitiesDataResponse[]>([]);

  const handleZoomIn = () => {
    if (mapRef.current && userLocation) {
      const region = {
        ...userLocation,
        latitudeDelta: userLocation.latitudeDelta / 2,
        longitudeDelta: userLocation.longitudeDelta / 2,
      };
      mapRef.current.animateToRegion(region, 300);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && userLocation) {
      const region = {
        ...userLocation,
        latitudeDelta: userLocation.latitudeDelta * 2,
        longitudeDelta: userLocation.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(region, 300);
    }
  };

  const centerOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion(userLocation, 1000);
    } else {
      getCurrentLocation();
    }
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to show your location on the map.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 360 / Math.pow(2, INITIAL_ZOOM),
        longitudeDelta: 360 / Math.pow(2, INITIAL_ZOOM),
      };
      
      setUserLocation(region);
      mapRef.current?.animateToRegion(region, 1000);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get location');
    }
  };

  useEffect(() => {
    requestLocationPermission();

    // Start location updates
    let locationSubscription: Location.LocationSubscription;

    const startLocationUpdates = async () => {
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      );
    };

    startLocationUpdates();

    // Cleanup
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (data?.data?.data && userLocation) {
      const facilities = Array.isArray(data?.data?.data) ? data?.data?.data : [data?.data?.data];
      const nearby = facilities.filter((facility) => {
        const distance = getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          {
            latitude: parseFloat(facility.latitude),
            longitude: parseFloat(facility.longitude),
          }
        );
        return distance <= radius * 1000; // Convert km to meters
      });
      setNearbyFacilities(nearby);
    }
  }, [data, userLocation, radius]);

  const openMaps = (facility: FacilitiesDataResponse) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${facility.latitude},${facility.longitude}`;
    const label = facility.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        toolbarEnabled={false}
        loadingEnabled={true}
        region={userLocation || {
          latitude: 0,
          longitude: 0,
          latitudeDelta: 360 / Math.pow(2, INITIAL_ZOOM),
          longitudeDelta: 360 / Math.pow(2, INITIAL_ZOOM),
        }}
      >
        {nearbyFacilities.map((facility) => (
          <Marker
            key={facility.id}
            coordinate={{
              latitude: parseFloat(facility.latitude),
              longitude: parseFloat(facility.longitude),
            }}
            title={facility.name}
            description={facility.type}
            onCalloutPress={() => openMaps(facility)}
          />
        ))}
      </MapView>

      {/* Header Section */}
      <View style={styles.headerBannerContainer}>
        <SafeAreaView style={styles.headerBanner}>
          <Header />
        </SafeAreaView>
      </View>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapButton} onPress={handleZoomIn}>
          <ZoomIn size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton} onPress={handleZoomOut}>
          <ZoomOut size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton} onPress={centerOnUser}>
          <Locate size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />

        <View style={styles.controls}>
          <Text style={styles.radiusText}>Radius: {radius} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#1a73e8"
            maximumTrackTintColor="#000000"
          />
        </View>

        <ScrollView style={styles.facilitiesList} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Nearby Facilities ({nearbyFacilities.length})</Text>
          <View style={styles.grid}>
            {nearbyFacilities.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                style={styles.card}
                onPress={() => openMaps(facility)}
              >
                <Text style={styles.cardTitle} numberOfLines={1}>{facility.name}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{facility.type}</Text>
                <Text style={styles.cardLocation} numberOfLines={1}>{facility.location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Facilities;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  headerBannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FFFB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 3,
  },
  headerBanner: {
    width: '100%',
    backgroundColor: '#F8FFFB',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 100 : 60,
    zIndex: 2,
  },
  mapButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: height * 0.6,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  controls: {
    marginVertical: 16,
  },
  radiusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#101828',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  facilitiesList: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 100,
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#101828',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#667085',
    marginTop: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});