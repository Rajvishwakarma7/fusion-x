import { stripe } from "../../config/stripe.config";
import users from "../../models/user.model";


export const getStripeCustomerId = async (userId: string): Promise<string> => {
  try {
    const user = await users.findById(userId).lean();

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const stripeCustomer = await stripe.customers.create({
      email: user?.email || undefined,
      metadata: {
        userId,
      },
    });

    await users.findOneAndUpdate(
      // eslint-disable-next-line @typescript-eslint/naming-convention
      {_id:userId},
      {
        $set: {
          stripeCustomerId: stripeCustomer.id,
        },
      },
      {new:true},
    );

    return stripeCustomer.id;

  } catch (error) {
    console.log('error in getStripeCustomerId :>> ', error);
    throw error;
  }
};
