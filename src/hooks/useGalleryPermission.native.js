import * as MediaLibrary from 'expo-media-library';

export default function useGalleryPermission() {
  return MediaLibrary.usePermissions({
    writeOnly: true,
    granularPermissions: ['photo'],
  });
}
