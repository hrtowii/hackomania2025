import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { BackendUrl } from '@/context/backendUrl';

interface RegisterState {
  value: string;
  error: string;
}

export default function RegisterScreen() {
  const [email, setEmail] = useState<RegisterState>({ value: '', error: '' });
  const [username, setUsername] = useState<RegisterState>({ value: '', error: '' });
  const [password, setPassword] = useState<RegisterState>({ value: '', error: '' });
  const [confirmPassword, setConfirmPassword] = useState<RegisterState>({ value: '', error: '' });
  const { login } = useAuth();

  const handleRegister = async () => {
    // Basic validation with error statuses
    let hasError = false;
    if (!email.value) {
      setEmail((prev) => ({ ...prev, error: 'Email is required' }));
      hasError = true;
    }
    if (!username.value) {
      setUsername((prev) => ({ ...prev, error: 'Username is required' }));
      hasError = true;
    }
    if (!password.value) {
      setPassword((prev) => ({ ...prev, error: 'Password is required' }));
      hasError = true;
    }
    if (password.value !== confirmPassword.value) {
      setConfirmPassword((prev) => ({ ...prev, error: 'Passwords do not match' }));
      hasError = true;
    }
    if (hasError) return;

    try {
      const response = await fetch(`${BackendUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, username: username.value, password: password.value }),
      });
      const data = await response.json();
      if (response.ok) {
        // Automatically log the user in after successful registration
        login(data.id);
        // router.replace('/(tabs)');
      } else {
        Alert.alert('Error', data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
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
        label="Username"
        value={username.value}
        onChangeText={(text) => setUsername({ value: text, error: '' })}
        error={!!username.error}
        style={styles.input}
      />
      {username.error ? <Text style={styles.errorText}>{username.error}</Text> : null}
      <TextInput
        label="Password"
        secureTextEntry
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        style={styles.input}
      />
      {password.error ? <Text style={styles.errorText}>{password.error}</Text> : null}
      <TextInput
        label="Confirm Password"
        secureTextEntry
        value={confirmPassword.value}
        onChangeText={(text) => setConfirmPassword({ value: text, error: '' })}
        error={!!confirmPassword.error}
        style={styles.input}
      />
      {confirmPassword.error ? <Text style={styles.errorText}>{confirmPassword.error}</Text> : null}

      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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