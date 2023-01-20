import {StyleSheet, View} from 'react-native';

const styles = StyleSheet.create({
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export const Separator = () => <View style={styles.separator} />;
