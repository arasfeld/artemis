import * as Location from 'expo-location';

export interface LocationResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  country?: string;
  zipCode?: string;
}

export async function requestLocationPermission(): Promise<boolean> {
  try {
    // Check if location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      console.error('Location services are disabled');
      return false;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

export async function getCurrentLocation(): Promise<LocationResult | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    // Try to get last known position first for faster response
    let location = await Location.getLastKnownPositionAsync({
      maxAge: 60000, // 1 minute
      requiredAccuracy: 100, // 100 meters
    });

    // If no recent accurate location, get current position
    if (!location) {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });
    }

    const { latitude, longitude } = location.coords;

    // Get reverse geocoded address
    const geocodeResults = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const firstResult = geocodeResults[0];

    return {
      coordinates: {
        lat: latitude,
        lng: longitude,
      },
      country: firstResult?.country || firstResult?.isoCountryCode || undefined,
      zipCode: firstResult?.postalCode || undefined,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}
