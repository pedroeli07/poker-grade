import { profileAvatarMessages } from "@/lib/constants/profile";

export function validateProfileAvatarFile(
  file: File,
  maxBytes: number
): { ok: true } | { ok: false; message: string } {
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: profileAvatarMessages.toast.notImage };
  }
  if (file.size > maxBytes) {
    return { ok: false, message: profileAvatarMessages.toast.tooLarge };
  }
  return { ok: true };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
