import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/config/db.js';
import { authenticateToken } from '../src/middlewares/authMiddleware.js';
import { createMenuItem, updateMenuItem } from '../src/controllers/menuController.js';
import { deactivateStaff } from '../src/controllers/userController.js';
import { createOrder, trackOrder } from '../src/controllers/orderController.js';
import { register } from '../src/controllers/authController.js';

process.env.JWT_SECRET = 'regression-test-secret';
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const original = { userFind: prisma.user.findUnique, menuCreate: prisma.menuItem.create, menuUpdate: prisma.menuItem.updateMany, userUpdate: prisma.user.update, menuFind: prisma.menuItem.findMany, orderCreate: prisma.order.create, orderFind: prisma.order.findUnique, inviteFind: prisma.invite.findUnique, transaction: prisma.$transaction };
after(async () => {
  prisma.user.findUnique = original.userFind;
  prisma.menuItem.create = original.menuCreate;
  prisma.menuItem.updateMany = original.menuUpdate;
  prisma.user.update = original.userUpdate;
  prisma.menuItem.findMany = original.menuFind;
  prisma.order.create = original.orderCreate;
  prisma.order.findUnique = original.orderFind;
  prisma.invite.findUnique = original.inviteFind;
  prisma.$transaction = original.transaction;
  await prisma.$disconnect();
});

test('inactive accounts and tracking credentials cannot authenticate as staff', async () => {
  prisma.user.findUnique = async () => ({ id: 1, isActive: false });
  const res = response();
  await authenticateToken({ headers: { authorization: `Bearer ${jwt.sign({ id: 1 }, process.env.JWT_SECRET)}` } }, res, () => assert.fail('inactive user accepted'));
  assert.equal(res.statusCode, 401);
  const tracking = response();
  await authenticateToken({ headers: { authorization: `Bearer ${jwt.sign({ purpose: 'order-tracking', orderId: 1 }, process.env.JWT_SECRET)}` } }, tracking, () => assert.fail('tracking token accepted'));
  assert.equal(tracking.statusCode, 401);
});

test('authentication uses current account role and restaurant', async () => {
  prisma.user.findUnique = async () => ({ id: 1, role: 'staff', restaurantId: 5, isActive: true });
  const req = { headers: { authorization: `Bearer ${jwt.sign({ id: 1, role: 'admin', restaurantId: 9 }, process.env.JWT_SECRET)}` } };
  let accepted = false;
  await authenticateToken(req, response(), () => { accepted = true; });
  assert.ok(accepted);
  assert.equal(req.user.restaurantId, 5);
  assert.equal(req.user.role, 'staff');
});

test('menu create and multipart update retain account restaurant and image', async () => {
  prisma.menuItem.create = async ({ data }) => { assert.equal(data.restaurantId, 5); return data; };
  const res = response();
  await createMenuItem({ user: { restaurantId: 5 }, body: { name: 'Burger', price: '12', category: 'Burgers' } }, res);
  assert.equal(res.statusCode, 201);
  prisma.menuItem.updateMany = async ({ where, data }) => {
    assert.equal(where.restaurantId, 5);
    assert.equal(data.imageUrl, '/uploads/menu/new.png');
    return { count: 1 };
  };
  const updated = response();
  await updateMenuItem({ user: { restaurantId: 5 }, params: { id: '1' }, body: { price: '15' }, file: { filename: 'new.png' } }, updated);
  assert.equal(updated.statusCode, 200);
});

test('deactivation targets only staff in the admin restaurant and revokes sockets', async () => {
  prisma.user.update = async ({ where, select }) => {
    assert.deepEqual(where, { id: 2, restaurantId: 5, role: 'staff' });
    assert.equal(select.password, undefined);
    return { id: 2, isActive: false };
  };
  let disconnected = false;
  const res = response();
  await deactivateStaff({ user: { restaurantId: 5 }, params: { id: '2' }, app: { get: () => ({ in: room => { assert.equal(room, 'user_2'); return { disconnectSockets: () => { disconnected = true; } }; } }) } }, res);
  assert.equal(res.statusCode, 200);
  assert.ok(disconnected);
});

test('orders broadcast to the restaurant and tracking tokens are scoped to one order', async () => {
  prisma.menuItem.findMany = async () => [{ id: 1, price: 12, isAvailable: true }];
  prisma.order.create = async () => ({ id: 7, status: 'PENDING' });
  const res = response();
  let room;
  await createOrder({ body: { restaurantId: '5', items: [{ menuItemId: 1, quantity: 2 }] }, app: { get: () => ({ to: value => { room = value; return { emit: () => {} }; } }) } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(room, 'restaurant_5');
  const claims = jwt.verify(res.body.trackingToken, process.env.JWT_SECRET);
  assert.equal(claims.orderId, 7);
  const denied = response();
  await trackOrder({ params: { id: '8' }, query: { token: res.body.trackingToken } }, denied);
  assert.equal(denied.statusCode, 401);
  prisma.order.findUnique = async ({ where, select }) => { assert.equal(where.id, 7); assert.equal(select.user, undefined); return { id: 7, status: 'PREPARING' }; };
  const tracked = response();
  await trackOrder({ params: { id: '7' }, query: { token: res.body.trackingToken } }, tracked);
  assert.equal(tracked.body.status, 'PREPARING');
});

test('registration rejects a token already claimed by a competing request', async () => {
  prisma.invite.findUnique = async () => ({ isUsed: false });
  prisma.user.findUnique = async () => null;
  prisma.$transaction = async callback => callback({ invite: { updateMany: async ({ where }) => { assert.equal(where.isUsed, false); return { count: 0 }; } }, user: { create: () => assert.fail('reused invite created an account') } });
  const res = response();
  await register({ body: { name: 'Owner', email: 'owner@example.test', password: 'StrongPass1!', token: 'claimed-token' } }, res);
  assert.equal(res.statusCode, 403);
});
