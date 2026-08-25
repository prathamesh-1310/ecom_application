import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_piercing_ecom_jwt_key_2026');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        b2bApprovalStatus: true,
        companyName: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or disabled' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

export const requireApprovedB2B = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role === 'B2B_CUSTOMER' && req.user.b2bApprovalStatus !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: 'B2B account is pending approval by admin. You will be notified once approved.',
      b2bStatus: req.user.b2bApprovalStatus || 'PENDING',
    });
  }

  next();
};
