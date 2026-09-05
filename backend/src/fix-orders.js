import prisma from './config/prisma.js';

async function fix() {
  const user = await prisma.user.findUnique({ where: { email: 'elena@example.com' } });
  if (user) {
    const res = await prisma.order.updateMany({
      where: { userId: null },
      data: { userId: user.id },
    });
    console.log(`Successfully linked ${res.count} existing orders to user ${user.name} (${user.email})`);
  }
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
