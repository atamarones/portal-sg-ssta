db = db.getSiblingDB('sg-ssta');

db.users.insertMany([
  {
    email: 'admin@example.com',
    password: '$2b$10$mLSSX6/4L86GJLgnaR.e9etSzBK8bmXrr8Ln1wPQGACd.dkN9e1j6',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'user@example.com',
    password: '$2b$10$mLSSX6/4L86GJLgnaR.e9etSzBK8bmXrr8Ln1wPQGACd.dkN9e1j6',
    firstName: 'Normal',
    lastName: 'User',
    role: 'USER',
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("Usuarios creados correctamente"); 