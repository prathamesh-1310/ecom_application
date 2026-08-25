import prisma from '../config/prisma.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Retail stats
    const retailOrders = await prisma.order.findMany({ where: { platform: 'RETAIL' } });
    const retailRevenue = retailOrders.reduce((sum, o) => (o.paymentStatus === 'Paid' ? sum + o.totalAmount : sum), 0);
    const retailPendingOrders = retailOrders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;

    // B2B stats
    const b2bOrders = await prisma.order.findMany({ where: { platform: 'B2B' } });
    const b2bRevenue = b2bOrders.reduce((sum, o) => (o.paymentStatus === 'Paid' ? sum + o.totalAmount : sum), 0);
    const b2bPendingOrders = b2bOrders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;

    // Customers stats
    const retailCustomersCount = await prisma.user.count({ where: { role: 'RETAIL_CUSTOMER' } });
    const approvedB2bCustomersCount = await prisma.user.count({
      where: { role: 'B2B_CUSTOMER', b2bApprovalStatus: 'APPROVED' },
    });
    const pendingB2bApplicationsCount = await prisma.b2BApplication.count({ where: { status: 'PENDING' } });

    // Products & Stock stats
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({ where: { stock: { lte: 10 } } });

    // Exceptional support stats
    const openSupportRequests = await prisma.supportRequest.count({
      where: { status: { in: ['Submitted', 'Under Review', 'Additional Info Required'] } },
    });
    const approvedRefundExceptions = await prisma.supportRequest.count({
      where: { status: { in: ['Refund Approved', 'Approved Exceptional Case'] } },
    });

    return res.json({
      success: true,
      stats: {
        retail: {
          ordersCount: retailOrders.length,
          revenue: retailRevenue,
          pendingOrders: retailPendingOrders,
          customersCount: retailCustomersCount,
        },
        b2b: {
          ordersCount: b2bOrders.length,
          revenue: b2bRevenue,
          pendingOrders: b2bPendingOrders,
          approvedCustomers: approvedB2bCustomersCount,
          pendingApplications: pendingB2bApplicationsCount,
        },
        catalog: {
          totalProducts,
          lowStockProducts,
        },
        support: {
          openSupportRequests,
          approvedRefundExceptions,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching admin dashboard statistics', error: error.message });
  }
};
