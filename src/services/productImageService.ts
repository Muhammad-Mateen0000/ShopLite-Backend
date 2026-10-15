import { supabase } from "../config/supabase.js";

export async function uploadProductImage(
  productId: string,
  file: Express.Multer.File
) {
  const extension =
    file.mimetype === "image/png"
      ? "png"
      : "jpg";

  const filePath = `${productId}/image.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    throw new Error("Failed to upload product image");
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  const {
    data: product,
    error: updateError,
  } = await supabase
    .from("products")
    .update({
      image_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select(
      "id, name, description, price, image_url, created_at, updated_at"
    )
    .single();

  if (updateError) {
    if (updateError.code === "PGRST116") {
      return null;
    }

    throw new Error("Failed to update product image");
  }

  return product;
}