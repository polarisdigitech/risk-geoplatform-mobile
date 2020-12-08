import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

type Box = StyleProp<ViewStyle> & {
  children: ReactNode;
};

// @ts-ignore
export default function Box({children, ...style}: Box) {
  return <View style={style}>{children}</View>;
}
