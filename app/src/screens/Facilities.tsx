import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import Slider from "@react-native-community/slider";
import { getDistance } from "geolib";
import * as Location from "expo-location";
import { Header } from "@/components";
import {
  FacilitiesDataResponse,
  useFetchFacilities
} from "@/hooks/api/queries/facilities";
import { Locate, ZoomIn, ZoomOut, Phone, MapPin } from "lucide-react-native";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const INITIAL_ZOOM = 15;


const CARE_LEVEL_COLORS = {
  primary: "#2C6000", // Green
  secondary: "#1a73e8", // Blue
  tertiary: "#B42318" // Red
};


const AnimatedView = Animated.createAnimatedComponent(View);

const BOTTOM_SHEET_MIN_HEIGHT = height * 0.35; // Increased minimum height
const BOTTOM_SHEET_MAX_HEIGHT = height * 0.7;


const defaultCoordinate = {
  latitude: 37.4220936,
  latitudeDelta: 0.010986328125,
  longitude: -122.083922,
  longitudeDelta: 0.010986328125
};
const Facilities = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const mapRef = useRef<MapView>(null);
  const { data, isLoading } = useFetchFacilities();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [radius, setRadius] = useState(100);
  const [nearbyFacilities, setNearbyFacilities] = useState<
    FacilitiesDataResponse[]
  >([]);

  const heightValue = useSharedValue(BOTTOM_SHEET_MIN_HEIGHT);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startHeight = heightValue.value;
    },
    onActive: (event, ctx) => {
      const newHeight = ctx.startHeight - event.translationY;
      heightValue.value = Math.max(
        BOTTOM_SHEET_MIN_HEIGHT,
        Math.min(BOTTOM_SHEET_MAX_HEIGHT, newHeight)
      );
    },
    onEnd: (event) => {
      const velocity = -event.velocityY;
      const shouldSnap = Math.abs(velocity) > 500;
      
      let finalHeight;
      if (shouldSnap) {
        finalHeight = velocity > 0 ? BOTTOM_SHEET_MAX_HEIGHT : BOTTOM_SHEET_MIN_HEIGHT;
      } else {
        const midPoint = (BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_MIN_HEIGHT) / 2;
        finalHeight = heightValue.value > midPoint ? BOTTOM_SHEET_MAX_HEIGHT : BOTTOM_SHEET_MIN_HEIGHT;
      }
      
      heightValue.value = withSpring(finalHeight, {
        damping: 20,
        stiffness: 90,
        velocity: velocity
      });
    },
  });

  const handleFocus = () => {
    // Adjust bottom sheet height when keyboard opens
    heightValue.value = withSpring(BOTTOM_SHEET_MAX_HEIGHT * 0.5, {
      damping: 20,
      stiffness: 90
    });
    
    // Small delay to ensure the animation has started
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const bottomSheetStyle = useAnimatedStyle(() => {
    return {
      height: heightValue.value
    };
  });

  const [searchQuery, setSearchQuery] = useState("");

  const handleZoomIn = () => {
    if (mapRef.current && userLocation) {
      const region = {
        ...userLocation,
        latitudeDelta: userLocation.latitudeDelta / 2,
        longitudeDelta: userLocation.longitudeDelta / 2
      };
      mapRef.current.animateToRegion(region, 300);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && userLocation) {
      const region = {
        ...userLocation,
        latitudeDelta: userLocation.latitudeDelta * 2,
        longitudeDelta: userLocation.longitudeDelta * 2
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
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to show your location on the map.",
        [{ text: "OK" }]
      );
      return;
    }

    getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 360 / Math.pow(2, INITIAL_ZOOM),
        longitudeDelta: 360 / Math.pow(2, INITIAL_ZOOM)
      };

      setUserLocation(region);
      mapRef.current?.animateToRegion(region, 1000);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Unable to get location");
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
          distanceInterval: 10
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
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
    if (data?.data && userLocation) {
      const facilities = Array.isArray(data?.data) ? data?.data : [data?.data];
      const nearby = facilities.filter((facility) => {
        const distance = getDistance(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          },
          {
            latitude: parseFloat(facility.latitude),
            longitude: parseFloat(facility.longitude)
          }
        );
        return distance <= radius * 1000; // Convert km to meters
      });
      setNearbyFacilities(nearby);
    }
  }, [data, userLocation, radius]);

  // Add filter function
  const filteredFacilities =
    searchQuery.trim() === ""
      ? nearbyFacilities
      : nearbyFacilities?.filter((facility) => {
          if (!facility?.name || !facility?.type) return false;
          const query = searchQuery.toLowerCase().trim();
          return (
            facility.name.toLowerCase().includes(query) ||
            facility.type.toLowerCase().includes(query)
          );
        });

  const openMaps = (facility: FacilitiesDataResponse) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q="
    });
    const latLng = `${facility.latitude},${facility.longitude}`;
    const label = facility.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <View style={styles.container}>
        {Platform.OS === "ios" && (
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
            region={
              userLocation || {
                latitude: 0,
                longitude: 0,
                latitudeDelta: 360 / Math.pow(2, INITIAL_ZOOM),
                longitudeDelta: 360 / Math.pow(2, INITIAL_ZOOM)
              }
              // defaultCoordinate
            }>
            {nearbyFacilities?.map((facility) => (
              <Marker
                key={facility.id}
                coordinate={{
                  latitude: parseFloat(facility.latitude),
                  longitude: parseFloat(facility.longitude)
                }}
                title={facility.name}
                description={facility.contact}
                pinColor={CARE_LEVEL_COLORS[facility.careLevel] || "#000000"}
                onCalloutPress={() => openMaps(facility)}
              />
            ))}
          </MapView>
        )}
       

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
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <AnimatedView style={[styles.bottomSheet, bottomSheetStyle]}>
            <View style={styles.bottomSheetHandle} />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.controls}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search facilities..."
                placeholderTextColor={"#667085"}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={handleFocus}
              />
              <Text style={styles.radiusText}>Radius: {Math.round(radius)} km</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={radius}
                onSlidingComplete={(value: number) => setRadius(Math.round(value))}
                minimumTrackTintColor="#1a73e8"
                maximumTrackTintColor="#000000"
              />
            </View>
            </TouchableWithoutFeedback>

            <Text style={styles.title}>Nearby Facilities ({filteredFacilities.length})</Text>
            <ScrollView style={styles.facilitiesList} showsVerticalScrollIndicator={false}>
              <View style={styles.grid}>
                {filteredFacilities?.map((facility) => (
                  <View key={facility.id} style={styles.card}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {facility.name}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {facility.type}
                    </Text>
                    <Text style={styles.cardLocation} numberOfLines={1}>
                      {facility.location}
                    </Text>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => Linking.openURL(`tel:${facility.contact}`)}>
                      <Phone size={16} color="#0CA554" />
                      <Text style={styles.actionButtonText}>Call Facility</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.directionsButton]}
                      onPress={() => openMaps(facility)}>
                      <MapPin size={16} color="#1a73e8" />
                      <Text style={[styles.actionButtonText, styles.directionsText]}>
                        Get Directions
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.cardDistance} numberOfLines={1}>
                      {(getDistance(
                        {
                          latitude: userLocation?.latitude || 0,
                          longitude: userLocation?.longitude || 0
                        },
                        {
                          latitude: parseFloat(facility.latitude),
                          longitude: parseFloat(facility.longitude)
                        }
                      ) / 1000).toFixed(1)} km away
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </AnimatedView>
        </PanGestureHandler>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Facilities;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent"
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#F9FAFB"
  },
  headerBannerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F8FFFB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 3
  },
  headerBanner: {
    width: "100%",
    backgroundColor: "#F8FFFB"
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 100 : 60,
    zIndex: 2
  },
  mapButton: {
    width: 44,
    height: 44,
    backgroundColor: "white",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12
  },
  controls: {
    marginVertical: 8
  },
  radiusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#101828",
    marginBottom: 8
  },
  slider: {
    width: "100%",
    height: 40
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000"
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#101828"
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#667085",
    marginTop: 4
  },
  cardLocation: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4
  },
  phone: {
    fontSize: 12,
    color: "#0CA554",
    marginTop: 4
  },
  card: {
    width: CARD_WIDTH,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    minHeight: 160
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 8,
    backgroundColor: "#F0FDF4"
  },

  directionsButton: {
    backgroundColor: "#EFF6FF"
  },

  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#0CA554",
    fontWeight: "500"
  },

  directionsText: {
    color: "#1a73e8"
  },

  cardDistance: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "right"
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  facilitiesList: {
    flexGrow: 1
  }
});
