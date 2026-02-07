import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, Text } from '@artemis/ui';
import type { GenderData, PhotoData, RelationshipTypeData } from '@/types/api';
import { PhotoCarousel } from './PhotoCarousel';
import { ProfileSection } from './ProfileSection';

export type ProfileEditSection =
  | 'age-range'
  | 'gender'
  | 'location'
  | 'name'
  | 'photos'
  | 'relationship'
  | 'seeking';

interface ProfileViewProps {
  age?: number;
  ageRangeMax: number;
  ageRangeMin: number;
  firstName?: string;
  genders: GenderData[];
  location?: string;
  onEditSection: (section: ProfileEditSection) => void;
  onSettingsPress?: () => void;
  onSignOut: () => void;
  photos: PhotoData[];
  relationshipTypes?: RelationshipTypeData[];
  seeking: GenderData[];
}

export function ProfileView({
  age,
  ageRangeMax,
  ageRangeMin,
  firstName,
  genders,
  location,
  onEditSection,
  onSettingsPress,
  onSignOut,
  photos,
  relationshipTypes,
  seeking,
}: ProfileViewProps) {
  const genderText =
    genders.length > 0
      ? genders.map((g) => g.name).join(', ')
      : 'Not specified';

  const seekingText =
    seeking.length > 0
      ? seeking.map((g) => g.name).join(', ')
      : 'Not specified';

  const relationshipText =
    relationshipTypes && relationshipTypes.length > 0
      ? relationshipTypes.map((r) => r.name).join(', ')
      : 'Not specified';

  const ageRangeText = `${ageRangeMin} - ${ageRangeMax} years old`;

  const locationText = location || 'Not specified';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Photo Carousel */}
      <PhotoCarousel
        editable
        photos={photos}
        onEditPress={() => onEditSection('photos')}
      />

      {/* Name and Age Header */}
      <ProfileSection
        title={
          firstName && age ? `${firstName}, ${age}` : firstName || 'Your Name'
        }
        onPress={() => onEditSection('name')}
      >
        <Text style={styles.sectionHint}>Tap to edit your name</Text>
      </ProfileSection>

      {/* About Me Section */}
      <ProfileSection title="About Me" onPress={() => onEditSection('gender')}>
        <View style={styles.infoRow}>
          <Ionicons
            color={colors.mutedForeground}
            name="person-outline"
            size={18}
          />
          <Text style={styles.infoLabel}>Gender:</Text>
          <Text style={styles.infoValue}>{genderText}</Text>
        </View>
      </ProfileSection>

      {/* Looking For Section */}
      <ProfileSection
        title="Looking For"
        onPress={() => onEditSection('relationship')}
      >
        <View style={styles.infoRow}>
          <Ionicons
            color={colors.mutedForeground}
            name="heart-outline"
            size={18}
          />
          <Text style={styles.infoLabel}>Relationship:</Text>
          <Text style={styles.infoValue}>{relationshipText}</Text>
        </View>
      </ProfileSection>

      {/* Preferences Section */}
      <ProfileSection
        title="Preferences"
        onPress={() => onEditSection('seeking')}
      >
        <View style={styles.infoRow}>
          <Ionicons
            color={colors.mutedForeground}
            name="people-outline"
            size={18}
          />
          <Text style={styles.infoLabel}>Interested in:</Text>
          <Text style={styles.infoValue}>{seekingText}</Text>
        </View>
      </ProfileSection>

      {/* Age Range Section */}
      <ProfileSection
        title="Age Range"
        onPress={() => onEditSection('age-range')}
      >
        <View style={styles.infoRow}>
          <Ionicons
            color={colors.mutedForeground}
            name="calendar-outline"
            size={18}
          />
          <Text style={styles.infoValue}>{ageRangeText}</Text>
        </View>
      </ProfileSection>

      {/* Location Section */}
      <ProfileSection
        title="Location"
        onPress={() => onEditSection('location')}
      >
        <View style={styles.infoRow}>
          <Ionicons
            color={colors.mutedForeground}
            name="location-outline"
            size={18}
          />
          <Text style={styles.infoValue}>{locationText}</Text>
        </View>
      </ProfileSection>

      {/* Settings Section */}
      {onSettingsPress && (
        <ProfileSection title="Settings" onPress={onSettingsPress}>
          <Text style={styles.sectionHint}>App settings and preferences</Text>
        </ProfileSection>
      )}

      {/* Sign Out Section */}
      <ProfileSection title="Sign Out" onPress={onSignOut} showChevron={false}>
        <Text style={styles.signOutHint}>Sign out of your account</Text>
      </ProfileSection>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export { calculateAge };

const styles = StyleSheet.create({
  bottomPadding: {
    height: spacing.xl,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  infoLabel: {
    color: colors.mutedForeground,
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  infoValue: {
    color: colors.foreground,
    flex: 1,
    fontSize: 14,
  },
  sectionHint: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  signOutHint: {
    color: colors.destructive,
    fontSize: 13,
  },
});
