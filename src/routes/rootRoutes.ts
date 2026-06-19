import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from "./user"
import kycRoutes from "./kyc";
import accountRoutes from "./account";
import transactionRoutes from "./transaction";
import paymentRoutes from "./payment";

const rootRoutes = Router();

rootRoutes.get('/', (req, res) => {
    res.send('Welcome to the root route!');
});

rootRoutes.use('/auth', authRoutes);
rootRoutes.use('/user', userRoutes);
rootRoutes.use('/kyc', kycRoutes);
rootRoutes.use('/account', accountRoutes);
rootRoutes.use("/transaction", transactionRoutes);
rootRoutes.use("/payment", paymentRoutes);

export default rootRoutes;