import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './config';

export const storage = getStorage(app);

export async function uploadFile(path: string, file: File) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { snapshot, downloadURL };
}

export async function getFileURL(path: string) {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
}

export async function deleteFile(path: string) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}