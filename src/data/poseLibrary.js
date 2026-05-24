export const DEFAULT_SCENE_PROMPT = 'Golden-hour rooftop portrait with city lights in the background';

export const MODE_LABELS = {
  solo: {
    title: 'Solo',
    description: 'One subject, strong silhouette, and simple composition.',
  },
  duo: {
    title: 'Duo',
    description: 'Two people with natural spacing and connected energy.',
  },
  group: {
    title: 'Group',
    description: 'Three or more people arranged with a clear center of gravity.',
  },
};

export const JOINT_CONNECTIONS = [
  ['head', 'neck'],
  ['neck', 'leftShoulder'],
  ['neck', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftHand'],
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightHand'],
  ['neck', 'torso'],
  ['torso', 'leftHip'],
  ['torso', 'rightHip'],
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftFoot'],
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightFoot'],
  ['leftHip', 'rightHip'],
];

const STYLE_LIBRARY = {
  openFrame: {
    head: { x: 50, y: 18 },
    neck: { x: 50, y: 28 },
    leftShoulder: { x: 38, y: 32 },
    rightShoulder: { x: 62, y: 32 },
    leftElbow: { x: 28, y: 48 },
    rightElbow: { x: 73, y: 46 },
    leftHand: { x: 18, y: 64 },
    rightHand: { x: 84, y: 61 },
    torso: { x: 50, y: 48 },
    leftHip: { x: 42, y: 66 },
    rightHip: { x: 58, y: 66 },
    leftKnee: { x: 39, y: 90 },
    rightKnee: { x: 61, y: 90 },
    leftFoot: { x: 35, y: 114 },
    rightFoot: { x: 65, y: 113 },
  },
  leanBack: {
    head: { x: 47, y: 18 },
    neck: { x: 49, y: 29 },
    leftShoulder: { x: 37, y: 33 },
    rightShoulder: { x: 61, y: 33 },
    leftElbow: { x: 23, y: 48 },
    rightElbow: { x: 70, y: 48 },
    leftHand: { x: 19, y: 62 },
    rightHand: { x: 78, y: 65 },
    torso: { x: 49, y: 50 },
    leftHip: { x: 41, y: 67 },
    rightHip: { x: 57, y: 66 },
    leftKnee: { x: 38, y: 92 },
    rightKnee: { x: 61, y: 90 },
    leftFoot: { x: 34, y: 115 },
    rightFoot: { x: 66, y: 112 },
  },
  heroAngle: {
    head: { x: 52, y: 15 },
    neck: { x: 51, y: 27 },
    leftShoulder: { x: 39, y: 31 },
    rightShoulder: { x: 62, y: 31 },
    leftElbow: { x: 35, y: 42 },
    rightElbow: { x: 74, y: 35 },
    leftHand: { x: 43, y: 49 },
    rightHand: { x: 81, y: 20 },
    torso: { x: 51, y: 47 },
    leftHip: { x: 43, y: 66 },
    rightHip: { x: 59, y: 66 },
    leftKnee: { x: 39, y: 90 },
    rightKnee: { x: 64, y: 87 },
    leftFoot: { x: 35, y: 114 },
    rightFoot: { x: 69, y: 109 },
  },
  wideLaugh: {
    head: { x: 49, y: 19 },
    neck: { x: 50, y: 29 },
    leftShoulder: { x: 36, y: 33 },
    rightShoulder: { x: 64, y: 33 },
    leftElbow: { x: 18, y: 46 },
    rightElbow: { x: 82, y: 47 },
    leftHand: { x: 10, y: 58 },
    rightHand: { x: 90, y: 59 },
    torso: { x: 50, y: 49 },
    leftHip: { x: 42, y: 67 },
    rightHip: { x: 58, y: 67 },
    leftKnee: { x: 40, y: 91 },
    rightKnee: { x: 60, y: 91 },
    leftFoot: { x: 37, y: 114 },
    rightFoot: { x: 63, y: 114 },
  },
};

const THEME_LIBRARY = {
  beach: {
    sceneLabel: 'Beach boardwalk',
    mood: 'bright and relaxed',
    summary: 'Open sky and clean horizon lines call for airy poses with relaxed elbows and a long outline.',
  },
  office: {
    sceneLabel: 'Modern office',
    mood: 'clean and polished',
    summary: 'Straight architectural lines support tidy gestures and a confident but controlled silhouette.',
  },
  party: {
    sceneLabel: 'Night party',
    mood: 'energetic and loud',
    summary: 'Warm crowd energy works best with asymmetry, lifted hands, and a playful group formation.',
  },
  cafe: {
    sceneLabel: 'Cafe interior',
    mood: 'soft and candid',
    summary: 'Smaller spaces reward diagonal body angles and gentle hand placement near the torso.',
  },
  rooftop: {
    sceneLabel: 'Rooftop skyline',
    mood: 'cinematic',
    summary: 'A wide skyline needs a hero shape, clean negative space, and one controlled accent limb.',
  },
  street: {
    sceneLabel: 'City street',
    mood: 'editorial',
    summary: 'Urban layers suit one anchored stance, a subtle lean, and a second pose with more movement.',
  },
  sunset: {
    sceneLabel: 'Sunset horizon',
    mood: 'romantic',
    summary: 'Warm horizon light favors open shoulders, a slight chest lift, and a pose that faces the glow.',
  },
  default: {
    sceneLabel: 'Golden-hour backdrop',
    mood: 'cinematic',
    summary: 'Balanced light and background texture allow a clean pose outline with a few strong angles.',
  },
};

export function getSceneProfile(prompt) {
  const text = prompt.toLowerCase();

  if (text.includes('beach') || text.includes('ocean')) {
    return THEME_LIBRARY.beach;
  }

  if (text.includes('office') || text.includes('work') || text.includes('desk')) {
    return THEME_LIBRARY.office;
  }

  if (text.includes('party') || text.includes('club') || text.includes('nightlife')) {
    return THEME_LIBRARY.party;
  }

  if (text.includes('cafe') || text.includes('coffee') || text.includes('restaurant')) {
    return THEME_LIBRARY.cafe;
  }

  if (text.includes('roof') || text.includes('skyline') || text.includes('terrace')) {
    return THEME_LIBRARY.rooftop;
  }

  if (text.includes('street') || text.includes('city') || text.includes('urban')) {
    return THEME_LIBRARY.street;
  }

  if (text.includes('sunset') || text.includes('golden hour') || text.includes('dusk')) {
    return THEME_LIBRARY.sunset;
  }

  return THEME_LIBRARY.default;
}

function transformJoints(base, options = {}) {
  const { offsetX = 0, offsetY = 0, scale = 1, mirror = false } = options;

  return Object.fromEntries(
    Object.entries(base).map(([jointName, point]) => {
      const horizontalPoint = mirror ? 100 - point.x : point.x;
      return [jointName, { x: horizontalPoint * scale + offsetX, y: point.y * scale + offsetY }];
    }),
  );
}

function createPerson(styleName, options = {}) {
  return {
    joints: transformJoints(STYLE_LIBRARY[styleName], options),
    connections: JOINT_CONNECTIONS,
  };
}

function buildPeopleForMode(mode, styleName, poseIndex) {
  if (mode === 'duo') {
    return [
      createPerson(styleName, { offsetX: -8, offsetY: poseIndex % 2 === 0 ? 0 : 4, scale: 0.96 }),
      createPerson('leanBack', { offsetX: 18, offsetY: 4, scale: 0.94, mirror: true }),
    ];
  }

  if (mode === 'group') {
    return [
      createPerson('wideLaugh', { offsetX: -18, offsetY: 8, scale: 0.9 }),
      createPerson(styleName, { offsetX: 0, offsetY: 0, scale: 1 }),
      createPerson('heroAngle', { offsetX: 22, offsetY: 6, scale: 0.92, mirror: true }),
    ];
  }

  return [createPerson(styleName, { offsetX: 0, offsetY: poseIndex % 2 === 0 ? 0 : 3, scale: 1 })];
}

function buildPose({ id, title, subtitle, alignmentCue, rationale, styleName, mode, poseIndex, score }) {
  return {
    id,
    title,
    subtitle,
    alignmentCue,
    rationale,
    score,
    people: buildPeopleForMode(mode, styleName, poseIndex),
  };
}

export function buildFallbackPoseOptions(prompt, mode) {
  const profile = getSceneProfile(prompt);
  const modeDescription = MODE_LABELS[mode]?.description ?? MODE_LABELS.solo.description;

  return {
    sceneLabel: profile.sceneLabel,
    mood: profile.mood,
    summary: `${profile.summary} ${modeDescription}`,
    source: 'local',
    poses: [
      buildPose({
        id: 'pose-open-frame',
        title: 'Open Frame',
        subtitle: 'Build width with relaxed elbows and a lifted chest.',
        alignmentCue: 'Center shoulders under the glow and keep the hands visible.',
        rationale: 'This shape works when the scene needs confidence without blocking the background.',
        styleName: 'openFrame',
        mode,
        poseIndex: 0,
        score: 96,
      }),
      buildPose({
        id: 'pose-lean-back',
        title: 'Lean Back',
        subtitle: 'Use a subtle torso tilt to create depth and motion.',
        alignmentCue: 'Shift weight to the back leg and keep the front shoulder open.',
        rationale: 'A small lean adds shape while keeping the body readable from a distance.',
        styleName: 'leanBack',
        mode,
        poseIndex: 1,
        score: 92,
      }),
      buildPose({
        id: 'pose-hero-angle',
        title: 'Hero Angle',
        subtitle: 'Lift one arm and let the chin lead the silhouette.',
        alignmentCue: 'Keep the front hip anchored and rotate the chest toward the light.',
        rationale: 'Best for dramatic backgrounds where the subject needs a stronger editorial shape.',
        styleName: 'heroAngle',
        mode,
        poseIndex: 2,
        score: 89,
      }),
      buildPose({
        id: 'pose-wide-laugh',
        title: 'Wide Laugh',
        subtitle: 'Stretch the frame and let the outline feel alive.',
        alignmentCue: 'Open both elbows and leave space between the body and the edge of frame.',
        rationale: 'This is the most energetic option and usually works best in social scenes.',
        styleName: 'wideLaugh',
        mode,
        poseIndex: 3,
        score: 94,
      }),
    ],
  };
}
