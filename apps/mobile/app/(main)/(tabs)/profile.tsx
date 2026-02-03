import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@artemis/ui';
import {
  calculateAge,
  ProfileEditSection,
  ProfileView,
} from '@/components/profile/ProfileView';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useGetProfileQuery } from '@/store/api/apiSlice';

export default function ProfileScreen() {
  const router = useRouter();
  const { isLoading: isAuthLoading, signOut } = useAppAuth();
  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();

  const handleEditSection = useCallback(
    (section: ProfileEditSection) => {
      router.push(`/profile-edit/${section}`);
    },
    [router]
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const isLoading = isAuthLoading || isProfileLoading;

  if (isLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const age = profile.dateOfBirth
    ? calculateAge(profile.dateOfBirth)
    : undefined;

  // Build location display string from flat API fields
  let locationDisplay: string | undefined;
  if (profile.locationZipCode || profile.locationCountry) {
    const parts: string[] = [];
    if (profile.locationZipCode) parts.push(profile.locationZipCode);
    if (profile.locationCountry) parts.push(profile.locationCountry);
    locationDisplay = parts.length > 0 ? parts.join(', ') : undefined;
  }

  return (
    <ProfileView
      age={age}
      ageRangeMax={profile.ageRangeMax}
      ageRangeMin={profile.ageRangeMin}
      firstName={profile.firstName}
      genders={profile.genders}
      location={locationDisplay}
      onEditSection={handleEditSection}
      onSignOut={handleSignOut}
      photos={profile.photos}
      relationshipTypes={profile.relationshipTypes}
      seeking={profile.seeking}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
