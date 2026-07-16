// Middleware raíz: refresca la sesión y protege /admin y /cuenta (excepto las
// páginas de acceso público de la cuenta). La comprobación fina de rol (staff)
// se hace en el layout de /admin (Server Component) + RLS en la base.
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ACCOUNT_PUBLIC = new Set([
  "/cuenta/iniciar-sesion",
  "/cuenta/registro",
  "/cuenta/recuperar",
  "/cuenta/restablecer",
]);

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const needsAuth =
    path.startsWith("/admin") ||
    (path.startsWith("/cuenta") && !ACCOUNT_PUBLIC.has(path));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta/iniciar-sesion";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Excluye estáticos y archivos con extensión (media, imágenes, etc.).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|media/|icon|.*\\.(?:svg|png|jpg|jpeg|webp|gif|mp4|ico|txt|xml)$).*)",
  ],
};
