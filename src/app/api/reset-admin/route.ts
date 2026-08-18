import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const hash = await bcrypt.hash("123456", 10);
  
  let admin = await db.user.findFirst({
    where: { role: "SUPER_ADMIN" }
  });

  if (!admin) {
    admin = await db.user.create({
      data: {
        name: "Super Admin",
        email: "admin@88barber.com",
        password_hash: hash,
        role: "SUPER_ADMIN",
      }
    });
    return NextResponse.json({ message: "Admin criado", email: admin.email, pass: "123456" });
  } else {
    await db.user.update({
      where: { id: admin.id },
      data: { password_hash: hash }
    });
    return NextResponse.json({ message: "Senha do admin resetada", email: admin.email, pass: "123456" });
  }
}
