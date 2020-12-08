import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Card, Subheading} from 'react-native-paper';
import Badge from '../../../components/Badge';

type ReportCard = {
  label: string;
  count: number;
  icon: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ReportCard = ({icon, label, count = 0, style}: ReportCard) => {
  return (
    <Card style={[styles.card, style]}>
      <Card.Content style={[styles.row, styles.cardContent]}>
        <View style={styles.row}>
          {icon}
          <Subheading style={styles.subheading}>{label}</Subheading>
        </View>
        <Badge count={count} />
      </Card.Content>
    </Card>
  );
};

export const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  subheading: {
    marginLeft: 10,
  },
  cardContent: {
    justifyContent: 'space-between',
  },
  card: {
    padding: 10,
  },
});

export default ReportCard;
