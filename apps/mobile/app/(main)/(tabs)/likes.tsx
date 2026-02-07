import { StyleSheet, View } from 'react-native';
import { ScreenContainer, Text } from '@artemis/ui';

export default function LikesScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text center variant="title">
          Likes
        </Text>
        <Text center variant="subtitle">
          See who likes you
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
