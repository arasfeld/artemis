import { StyleSheet, View } from 'react-native';
import { ScreenContainer, Text } from '@artemis/ui';

export default function LikesScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text variant="title" color="dark" center>
          Likes
        </Text>
        <Text variant="subtitle" color="dark" center>
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
