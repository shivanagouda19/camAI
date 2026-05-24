import * as MediaLibrary from 'expo-media-library';

export default async function saveCapturedPhoto(uri) {
  const asset = await MediaLibrary.Asset.create(uri);
  return asset.getUri();
}
