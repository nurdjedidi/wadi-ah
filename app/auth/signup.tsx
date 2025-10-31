import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          onboarding_completed: false,
        });

      setLoading(false);

      if (profileError) {
        setError('Erreur lors de la création du profil');
        return;
      }

      router.replace('/onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Button
            mode="text"
            onPress={() => router.back()}
            icon={() => <ArrowLeft size={24} color="#B3D9FF" />}
            style={styles.backButton}
          >
            {''}
          </Button>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text variant="displaySmall" style={styles.title}>
                Inscription
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Créez votre compte pour commencer
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                mode="outlined"
                label="Nom complet"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                left={<TextInput.Icon icon={() => <User size={20} color="#B3D9FF" />} />}
                style={styles.input}
                theme={{ colors: { primary: '#2196F3' } }}
              />

              <TextInput
                mode="outlined"
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon={() => <Mail size={20} color="#B3D9FF" />} />}
                style={styles.input}
                theme={{ colors: { primary: '#2196F3' } }}
              />

              <TextInput
                mode="outlined"
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                left={<TextInput.Icon icon={() => <Lock size={20} color="#B3D9FF" />} />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                theme={{ colors: { primary: '#2196F3' } }}
              />

              <TextInput
                mode="outlined"
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                left={<TextInput.Icon icon={() => <Lock size={20} color="#B3D9FF" />} />}
                style={styles.input}
                theme={{ colors: { primary: '#2196F3' } }}
              />

              {error ? (
                <HelperText type="error" visible={true}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={handleSignup}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                S'inscrire
              </Button>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Déjà un compte ?</Text>
                <Button
                  mode="text"
                  onPress={() => router.replace('/auth/login')}
                  compact
                >
                  Se connecter
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: '#E3F2FD',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B3D9FF',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#121838',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#B3D9FF',
  },
});
