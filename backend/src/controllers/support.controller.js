import prisma from '../config/prisma.js';

export const createSupportRequest = async (req, res) => {
  try {
    const { orderId, requestType = 'EXCEPTIONAL_ISSUE', reason, description, attachmentUrls } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this order' });
    }

    const request = await prisma.supportRequest.create({
      data: {
        orderId,
        userId: req.user.id,
        requestType,
        reason,
        description,
        attachmentUrls: typeof attachmentUrls === 'object' ? JSON.stringify(attachmentUrls) : attachmentUrls,
        status: 'Submitted',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Exceptional issue support request submitted. Our team will review your photos and evidence.',
      request,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error submitting support request', error: error.message });
  }
};

export const getSupportRequests = async (req, res) => {
  try {
    const isUserRole = req.user.role === 'RETAIL_CUSTOMER' || req.user.role === 'B2B_CUSTOMER';
    const where = isUserRole ? { userId: req.user.id } : {};

    const requests = await prisma.supportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, orderNumber: true, totalAmount: true, orderStatus: true, createdAt: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching support requests', error: error.message });
  }
};

export const updateSupportRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, approvedRemedy, refundAmount, storeCreditAmount, adminNotes } = req.body;

    const request = await prisma.supportRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Support request not found' });
    }

    const updated = await prisma.supportRequest.update({
      where: { id: requestId },
      data: {
        status,
        approvedRemedy,
        refundAmount: refundAmount ? Number(refundAmount) : null,
        storeCreditAmount: storeCreditAmount ? Number(storeCreditAmount) : null,
        adminNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    });

    // If refund exception approved, update order payment status
    if (status === 'Refund Approved' || status === 'Approved Exceptional Case') {
      await prisma.order.update({
        where: { id: request.orderId },
        data: { paymentStatus: 'Refund Exception Approved' },
      });
    }

    return res.json({
      success: true,
      message: `Support request updated to: ${status}`,
      request: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating support request', error: error.message });
  }
};
