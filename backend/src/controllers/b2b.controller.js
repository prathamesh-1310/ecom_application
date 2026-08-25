import prisma from '../config/prisma.js';

export const getB2BApplications = async (req, res) => {
  try {
    const applications = await prisma.b2BApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            b2bApprovalStatus: true,
            companyName: true,
            gstNumber: true,
            businessType: true,
            expectedVolume: true,
            addresses: true,
          },
        },
      },
    });

    return res.json({ success: true, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching B2B applications', error: error.message });
  }
};

export const updateB2BStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminNotes } = req.body; // APPROVED, REJECTED, SUSPENDED

    const application = await prisma.b2BApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApp = await prisma.b2BApplication.update({
      where: { id: applicationId },
      data: {
        status,
        adminNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    });

    // Update user status
    await prisma.user.update({
      where: { id: application.userId },
      data: {
        b2bApprovalStatus: status,
      },
    });

    return res.json({
      success: true,
      message: `B2B application updated to status: ${status}`,
      application: updatedApp,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating B2B application status', error: error.message });
  }
};
