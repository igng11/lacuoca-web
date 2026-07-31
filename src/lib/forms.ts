export const formString = (data: FormData, key: string) => String(data.get(key) ?? "");
export const formBoolean = (data: FormData, key: string) => data.get(key) === "on";

export function firstError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Revisá los datos ingresados.";
}
