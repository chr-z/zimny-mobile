/**
 * ErrorState — Reusable error/offline state component.
 *
 * Displays an icon, message, and optional retry button.
 */
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/src/components/common/PressableScale';
import { useTranslation } from '@/src/i18n';

type ErrorStateProps = {
  /** Main error message (default: "Algo deu errado") */
  title?: string;
  /** Secondary description */
  message?: string;
  /** Show retry button */
  onRetry?: () => void;
  /** Icon name (default: "warning") */
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
};

export function ErrorState({
  title: titleProp,
  message: messageProp,
  onRetry,
  icon = 'warning',
}: ErrorStateProps) {
  const { t } = useTranslation();
  const title = titleProp ?? t("error.padrao_titulo");
  const message = messageProp ?? t("error.padrao_msg");
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <FontAwesome name={icon} size={36} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <PressableScale scaleTo={0.94} onPress={onRetry} haptics>
          <View style={styles.button}>
            <Text style={styles.buttonText}>{t("common.tentar_novamente")}</Text>
          </View>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#000000',
  },
});