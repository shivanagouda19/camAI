import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PoseCard({ pose, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardSelected]}>
      <View style={styles.cardTopRow}>
        <Text style={[styles.score, selected && styles.scoreSelected]}>{pose.score}%</Text>
        <View style={[styles.dot, selected && styles.dotSelected]} />
      </View>

      <Text style={[styles.title, selected && styles.titleSelected]}>{pose.title}</Text>
      <Text style={[styles.copy, selected && styles.copySelected]}>{pose.subtitle}</Text>

      <View style={styles.footer}>
        <Text style={[styles.footerLabel, selected && styles.footerLabelSelected]}>
          {pose.alignmentCue}
        </Text>
      </View>

      <Text style={[styles.rationale, selected && styles.rationaleSelected]}>{pose.rationale}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    minHeight: 220,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(243, 249, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(164, 190, 216, 0.12)',
  },
  cardSelected: {
    backgroundColor: 'rgba(246, 250, 255, 0.95)',
    borderColor: 'rgba(246, 250, 255, 0.95)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  score: {
    color: '#ffe9a6',
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  scoreSelected: {
    color: '#0a1320',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 233, 166, 0.28)',
  },
  dotSelected: {
    backgroundColor: '#0a1320',
  },
  title: {
    marginTop: 18,
    color: '#f8fbff',
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  titleSelected: {
    color: '#08101a',
  },
  copy: {
    marginTop: 8,
    color: '#bad0e2',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  copySelected: {
    color: '#34485d',
  },
  footer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(164, 190, 216, 0.12)',
  },
  footerLabel: {
    color: '#e5f1ff',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  footerLabelSelected: {
    color: '#37485b',
  },
  rationale: {
    marginTop: 12,
    color: '#90a4b9',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  rationaleSelected: {
    color: '#56677d',
  },
});
