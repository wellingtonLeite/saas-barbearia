import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getUserTenant } from '@/lib/tenant';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isOwnerOrAdmin = session.user.role === 'OWNER' || session.user.role === 'SUPER_ADMIN';

    let whereClause: any = {
      userId: session.user.id
    };

    if (isOwnerOrAdmin) {
      const tenant = await getUserTenant(session.user.id);
      if (tenant) {
        whereClause = {
          OR: [
            { userId: session.user.id },
            { tenantId: tenant.id }
          ]
        };
      }
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const notificationIds = body.notificationIds || (body.id ? [body.id] : body.ids);

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const isOwnerOrAdmin = session.user.role === 'OWNER' || session.user.role === 'SUPER_ADMIN';

    let whereClause: any = {
      id: { in: notificationIds },
      userId: session.user.id
    };

    if (isOwnerOrAdmin) {
      const tenant = await getUserTenant(session.user.id);
      if (tenant) {
        whereClause = {
          id: { in: notificationIds },
          OR: [
            { userId: session.user.id },
            { tenantId: tenant.id }
          ]
        };
      }
    }

    await db.notification.updateMany({
      where: whereClause,
      data: { is_read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
