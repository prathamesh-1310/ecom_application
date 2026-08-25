import prisma from '../config/prisma.js';

export const getActivePolicy = async (req, res) => {
  try {
    const { platform = 'ALL' } = req.query;
    let policy = await prisma.policyVersion.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!policy) {
      policy = {
        version: '1.0',
        policyName: 'No Return and No Refund Policy',
        content: `Strict No Return and No Refund Policy:
All sales are final. Piercing products cannot be returned, exchanged, or refunded after purchase due to hygiene and safety reasons, except where required by applicable law or approved by admin as an exceptional case (e.g. material damage before delivery or fulfillment error).`,
      };
    }

    return res.json({ success: true, policy });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching policy', error: error.message });
  }
};
