import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Card, Subheading, Text} from 'react-native-paper';
import {colors} from '../../../helpers/theme';

type FieldProps = {
  title: string;
  error?: string;
  required: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const Field: React.FC<FieldProps> = ({
  error,
  title,
  style,
  children,
  required,
}) => {
  return (
    <Card style={style}>
      <Subheading style={styles.title}>
        {title}
        {required && <Text style={styles.mark}> *</Text>}
      </Subheading>
      <View style={styles.container}>
        {children}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  mark: {
    color: colors.red,
  },
  error: {
    marginTop: 5,
    color: '#fd2b2b',
  },
  container: {
    marginTop: 10,
  },
});

export default Field;
