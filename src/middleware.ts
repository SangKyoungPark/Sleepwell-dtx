import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // API 라우트는 미들웨어 건너뛰기
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
