import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/context/authContext';
import {BackendUrl} from '@/context/backendUrl';
interface LoginState {
  value: string;
  error: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState<LoginState>({ value: '', error: '' });
  const [password, setPassword] = useState<LoginState>({ value: '', error: '' });
  const { login } = useAuth();

  const handleLogin = async () => {
    // Simple validation with error messages
    let hasError = false;
    if (!email.value) {
      setEmail((prev) => ({ ...prev, error: 'Email is required' }));
      hasError = true;
    }
    if (!password.value) {
      setPassword((prev) => ({ ...prev, error: 'Password is required' }));
      hasError = true;
    }
    if (hasError) return;

    try {
      const response = await fetch(`${BackendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: password.value }),
      });
      const data = await response.json();
      
      if (response.ok) {
        login(data.id);
      } else {
        Alert.alert('Error', data.error || 'Invalid credentials.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      {email.error ? <Text style={styles.errorText}>{email.error}</Text> : null}
      <TextInput
        label="Password"
        secureTextEntry
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        style={styles.input}
      />
      {password.error ? <Text style={styles.errorText}>{password.error}</Text> : null}

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f7f7f7'
  },
  input: {
    marginBottom: 5,
  },
  button: {
    marginTop: 15,
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
  },
  link: {
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 4,
  },
});