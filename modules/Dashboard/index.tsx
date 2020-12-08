import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useMachine, useService} from '@xstate/react';
import React, {useCallback, useEffect, useState} from 'react';
import {
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {
  Dialog,
  Paragraph,
  Portal,
  Snackbar,
  Subheading,
} from 'react-native-paper';
import Check from '../../assets/check-circle.svg';
import Clock from '../../assets/clock.svg';
import Loader from '../../shared/components/Loader';
import Screen from '../../shared/components/Screen';
import {colors} from '../../helpers/theme';
import fetchMachine from '../../machines/fetch.machine';
import Button from '../../shared/components/Button';
import SpacialDotsBg from '../../shared/components/SpacialDotsBg';
import ChangePassword from './components/ChangePassword';
import ReportCard from './components/ReportCard';
import {getReport as getReportService} from './services/api';
import requestPermissions from './services/requestPermissions';

import authService from '../../shared/machines/auth.machine';

const icon = {
  width: 25,
  height: 25,
  color: colors.primary,
};

const chartConfig = {
  strokeWidth: 2,
  decimalPlaces: 0,
  barPercentage: 0.5,
  labelColor: () => 'white',
  backgroundGradientToOpacity: 1,
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: '#c40050',
  backgroundGradientFrom: colors.primary,
  color: (opacity = 0.8) => `rgba(255, 255, 255, ${opacity})`,
};

function Dashboard() {
  const nav = useNavigation();
  const [rect, setRect] = useState<LayoutRectangle>();
  const [permissionsGranted, setAllGranted] = useState(false);
  const [showPermissionsModal, setPermissionsModal] = useState(false);

  const [state] = useService(authService);

  const {
    context: {passwordRef},
  } = state;

  const [current, send] = useMachine(fetchMachine, {
    services: {
      fetch: getReportService,
      // fetch: () => Promise.resolve(),
    },
  });

  const {error, data} = current.context as any;

  const report = data?.addressCount;

  const chartMeasure = useCallback(
    ({nativeEvent: {layout}}: LayoutChangeEvent) => {
      setRect(layout);
    },
    [],
  );

  const getReport = useCallback(() => {
    send('GET_DATA');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPerms = useCallback(async () => {
    const allGranted = await requestPermissions();
    setAllGranted(allGranted);
  }, []);

  useEffect(() => {
    requestPerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // get jobs report each time this page is opened
  useFocusEffect(getReport);

  return (
    <>
      <Screen style={styles.screen}>
        <SpacialDotsBg />
        <View style={styles.chartContainer} onLayout={chartMeasure}>
          {current.matches('loading') && (
            <Loader color="black" style={StyleSheet.absoluteFillObject} />
          )}
          {report && (
            // @ts-ignore
            <BarChart
              fromZero={true}
              style={styles.chart}
              width={rect?.width ?? 0}
              chartConfig={chartConfig}
              height={rect?.height ?? 0}
              showValuesOnTopOfBars={true}
              data={{
                labels: Object.keys(report),
                datasets: [{data: Object.values(report)}],
              }}
            />
          )}
        </View>

        <View>
          <ReportCard
            count={report?.pending}
            icon={<Clock {...icon} />}
            label="Total addresses pending"
          />

          <ReportCard
            style={styles.gapTop}
            count={report?.verified}
            icon={<Check {...icon} />}
            label="Total addresses verified"
          />

          <Button
            mode="contained"
            style={styles.btn}
            contentStyle={styles.btnContent}
            onPress={() => {
              if (!permissionsGranted) {
                return setPermissionsModal(true);
              }

              nav.navigate('Addresses');
            }}>
            View addresses
          </Button>
        </View>
      </Screen>
      <Snackbar
        onDismiss={() => {}}
        visible={current.matches('error')}
        action={{
          label: 'retry',
          onPress: getReport,
        }}>
        {error?.message}
      </Snackbar>

      <Portal>
        <Dialog
          visible={showPermissionsModal}
          onDismiss={() => setPermissionsModal(false)}>
          <Dialog.Title>Grant permissions</Dialog.Title>
          <Dialog.Content>
            <Subheading>You need to grant the following permissions</Subheading>
            <Paragraph>- Camera</Paragraph>
            <Paragraph>- Location</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setPermissionsModal(false);
                requestPerms().then(() => {
                  nav.navigate('Addresses');
                });
              }}>
              grant
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {state.matches({loggedIn: 'changePassword'}) && (
        <ChangePassword actor={passwordRef} />
      )}
    </>
  );
}

export const styles = StyleSheet.create({
  screen: {
    padding: 20,
    justifyContent: 'space-evenly',
  },
  chartContainer: {
    height: 220,
    justifyContent: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  gapTop: {
    marginTop: 20,
  },
  btn: {
    marginTop: 40,
    alignSelf: 'center',
  },
  btnContent: {
    paddingHorizontal: 10,
  },
});

export default Dashboard;
