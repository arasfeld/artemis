import * as Location from 'expo-location';
import { getCurrentLocation } from '../location';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: {
    Balanced: 'Balanced',
  },
}));

describe('Location Utils', () => {
  it('should return location data with coordinates and address', async () => {
    const mockLocation = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    const mockGeocode = [
      {
        country: 'United States',
        isoCountryCode: 'US',
        postalCode: '94102',
        city: 'San Francisco',
        district: null,
        street: null,
        streetNumber: null,
        name: null,
        region: 'California',
        subregion: null,
        timezone: null,
        formattedAddress: 'San Francisco, CA 94102, USA',
      },
    ];

    const mockedLocation = jest.mocked(Location);
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
      expires: 'never',
      granted: true,
      canAskAgain: true,
    });
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(mockLocation);
    mockedLocation.reverseGeocodeAsync.mockResolvedValue(mockGeocode);

    const result = await getCurrentLocation();

    expect(result).toEqual({
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
      country: 'United States',
      zipCode: '94102',
    });
  });

  it('should return null when permission is denied', async () => {
    const mockedLocation = jest.mocked(Location);
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      expires: 'never',
      granted: false,
      canAskAgain: true,
    });

    const result = await getCurrentLocation();

    expect(result).toBeNull();
  });
});
