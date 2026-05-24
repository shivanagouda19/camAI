import { Fragment } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

function renderJointKey(personIndex, jointName) {
  return `${personIndex}-${jointName}`;
}

export default function SkeletonOverlay({ pose, alignmentScore }) {
  if (!pose) {
    return null;
  }

  const glowOpacity = Math.max(0.22, alignmentScore / 240);

  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 140" preserveAspectRatio="none">
      <Rect x="11" y="14" width="78" height="112" rx="18" fill="rgba(9, 18, 31, 0.08)" />

      {pose.people.map((person, personIndex) => {
        const strokeWidth = personIndex === 1 ? 2.1 : 2.8;
        const accent = personIndex === 0 ? '#7de3ff' : personIndex === 1 ? '#ffd98a' : '#c39bff';

        return (
          <Fragment key={`person-${personIndex}`}>
            {person.connections.map(([startJoint, endJoint]) => {
              const start = person.joints[startJoint];
              const end = person.joints[endJoint];

              return (
                <Line
                  key={`${renderJointKey(personIndex, startJoint)}-${endJoint}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={accent}
                  strokeOpacity={0.82}
                  strokeLinecap="round"
                  strokeWidth={strokeWidth}
                />
              );
            })}

            {Object.entries(person.joints).map(([jointName, point]) => (
              <Circle
                key={renderJointKey(personIndex, jointName)}
                cx={point.x}
                cy={point.y}
                r={jointName === 'head' ? 4 : 2.4}
                fill={accent}
                fillOpacity={0.96}
                stroke="#f8fbff"
                strokeOpacity={glowOpacity}
                strokeWidth={jointName === 'head' ? 1.8 : 1.2}
              />
            ))}
          </Fragment>
        );
      })}
    </Svg>
  );
}
