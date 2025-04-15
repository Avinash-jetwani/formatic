"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@formatic.com' },
    });
    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                email: 'admin@formatic.com',
                password: await bcrypt.hash('Admin123!', 10),
                name: 'Super Admin',
                role: client_1.Role.SUPER_ADMIN,
            },
        });
        console.log('Super admin created');
    }
    else {
        console.log('Super admin already exists');
    }
    const existingClient = await prisma.user.findUnique({
        where: { email: 'client@example.com' },
    });
    if (!existingClient) {
        await prisma.user.create({
            data: {
                email: 'client@example.com',
                password: await bcrypt.hash('Client123!', 10),
                name: 'Test Client',
                role: client_1.Role.CLIENT,
            },
        });
        console.log('Test client created');
    }
    else {
        console.log('Test client already exists');
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map