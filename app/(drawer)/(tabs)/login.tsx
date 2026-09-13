import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { useTranslation } from '@/src/i18n';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    try {
      await login(email, password);
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <Screen>
        <View className="flex-1 justify-center px-8">
          <Text className="text-center text-xs uppercase text-black/50 tracking-editorial">
            {t("login.sessao")}
          </Text>
          <Text className="mt-6 text-center font-serif text-3xl text-luxury-black tracking-editorial">
            {user.name}
          </Text>
          <Text className="mt-3 text-center text-sm text-black/60 tracking-editorial">
            {user.email}
          </Text>
          <Pressable
            onPress={logout}
            className="mt-12 border border-luxury-black bg-luxury-black py-4 active:opacity-90"
          >
            <Text className="text-center text-sm uppercase text-luxury-white tracking-editorial">
              {t("login.sair")}
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center px-8"
      >
        <Text className="text-center text-xs uppercase text-black/50 tracking-editorial">
          {t("login.acesso")}
        </Text>
        <Text className="mt-4 text-center font-serif text-4xl text-luxury-black tracking-editorial">
          {t("login.entrar")}
        </Text>

        <TextInput
          className="mt-14 border-b border-black/20 bg-transparent py-3 text-base text-luxury-black tracking-editorial"
          placeholder={t("login.email")}
          placeholderTextColor="#00000066"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          className="mt-8 border-b border-black/20 bg-transparent py-3 text-base text-luxury-black tracking-editorial"
          placeholder={t("login.senha")}
          placeholderTextColor="#00000066"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          onPress={onSubmit}
          disabled={busy || !email.trim()}
          className="mt-14 border border-luxury-black bg-luxury-black py-4 active:opacity-90 disabled:opacity-40"
        >
          {busy ? (
            <ActivityIndicator color="#F5F5F7" />
          ) : (
            <Text className="text-center text-sm uppercase text-luxury-white tracking-editorial">
              {t("login.entrar")}
            </Text>
          )}
        </Pressable>

        <Text className="mt-10 text-center text-xs text-black/45 tracking-editorial">
          {t("login.disclaimer")}
        </Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}
