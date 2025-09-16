import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0F0F' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
