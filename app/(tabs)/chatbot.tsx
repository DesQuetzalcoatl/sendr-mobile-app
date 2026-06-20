import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Message = { id: string; text: string; from: 'user' | 'bot' };

export default function ChatbotScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi — ask me anything.', from: 'bot' },
  ]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: input.trim(), from: 'user' };
    setMessages((m) => [userMsg, ...m]);
    setInput('');

    // Placeholder bot reply (replace with real AI call)
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `Echo: ${userMsg.text}`,
        from: 'bot',
      };
      setMessages((m) => [botMsg, ...m]);
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.from === 'user' ? styles.userBubble : styles.botBubble,
                { backgroundColor: item.from === 'user' ? theme.tint : 'transparent' },
              ]}
            >
              <Text style={[styles.bubbleText, { color: item.from === 'user' ? '#fff' : theme.text }]}>
                {item.text}
              </Text>
            </View>
          )}
        />

        <View style={[styles.composer, { borderTopColor: theme.icon }]}>
          <TextInput
            placeholder="Ask a question..."
            placeholderTextColor={theme.icon}
            value={input}
            onChangeText={setInput}
            style={[styles.input, { color: theme.text }]}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={send} style={styles.sendButton}>
            <IconSymbol name="paperplane.fill" size={20} color={theme.tint} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  list: { padding: 12, paddingBottom: 8 },
  bubble: { marginVertical: 6, padding: 10, borderRadius: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: 'transparent' },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 8 },
  sendButton: { marginLeft: 8, padding: 8 },
});