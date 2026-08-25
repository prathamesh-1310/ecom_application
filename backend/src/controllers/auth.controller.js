import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const registerRetail = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: 'RETAIL_CUSTOMER',
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecret_piercing_ecom_jwt_key_2026',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

export const registerB2B = async (req, res) => {
  try {
    const { name, email, password, phone, companyName, gstNumber, businessType, expectedVolume, address } = req.body;

    if (!email || !password || !name || !companyName || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, company name, and business type are required for wholesale registration',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: 'B2B_CUSTOMER',
        b2bApprovalStatus: 'PENDING',
        companyName,
        gstNumber,
        businessType,
        expectedVolume,
      },
    });

    // Record B2B application
    await prisma.b2BApplication.create({
      data: {
        userId: user.id,
        companyName,
        gstNumber,
        businessType,
        expectedVolume,
        status: 'PENDING',
      },
    });

    if (address) {
      await prisma.address.create({
        data: {
          userId: user.id,
          addressType: 'Office',
          fullName: name,
          phone: phone || '',
          addressLine1: address.addressLine1 || '',
          addressLine2: address.addressLine2 || '',
          city: address.city || '',
          state: address.state || '',
          country: address.country || 'India',
          postalCode: address.postalCode || '',
          isDefault: true,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecret_piercing_ecom_jwt_key_2026',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'B2B Wholesale registration submitted successfully. Account pending admin approval.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        b2bApprovalStatus: user.b2bApprovalStatus,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'B2B registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecret_piercing_ecom_jwt_key_2026',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        b2bApprovalStatus: user.b2bApprovalStatus,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        b2bApprovalStatus: true,
        companyName: true,
        gstNumber: true,
        businessType: true,
        expectedVolume: true,
        addresses: true,
        createdAt: true,
      },
    });

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' },
    });

    return res.json({ success: true, addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching addresses', error: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { addressType, fullName, phone, addressLine1, addressLine2, city, state, country, postalCode, isDefault } =
      req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        addressType: addressType || 'Home',
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        country: country || 'India',
        postalCode,
        isDefault: isDefault || false,
      },
    });

    return res.status(201).json({ success: true, message: 'Address saved successfully', address });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error saving address', error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    await prisma.address.deleteMany({
      where: { id: addressId, userId: req.user.id },
    });
    return res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting address', error: error.message });
  }
};
