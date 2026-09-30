import { PrismaClient, UserRole, TurfType, GroundStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database for BoxKhel...');

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { phone: '+919876543212' },
    update: {},
    create: {
      phone: '+919876543212',
      name: 'Surat BoxKhel Admin',
      role: UserRole.ADMIN,
      city: 'Surat',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });
  console.log('✅ Admin user created:', admin.name);

  // 2. Box Owner User
  const trialEnd = new Date();
  trialEnd.setMonth(trialEnd.getMonth() + 3);

  const owner = await prisma.user.upsert({
    where: { phone: '+919876543211' },
    update: {},
    create: {
      phone: '+919876543211',
      name: 'Rajesh Shah',
      role: UserRole.OWNER,
      city: 'Surat',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      feeFreeUntil: trialEnd,
    },
  });
  console.log('✅ Box Owner created:', owner.name);

  // 3. Player User
  const player = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      phone: '+919876543210',
      name: 'Hardik Patel',
      role: UserRole.PLAYER,
      city: 'Surat',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      playerProfile: {
        create: {
          playingRole: 'ALL_ROUNDER',
          skillLevel: 'ADVANCED',
          homeArea: 'Mota Varachha',
          lat: 21.2384,
          lng: 72.8839,
        },
      },
    },
  });
  console.log('✅ Player user created:', player.name);

  // 4. Ground for Rajesh Shah
  const existingGround = await prisma.ground.findFirst({
    where: { ownerId: owner.id },
  });

  if (!existingGround) {
    const ground = await prisma.ground.create({
      data: {
        ownerId: owner.id,
        name: 'Thunder Box Cricket & Sports Arena',
        description: 'Premium turf with high-density floodlights, 360-degree net, dugouts, clean drinking water & VIP pavilion.',
        phone: '+919876543211',
        addressLine: 'Near VIP Circle, Opp. Royal Arcade, Uttran',
        area: 'Mota Varachha',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '394105',
        lat: 21.2415,
        lng: 72.8862,
        status: GroundStatus.VERIFIED,
        avgRating: 4.8,
        totalReviews: 42,
        amenities: ['Floodlights', 'Dugout', 'Drinking Water', 'Parking', 'Changing Room', 'Live Commentary Box'],
        images: [
          'https://images.unsplash.com/photo-1531415074868-036b1c5f53ec?w=800',
          'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'
        ],
        boxes: {
          create: [
            {
              name: 'Box A (Main Arena)',
              type: TurfType.THREE_SIXTY,
              widthFt: 65,
              heightFt: 110,
              maxPlayers: 16,
              basePrice: 900,
              slotMinutes: 60,
              images: ['https://images.unsplash.com/photo-1531415074868-036b1c5f53ec?w=800'],
              schedules: {
                create: [
                  { dayOfWeek: 0, openTime: '06:00', closeTime: '02:00', priceOverride: 1100 },
                  { dayOfWeek: 1, openTime: '06:00', closeTime: '02:00', priceOverride: 900 },
                  { dayOfWeek: 2, openTime: '06:00', closeTime: '02:00', priceOverride: 900 },
                  { dayOfWeek: 3, openTime: '06:00', closeTime: '02:00', priceOverride: 900 },
                  { dayOfWeek: 4, openTime: '06:00', closeTime: '02:00', priceOverride: 900 },
                  { dayOfWeek: 5, openTime: '06:00', closeTime: '02:00', priceOverride: 1000 },
                  { dayOfWeek: 6, openTime: '06:00', closeTime: '02:00', priceOverride: 1100 },
                ],
              },
            },
            {
              name: 'Box B (Training Turf)',
              type: TurfType.CLOSED,
              widthFt: 50,
              heightFt: 90,
              maxPlayers: 12,
              basePrice: 700,
              slotMinutes: 60,
              images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'],
            },
          ],
        },
        paymentSettings: {
          create: {
            upiId: 'rajeshshah@oksbi',
            upiName: 'Rajesh Box Arena',
            qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=rajeshshah@oksbi%26pn=RajeshBoxArena',
            advanceEnabled: true,
            advanceType: 'PERCENT',
            advanceValue: 30,
          },
        },
      },
    });
    console.log('✅ Created sample ground with boxes:', ground.name);
  }

  console.log('✨ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
