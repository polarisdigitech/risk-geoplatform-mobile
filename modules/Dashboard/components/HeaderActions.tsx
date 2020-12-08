import AsyncStorage from '@react-native-community/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useService} from '@xstate/react';
import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Menu} from 'react-native-paper';
import Logout from '../../../assets/log-out.svg';
import Overflow from '../../../assets/more-vertical.svg';
import Upload from '../../../assets/upload.svg';
import Lock from '../../../assets/lock.svg';
import Badge from '../../../components/Badge';
import Box from '../../../shared/components/Box';
import authService from '../../../shared/machines/auth.machine';

const iconSize = 30;

const HeaderActions = () => {
  const nav = useNavigation();
  const [{value}, send] = useService(authService);
  const [visible, setVisible] = React.useState(false);

  console.log(value);

  const [pending, setPendingAddresses] = useState<string[]>();

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const getPendingAddresses = async () => {
    const addresses = await AsyncStorage.getAllKeys();
    setPendingAddresses(addresses);
  };

  const hasPendingAddresses = useMemo(() => {
    return pending && pending.length > 0;
  }, [pending]);

  useFocusEffect(
    useCallback(() => {
      getPendingAddresses();
    }, []),
  );

  return (
    <Box flexDirection="row" alignItems="center">
      {hasPendingAddresses && (
        <View>
          <Badge size={20} style={styles.badge} count={pending?.length ?? 0} />
          <IconButton
            size={iconSize}
            onPress={() => nav.navigate('PendingUploads')}
            icon={({size, color}) => (
              <Upload width={size} height={size} color={color} />
            )}
          />
        </View>
      )}

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            size={iconSize}
            onPress={openMenu}
            icon={(props) => <Overflow {...props} />}
          />
        }>
        <Menu.Item
          title="Change password"
          icon={(props) => <Lock {...props} />}
          onPress={() => {
            send('CHANGE_PASSWORD');
            closeMenu();
          }}
        />
        <Menu.Item
          title="Logout"
          onPress={() => {
            send('LOGOUT');
            closeMenu();
          }}
          icon={(props) => <Logout {...props} />}
        />
      </Menu>
    </Box>
  );
};

const styles = StyleSheet.create({
  badge: {
    top: 3,
    right: 0,
    zIndex: 2,
    position: 'absolute',
  },
  menuOption: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  optionLabel: {
    marginLeft: 10,
  },
});

export default HeaderActions;
