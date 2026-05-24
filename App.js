import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import ModeSelector from './src/components/ModeSelector';
import PoseCard from './src/components/PoseCard';
import SkeletonOverlay from './src/components/SkeletonOverlay';
import useGalleryPermission from './src/hooks/useGalleryPermission';
import saveCapturedPhoto from './src/services/saveCapturedPhoto';
import {
  DEFAULT_SCENE_PROMPT,
  analyzeSceneAndGeneratePoses,
} from './src/services/gemini';

const CAPTURE_MODES = {
  auto: 'Auto',
  manual: 'Manual',
};

export default function App() {
  const cameraRef = useRef(null);
  const autoCaptureTriggeredRef = useRef(false);
  const analysisRunRef = useRef(false);
  const capturePhotoRef = useRef(null);
  const { height: windowHeight } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = useGalleryPermission();

  const [mode, setMode] = useState('solo');
  const [captureMode, setCaptureMode] = useState('auto');
  const [scenePrompt, setScenePrompt] = useState(DEFAULT_SCENE_PROMPT);
  const [sceneState, setSceneState] = useState({
    sceneLabel: 'Golden-hour rooftop',
    mood: 'cinematic',
    summary: 'The sky is warm, the skyline is open, and the pose needs clean negative space.',
    source: 'local',
  });
  const [poseOptions, setPoseOptions] = useState([]);
  const [selectedPoseId, setSelectedPoseId] = useState(null);
  const [alignmentScore, setAlignmentScore] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedPhoto, setLastSavedPhoto] = useState(null);

  const cameraAllowed = cameraPermission?.granted ?? false;
  const mediaAllowed = mediaPermission?.granted ?? false;
  const selectedPose = useMemo(
    () => poseOptions.find(item => item.id === selectedPoseId) ?? poseOptions[0] ?? null,
    [poseOptions, selectedPoseId],
  );

  const runSceneAnalysis = async (nextPrompt = scenePrompt, nextMode = mode) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSceneAndGeneratePoses({
        prompt: nextPrompt,
        mode: nextMode,
        apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      });

      setSceneState({
        sceneLabel: result.sceneLabel,
        mood: result.mood,
        summary: result.summary,
        source: result.source,
      });
      setPoseOptions(result.poses);
      setSelectedPoseId(result.poses[0]?.id ?? null);
      autoCaptureTriggeredRef.current = false;
      setAlignmentScore(nextMode === 'manual' ? 72 : 0);
    } catch (error) {
      Alert.alert('CamAI', 'The scene analysis step could not complete.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const capturePhoto = async source => {
    if (!cameraRef.current || !cameraReady || isCapturing || isSaving) {
      return;
    }

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.95,
        skipProcessing: false,
      });

      if (!mediaAllowed) {
        const permission = await requestMediaPermission();
        if (!permission.granted) {
          Alert.alert('Gallery access needed', 'CamAI needs photo access to save the shot.');
          return;
        }
      }

      setIsSaving(true);
      const savedUri = await saveCapturedPhoto(photo.uri);

      setLastSavedPhoto({
        uri: savedUri ?? photo.uri,
        source,
        poseTitle: selectedPose?.title ?? 'Pose locked',
      });
      setAlignmentScore(100);
    } catch (error) {
      autoCaptureTriggeredRef.current = false;
      Alert.alert('Capture failed', 'CamAI could not save the photo this time.');
    } finally {
      setIsCapturing(false);
      setIsSaving(false);
    }
  };

  capturePhotoRef.current = capturePhoto;

  useEffect(() => {
    if (!fontsLoaded || analysisRunRef.current) {
      return;
    }

    analysisRunRef.current = true;
    void runSceneAnalysis(scenePrompt, mode);
  }, [fontsLoaded]);

  useEffect(() => {
    if (captureMode !== 'auto' || !cameraReady || !selectedPose || isAnalyzing || isCapturing) {
      return;
    }

    setAlignmentScore(0);
    autoCaptureTriggeredRef.current = false;

    const timer = setInterval(() => {
      setAlignmentScore(currentScore => Math.min(100, currentScore + 8));
    }, 480);

    return () => clearInterval(timer);
  }, [captureMode, cameraReady, selectedPose?.id, isAnalyzing, isCapturing]);

  useEffect(() => {
    if (
      captureMode !== 'auto' ||
      !cameraReady ||
      !selectedPose ||
      isCapturing ||
      isAnalyzing ||
      autoCaptureTriggeredRef.current ||
      alignmentScore < 96
    ) {
      return;
    }

    autoCaptureTriggeredRef.current = true;
    void capturePhotoRef.current?.('auto');
  }, [alignmentScore, captureMode, cameraReady, selectedPose, isAnalyzing, isCapturing]);

  if (!fontsLoaded || !cameraPermission) {
    return <View style={styles.bootScreen} />;
  }

  if (!cameraAllowed) {
    return (
      <View style={styles.permissionScreen}>
        <View style={styles.permissionGlowTop} />
        <View style={styles.permissionGlowBottom} />

        <Text style={styles.brand}>CamAI</Text>
        <Text style={styles.permissionTitle}>Camera access is required</Text>
        <Text style={styles.permissionCopy}>
          CamAI needs the live preview to analyze the background, place the pose overlay, and
          trigger auto-capture.
        </Text>

        <Pressable style={styles.primaryButton} onPress={requestCameraPermission}>
          <Text style={styles.primaryButtonLabel}>Grant camera access</Text>
        </Pressable>
      </View>
    );
  }

  const alignmentLabel =
    alignmentScore >= 96 ? 'Locked' : alignmentScore >= 72 ? 'Nearly there' : 'Searching';
  const cameraStageHeight = Math.max(520, Math.min(Math.round(windowHeight * 0.64), 780));

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.backdrop} />
        <View style={styles.backdropAccentOne} />
        <View style={styles.backdropAccentTwo} />

        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.brand}>CamAI</Text>
            <Text style={styles.headline}>Pose guidance that fits the scene.</Text>
          </View>

          <View style={styles.statusStack}>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipLabel}>
                {sceneState.source === 'gemini' ? 'Gemini live' : 'Fallback AI'}
              </Text>
            </View>
            <View style={styles.statusChipMuted}>
              <Text style={styles.statusChipLabelMuted}>{CAPTURE_MODES[captureMode]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cameraCard}>
          <View style={styles.cameraTopRow}>
            <View>
              <Text style={styles.cameraTitle}>Live camera</Text>
              <Text style={styles.cameraSubtitle}>
                {sceneState.sceneLabel} · {sceneState.mood}
              </Text>
            </View>

            <View style={styles.scorePill}>
              <Text style={styles.scorePillValue}>{alignmentScore}%</Text>
              <Text style={styles.scorePillLabel}>{alignmentLabel}</Text>
            </View>
          </View>

          <View style={[styles.cameraStage, { height: cameraStageHeight }]}>
            <CameraView
              ref={cameraRef}
              style={styles.cameraPreview}
              facing="back"
              onCameraReady={() => setCameraReady(true)}
            />

            <SkeletonOverlay pose={selectedPose} mode={mode} alignmentScore={alignmentScore} />

            <View style={styles.cameraBadgeRow}>
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraBadgeText}>
                  {captureMode === 'auto' ? 'Auto-click armed' : 'Manual capture ready'}
                </Text>
              </View>
              <View style={styles.cameraBadgeSecondary}>
                <Text style={styles.cameraBadgeTextSecondary}>
                  {cameraReady ? 'Preview active' : 'Waiting for camera'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cameraFooter}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setCaptureMode(prev => (prev === 'auto' ? 'manual' : 'auto'))}
            >
              <Text style={styles.secondaryButtonLabel}>
                Switch to {captureMode === 'auto' ? 'manual' : 'auto'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.primaryButton}
              onPress={() => capturePhotoRef.current?.('manual')}
              disabled={isCapturing || isSaving}
            >
              {isCapturing || isSaving ? (
                <ActivityIndicator color="#08101a" />
              ) : (
                <Text style={styles.primaryButtonLabel}>Capture now</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scene analysis</Text>
            <Text style={styles.sectionMeta}>{mode.toUpperCase()}</Text>
          </View>

          <TextInput
            value={scenePrompt}
            onChangeText={setScenePrompt}
            placeholder="Describe the scene, like beach sunset, office portrait, rooftop night..."
            placeholderTextColor="rgba(230, 244, 254, 0.35)"
            style={styles.promptInput}
            multiline
          />

          <View style={styles.analysisRow}>
            <Pressable
              style={[styles.secondaryButton, styles.analysisButton]}
              onPress={() => void runSceneAnalysis(scenePrompt, mode)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#e8f2ff" />
              ) : (
                <Text style={styles.secondaryButtonLabel}>Generate poses</Text>
              )}
            </Pressable>

            <View style={styles.analysisSummaryCard}>
              <Text style={styles.analysisSummaryTitle}>{sceneState.sceneLabel}</Text>
              <Text style={styles.analysisSummaryCopy}>{sceneState.summary}</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shoot mode</Text>
            <Text style={styles.sectionMeta}>Solo / Duo / Group</Text>
          </View>

          <ModeSelector
            value={mode}
            onChange={nextMode => {
              setMode(nextMode);
              void runSceneAnalysis(scenePrompt, nextMode);
            }}
          />
        </View>

        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pose options</Text>
            <Text style={styles.sectionMeta}>{poseOptions.length} generated</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.poseRail}>
            {poseOptions.map(pose => (
              <PoseCard
                key={pose.id}
                pose={pose}
                selected={pose.id === selectedPose?.id}
                onPress={() => {
                  setSelectedPoseId(pose.id);
                  autoCaptureTriggeredRef.current = false;
                  setAlignmentScore(captureMode === 'auto' ? 0 : 72);
                }}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Capture output</Text>
            <Text style={styles.sectionMeta}>{mediaAllowed ? 'Gallery access ready' : 'Will request on save'}</Text>
          </View>

          {lastSavedPhoto ? (
            <View style={styles.savedPreviewRow}>
              <Image source={{ uri: lastSavedPhoto.uri }} style={styles.savedPreviewImage} />
              <View style={styles.savedPreviewCopy}>
                <Text style={styles.savedPreviewTitle}>{lastSavedPhoto.poseTitle}</Text>
                <Text style={styles.savedPreviewMeta}>Saved from {lastSavedPhoto.source} capture</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyState}>No photo saved yet. Align the pose and capture a frame.</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    backgroundColor: '#07111d',
  },
  screen: {
    flex: 1,
    backgroundColor: '#07111d',
  },
  scrollContent: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 18,
    gap: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 80,
    right: -120,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    opacity: 0.9,
  },
  backdropAccentOne: {
    position: 'absolute',
    top: 260,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(255, 190, 92, 0.18)',
  },
  backdropAccentTwo: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 120,
    height: 120,
    borderRadius: 120,
    backgroundColor: 'rgba(145, 70, 255, 0.12)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    color: '#f8fbff',
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.4,
  },
  headline: {
    marginTop: 4,
    color: '#c9d8e9',
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 250,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  statusStack: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(88, 219, 160, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(88, 219, 160, 0.28)',
  },
  statusChipMuted: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 29, 47, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(161, 183, 207, 0.14)',
  },
  statusChipLabel: {
    color: '#dbf7eb',
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statusChipLabelMuted: {
    color: '#bfd2e4',
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cameraCard: {
    borderRadius: 30,
    padding: 16,
    backgroundColor: 'rgba(8, 16, 26, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(164, 190, 216, 0.14)',
    boxShadow: '0px 18px 24px rgba(0, 0, 0, 0.28)',
    elevation: 5,
  },
  cameraTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  cameraTitle: {
    color: '#f8fbff',
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  cameraSubtitle: {
    marginTop: 4,
    color: '#9fb5c8',
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  scorePill: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(238, 245, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(238, 245, 255, 0.08)',
  },
  scorePillValue: {
    color: '#fff7d8',
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  scorePillLabel: {
    color: '#bccdde',
    fontSize: 10,
    fontFamily: 'SpaceGrotesk_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cameraStage: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0d1a2b',
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraBadgeRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cameraBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 30, 49, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cameraBadgeSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  cameraBadgeText: {
    color: '#f1f7ff',
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  cameraBadgeTextSecondary: {
    color: '#d8e7f6',
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  cameraFooter: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#f8fbff',
  },
  primaryButtonLabel: {
    color: '#08101a',
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(193, 212, 233, 0.18)',
    backgroundColor: 'rgba(14, 25, 39, 0.74)',
  },
  secondaryButtonLabel: {
    color: '#eaf3ff',
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  panel: {
    borderRadius: 26,
    padding: 16,
    backgroundColor: 'rgba(9, 18, 31, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(164, 190, 216, 0.12)',
  },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: '#f8fbff',
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  sectionMeta: {
    color: '#9bb0c5',
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  promptInput: {
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(243, 249, 255, 0.04)',
    color: '#eef5fb',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  analysisRow: {
    marginTop: 12,
    gap: 10,
  },
  analysisButton: {
    alignSelf: 'flex-start',
    minWidth: 160,
  },
  analysisSummaryCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(243, 249, 255, 0.04)',
  },
  analysisSummaryTitle: {
    color: '#f8fbff',
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  analysisSummaryCopy: {
    marginTop: 6,
    color: '#b5c7d9',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  poseRail: {
    gap: 12,
    paddingRight: 12,
  },
  savedPreviewRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  savedPreviewImage: {
    width: 88,
    height: 110,
    borderRadius: 18,
    backgroundColor: 'rgba(243, 249, 255, 0.05)',
  },
  savedPreviewCopy: {
    flex: 1,
  },
  savedPreviewTitle: {
    color: '#f8fbff',
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  savedPreviewMeta: {
    marginTop: 6,
    color: '#c0d3e3',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  emptyState: {
    color: '#b2c3d6',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#07111d',
  },
  permissionGlowTop: {
    position: 'absolute',
    top: 80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
  },
  permissionGlowBottom: {
    position: 'absolute',
    bottom: 110,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(255, 190, 92, 0.12)',
  },
  permissionTitle: {
    marginTop: 18,
    color: '#f8fbff',
    fontSize: 28,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  permissionCopy: {
    marginTop: 12,
    color: '#bfd0e0',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_500Medium',
  },
});
