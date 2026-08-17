export const formString = (data: FormData, key: string) => String(data.get(key) ?? "");
export const formBoolean = (data: FormData, key: string) => data.get(key) === "on";
// Un valor por línea en vez de separado por comas: algunos sabores reales
// llevan coma adentro del nombre (ej. "Ricota, jamón y mozzarella").
export const formLines = (data: FormData, key: string) =>
  String(data.get(key) ?? "").split("\n").map((line) => line.trim()).filter(Boolean);

export function firstError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Revisá los datos ingresados.";
}
