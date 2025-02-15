import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';

import { useAuth } from '@/context/authContext';

interface LoginState {
  value: string;
  error: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState<LoginState>({ value: '', error: '' });
  const [password, setPassword] = useState<LoginState>({ value: '', error: '' });
  const { login } = useAuth();

  const handleLogin = async () => {
    // const emailError = emailValidator(email.value);
    // const passwordError = passwordValidator(password.value);
    
    // if (emailError || passwordError) {
    //   setEmail({ ...email, error: emailError });
    //   setPassword({ ...password, error: passwordError });
    //   return;
    // }

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: password.value }),
      });

      const data = await response.json();
      
      if (response.ok) {
        login(data.id);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  return (
    // <Background>
      // <BackButton goBack={() => router.back()} />
      // <Logo />
      // <Header>Welcome Back</Header>
      <>
      <TextInput
        label="Email"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        // errorText={email.error}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        secureTextEntry
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        // errorText={password.error}
      />
      {/* <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => router.push('/auth/reset')}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      </View> */}
      <Button mode="contained" onPress={handleLogin}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      </>
    // </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    // color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    // color: theme.colors.primary,
  },
});