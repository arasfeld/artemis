import { StyleSheet, View } from 'react-native';
import { ScreenContainer, Text } from '@artemis/ui';

export default function MessagesScreen() {
  return (
    <ScreenContainer withGradient={false}>
      <View style={styles.container}>
        <Text variant="title" color="dark" center>
          Messages
        </Text>
        <Text variant="subtitle" color="dark" center>
          Your conversations
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
