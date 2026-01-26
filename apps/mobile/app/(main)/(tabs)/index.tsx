import { StyleSheet, View } from 'react-native';
import { ScreenContainer, Text } from '@artemis/ui';

export default function DiscoverScreen() {
  return (
    <ScreenContainer withGradient={false}>
      <View style={styles.container}>
        <Text variant="title" color="dark" center>
          Discover
        </Text>
        <Text variant="subtitle" color="dark" center>
          Find your match
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
