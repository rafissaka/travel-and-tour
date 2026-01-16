import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        // Fetch user from auth
        const { data: { user } } = await supabase.auth.getUser();

        // Check authentication and role
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email || '' },
        });

        if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Fetch Key Stats
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
        const totalApplications = await prisma.application.count();
        const activeEvents = await prisma.event.count({ where: { isActive: true, status: 'UPCOMING' } });
        const totalGalleryImages = await prisma.galleryImage.count(); // Using as proxy for "engagement" metric if revenue is 0

        // 2. Fetch User Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

        // Aggregate users created per month
        const usersCreated = await prisma.user.groupBy({
            by: ['createdAt'],
            where: {
                role: 'USER',
                createdAt: { gte: sixMonthsAgo }
            },
        });

        // Process user growth data
        // Note: Prisma groupBy on date is granular. We map to Month names in JS.
        // For large datasets, use raw SQL. For now, JS processing is fine.
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const userGrowthMap = new Map<string, number>();

        // Initialize last 6 months in map
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = monthNames[d.getMonth()];
            userGrowthMap.set(label, 0);
        }

        usersCreated.forEach(u => {
            const month = monthNames[new Date(u.createdAt).getMonth()];
            if (userGrowthMap.has(month)) {
                userGrowthMap.set(month, userGrowthMap.get(month)! + 1);
            }
        });

        const userGrowthData = Array.from(userGrowthMap.entries()).map(([name, users]) => ({ name, users }));


        // 3. Fetch Application Trends (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const appsCreated = await prisma.application.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: sevenDaysAgo }
            }
        });

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const appTrendMap = new Map<string, number>();

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = dayNames[d.getDay()];
            appTrendMap.set(label, 0);
        }

        appsCreated.forEach(app => {
            const day = dayNames[new Date(app.createdAt).getDay()];
            if (appTrendMap.has(day)) {
                appTrendMap.set(day, appTrendMap.get(day)! + 1);
            }
        });

        const applicationTrendsData = Array.from(appTrendMap.entries()).map(([name, apps]) => ({ name, apps }));

        return NextResponse.json({
            stats: {
                totalUsers,
                totalApplications,
                activeEvents,
                totalGalleryImages
            },
            charts: {
                userGrowth: userGrowthData,
                applicationTrends: applicationTrendsData
            }
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
