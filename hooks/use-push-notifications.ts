import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type UsePushNotificationsResult = {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  registrationError: string | null;
};

export async function sendPushNotification(expoPushToken: string) {
  if (!expoPushToken) {
    throw new Error('No Expo push token available yet.');
  }

  const message = {
    to: expoPushToken,
    sound: 'default' as const,
    title: 'Hello from Expo',
    body: 'Push notifications are configured!',
    data: { timestamp: new Date().toISOString() },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device.');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Notification permissions were not granted.');
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error('EAS project ID is not defined. Check app config.');
  }

  const response = await Notifications.getExpoPushTokenAsync({ projectId });
  return response.data;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token))
      .catch(error => {
        const message = error instanceof Error ? error.message : String(error);
        setRegistrationError(message);
        Alert.alert('Push notifications', message);
      });

    const notificationListener = Notifications.addNotificationReceivedListener(setNotification);
    const responseListener = Notifications.addNotificationResponseReceivedListener(response =>
      console.log('Notification response', response),
    );

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    registrationError,
  };
}

