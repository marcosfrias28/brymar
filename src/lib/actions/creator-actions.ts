"use server";

export async function savePropertyDraft(prevState: any, formData: FormData) {
  try {
    const payload = formData.get("payload");
    const data = payload ? JSON.parse(payload as string) : {};
    
    console.log("[v0] Guardando propiedad:", data);
    
    // Aquí iría la lógica para guardar en base de datos
    // Por ahora solo simulamos éxito
    
    return {
      success: true,
      message: "Propiedad guardada exitosamente",
    };
  } catch (error) {
    console.error("[v0] Error guardando propiedad:", error);
    return {
      success: false,
      message: "Error al guardar la propiedad",
    };
  }
}

export async function saveLandDraft(prevState: any, formData: FormData) {
  try {
    const payload = formData.get("payload");
    const data = payload ? JSON.parse(payload as string) : {};
    console.log("[v0] Guardando terreno:", data);
    return { success: true, message: "Terreno guardado exitosamente" };
  } catch (error) {
    console.error("[v0] Error guardando terreno:", error);
    return { success: false, message: "Error al guardar el terreno" };
  }
}

export async function saveBlogDraft(prevState: any, formData: FormData) {
  try {
    const payload = formData.get("payload");
    const data = payload ? JSON.parse(payload as string) : {};
    console.log("[v0] Guardando post:", data);
    return { success: true, message: "Post guardado exitosamente" };
  } catch (error) {
    console.error("[v0] Error guardando post:", error);
    return { success: false, message: "Error al guardar el post" };
  }
}
