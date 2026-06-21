import { Image } from 'expo-image';
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Button } from 'react-native';



import { StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

import { supabase } from '@/lib/supabase';
import { Buffer } from "buffer";
import { Platform } from 'react-native';

import { useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useEffect } from "react";

export default function TabTwoScreen() {

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    if (!mediaPermission?.granted) {
      requestMediaPermission();
    }
  }, []);

  //  ML result state + API key

  type ScanResult = {
  label?: string;
  confidence?: number;
  condition_code?: string;
  reason_code?: string;
  error?: string;
  raw?: any;
  };

  const [result, setResult] = useState<ScanResult | null>(null);
  const HF_API_KEY = process.env.EXPO_PUBLIC_HF_API_KEY;

  //  Scan logic
  async function handleScan() {
    // #1 Take photo using camera
    const pick = await ImagePicker.launchCameraAsync({
      base64: false,
      quality: 0.7,
    });

    if (pick.canceled) return;

    // #2 Resize the image to reduce size before uploading BEFORE converting to base64
    const manipulated = await ImageManipulator.manipulateAsync(
    pick.assets[0].uri,
    [{ resize: { width: 512 } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

    const base64 = manipulated.base64;


    if (!base64) {
      console.log("No base64 data found");
      return;
    }

    // Log size before uploading or sending
    console.log("Base64 length:", base64.length);
    console.log("Approx size MB:", (base64.length * 0.75) / (1024 * 1024));

    // #3 Upload to SupaBase Storage
    const imageData = Buffer.from(base64, "base64");

    // Create a unique filename
    const fileName = `scan-${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("scanned-images")
      .upload(fileName, imageData, {
        contentType: "image/jpeg",
      });

    if (storageError) {
      console.log("Storage upload error:", storageError);
      return;
    }

    // Build public URL
    const image_url = supabase.storage
      .from("scanned-images")
      .getPublicUrl(fileName).data.publicUrl;

    // #3 Insert into scanned_images
    const { data: imageRow, error: imageInsertError } = await supabase
      .from("scanned_images")
      .insert({
        order_id: null, // or your real order_id
        image_url,
        scanned_at: new Date(),
      })
      .select()
      .single();

    if (imageInsertError) {
      console.log("scanned_images insert error:", imageInsertError);
      return;
    }

    const image_id = imageRow.image_id;

    // #4 Run ML Model
    console.log("HF_API_KEY:", HF_API_KEY);  

    if (!base64) {
      console.log("No base64 data found");
      return;
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/WinKawaks/vit-tiny-patch16-224",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: base64,
        }),
      }
    );

    const predictions = await response.json();

    if (!Array.isArray(predictions)) {
      setResult({ error: "Unexpected model response", raw: predictions });
      return;
    }

    const top = predictions[0];
    const label = top.label.toLowerCase();
    const confidence = top.score;

    const conditionMap: Record<string, string> = {
      damaged: "C01",
      cracked: "C01",
      torn: "C01",
      dented: "C01",

      wrong_item: "C02",
      mismatched: "C02",

      color_mismatch: "C03",
      style_mismatch: "C03",
      cosmetic_issue: "C03",

      intact: "C04",
      undamaged: "C04",
      good_condition: "C04",
    };

    const condition_code = conditionMap[label] ?? "C05";
    const reason_code = confidence > 0.6 ? "CONFIDENT" : "LOW_CONFIDENCE";

    setResult({
      label,
      confidence,
      condition_code,
      reason_code,
    });

    const { error } = await supabase.from("scans").insert({
      image_id,
      label,
      confidence,
      condition_code,
      reason_code,
    });

    if (error) {
    console.log("Supabase insert error:", error);
    }

  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#676767"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>

        {/* Scan button */}
        <Button title="Scan Item" onPress={handleScan} />
      </ThemedView>

      {/* Result UI */}
      {result && (
        <ThemedView style={{ marginTop: 20 }}>
          <ThemedText type="subtitle">Scan Result</ThemedText>

          {result.error ? (
            <ThemedText>Error: {JSON.stringify(result.error)}</ThemedText>
          ) : (
            <>
              <ThemedText>Label: {result.label}</ThemedText>
              <ThemedText>Confidence: {result.confidence?.toFixed(2) ?? "N/A"}</ThemedText>
              <ThemedText>Condition Code: {result.condition_code}</ThemedText>
              <ThemedText>Reason Code: {result.reason_code}</ThemedText>
            </>
          )}
        </ThemedView>
      )}

     
    <ThemedText>This app includes example code to help you get started.</ThemedText>

      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#676767',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
