import { StyleSheet, View, Button, Platform } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePushNotifications, sendPushNotification } from '@/hooks/use-push-notifications';

export default function NotificationsScreen() {
  const { expoPushToken, notification, registrationError } = usePushNotifications();

  const canSend = Boolean(expoPushToken && !registrationError);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#DED9FF', dark: '#1A152E' }}
      headerImage={<View style={styles.notifBadge} />}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Push notifications</ThemedText>
        <ThemedText style={styles.description}>
          Request permission, register the device, and trigger Expo push notifications directly
          from this screen. A physical device is required on both Android and iOS.
        </ThemedText>
        <ThemedView style={styles.tokenCard}>
          <ThemedText type="subtitle">Expo push token</ThemedText>
          <ThemedText style={styles.tokenText}>
            {expoPushToken ?? 'Requesting permission...'}
          </ThemedText>
          {registrationError ? (
            <ThemedText type="defaultSemiBold" style={styles.error}>
              {registrationError}
            </ThemedText>
          ) : (
            <ThemedText style={styles.tokenHint}>
              Copy this value into the Expo push notification tool once it becomes available.
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView style={styles.notificationCard}>
          <ThemedText type="subtitle">Most recent notification</ThemedText>
          {notification ? (
            <>
              <ThemedText>Title: {notification.request.content.title ?? '-'}</ThemedText>
              <ThemedText>Body: {notification.request.content.body ?? '-'}</ThemedText>
              <ThemedText>
                Data: {JSON.stringify(notification.request.content.data ?? {}, null, 2)}
              </ThemedText>
            </>
          ) : (
            <ThemedText>No notification received yet.</ThemedText>
          )}
        </ThemedView>
        <Button
          title={canSend ? 'Send me a test notification' : 'Waiting for device token...'}
          onPress={async () => {
            if (!canSend || !expoPushToken) {
              return;
            }
            await sendPushNotification(expoPushToken);
          }}
          disabled={!canSend}
          color={Platform.select({ ios: undefined, android: '#5E4AE3' })}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  description: {
    lineHeight: 20,
  },
  tokenCard: {
    gap: 8,
  },
  tokenText: {
    fontSize: 12,
  },
  tokenHint: {
    fontSize: 12,
    opacity: 0.8,
  },
  error: {
    color: '#DD2C00',
  },
  notificationCard: {
    gap: 4,
  },
  notifBadge: {
    height: 140,
    width: 140,
    borderRadius: 70,
    backgroundColor: '#5E4AE3',
    alignSelf: 'center',
    marginTop: 16,
  },
});

