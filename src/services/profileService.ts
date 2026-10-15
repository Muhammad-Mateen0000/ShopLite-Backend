import { supabase } from "../config/supabase.js";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, role, avatar_url, created_at, updated_at",
    )
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error("Failed to fetch profile");
  }

  if (data.avatar_url) {
    const { data: signedUrlData } = await supabase.storage
      .from("profile-images")
      .createSignedUrl(data.avatar_url, 60 * 60);

    return {
      ...data,
      avatar_url: signedUrlData?.signedUrl ?? null,
    };
  }

  return data;
}

export async function updateProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
  },
) {
  const updateData: Record<string, unknown> = {};

  if (data.firstName !== undefined) {
    updateData.first_name = data.firstName;
  }

  if (data.lastName !== undefined) {
    updateData.last_name = data.lastName;
  }

  updateData.updated_at = new Date().toISOString();

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select(
      "id, email, first_name, last_name, role, avatar_url, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error("Failed to update profile");
  }

  if (profile.avatar_url) {
    const { data: signedUrlData } = await supabase.storage
      .from("profile-images")
      .createSignedUrl(profile.avatar_url, 60 * 60);

    return {
      ...profile,
      avatar_url: signedUrlData?.signedUrl ?? null,
    };
  }

  return profile;
}

export async function uploadAvatar(userId: string, file: Express.Multer.File) {
  const extension = file.mimetype === "image/png" ? "png" : "jpg";

  const filePath = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    throw new Error("Failed to upload profile image");
  }

  const { data: profile, error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: filePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(
      "id, email, first_name, last_name, role, avatar_url, created_at, updated_at",
    )
    .single();

  if (updateError) {
    throw new Error("Failed to update profile image");
  }

  const { data: signedUrlData } = await supabase.storage
    .from("profile-images")
    .createSignedUrl(filePath, 60 * 60);

  return {
    ...profile,
    avatar_url: signedUrlData?.signedUrl ?? null,
  };
}
