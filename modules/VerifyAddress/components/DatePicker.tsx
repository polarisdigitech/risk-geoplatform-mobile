/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import DateTimePicker from '@react-native-community/datetimepicker';
import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '../../../shared/components/Button';

type DatePicker = {
  date?: string;
  onChange?: (date: string) => void;
};

const DatePicker: React.FC<DatePicker> = ({date, onChange}) => {
  let [open, setState] = useState(false);
  let currentDate = new Date(date || Date.now());

  return (
    <View style={{alignItems: 'stretch'}}>
      <Button
        mode="outlined"
        style={{width: '100%'}}
        onPress={() => setState(true)}>
        {date ? new Date(date).toLocaleDateString() : 'select date'}
      </Button>
      {open && (
        <DateTimePicker
          value={currentDate}
          onChange={(_, date) => {
            setState(false);
            onChange?.(date?.toString() as any);
          }}
        />
      )}
    </View>
  );
};

export default DatePicker;
