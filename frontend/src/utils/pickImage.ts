import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

/**
 * Open the system image picker and return the chosen image shaped for a
 * multipart/form-data upload ({ uri, name, type }). Returns null when the user
 * cancels or when the picker cannot be opened.
 *
 * IMPORTANT: on modern Expo (SDK 54+) launching the *library* picker does NOT
 * require the media-library permission on either platform — Android uses the
 * system Photo Picker and iOS uses PHPicker, both of which run out-of-process.
 * We deliberately do NOT gate on requestMediaLibraryPermissionsAsync(): that
 * gate was blocking users whose device reported the permission as "not granted"
 * even though picking a photo works perfectly without it. Removing the gate is
 * what makes the "nothing happens when I tap upload" case go away.
 */
export const pickImage = async (): Promise<PickedImage | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const uri = asset.uri;

    // Derive a filename + mime type from the asset (falling back to the uri
    // extension) so the backend / Cloudinary receive a well-formed file part.
    const fileName = asset.fileName ?? uri.split("/").pop() ?? `profile_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(fileName);
    const ext = match ? match[1].toLowerCase() : "jpg";
    const type = asset.mimeType ?? `image/${ext === "jpg" ? "jpeg" : ext}`;

    return { uri, name: fileName, type };
  } catch (error: any) {
    // Surface a real reason instead of failing silently, so "nothing happens"
    // turns into a visible, debuggable message.
    Alert.alert(
      "Couldn't open your photos",
      error?.message ?? "Something went wrong opening the gallery. Please try again."
    );
    return null;
  }
};
