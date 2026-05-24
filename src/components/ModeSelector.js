import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MODE_LABELS } from '../data/poseLibrary';

export default function ModeSelector({ value, onChange }) {
  return (
    <View style={styles.row}>
      {Object.entries(MODE_LABELS).map(([mode, details]) => {
        const selected = value === mode;

        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <Text style={[styles.title, selected && styles.titleSelected]}>{details.title}</Text>
            <Text style={[styles.copy, selected && styles.copySelected]}>{details.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(243, 249, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(164, 190, 216, 0.12)',
  },
  cardSelected: {
    backgroundColor: 'rgba(246, 250, 255, 0.95)',
    borderColor: 'rgba(246, 250, 255, 0.95)',
  },
  title: {
    color: '#f8fbff',
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  titleSelected: {
    color: '#08101a',
  },
  copy: {
    marginTop: 8,
    color: '#bbcfdf',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  copySelected: {
    color: '#253243',
  },
});
