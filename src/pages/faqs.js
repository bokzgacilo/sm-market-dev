import { Card, Heading, List, Stack, Text } from '@chakra-ui/react';
import Head from 'next/head';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';

export default function FAQs() {
  return (
    <>
      <Head>
        <title>FAQs - SM Markets Online</title>
        <meta name='description' content='Frequently Asked Questions for SM Markets Online' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Stack gap={4} p={4}>
        <CustomBreadcrumb
          data={{
            root: 'home',
            first: 'faqs',
          }}
        />

        <Heading size='3xl' color='#0030FF'>
          Frequently Asked Questions
        </Heading>

        <Card.Root>
          <Card.Body>
            <Stack spacing={8}>

              {/* General Questions */}
              <Stack spacing={3}>
                <Heading as='h2' size='lg' color='blue.600'>General Questions</Heading>
                <Stack spacing={2}>
                  <Text fontWeight='bold'>1. What is SM Markets Online?</Text>
                  <Text>
                    SM Markets Online is SM Market's online grocery store that lets customers shop easily online. Customers can select items, then pick up in-store or have them delivered via a 3rd party logistics partner. Payment can be made during pick-up, cash on delivery, or online using VISA, Mastercard, JCB, or Amex.
                  </Text>

                  <Text fontWeight='bold'>2. Is SM Markets Online (smmarkets.ph) the official online store for SM Supermarket in the Philippines?</Text>
                  <Text>
                    Yes, smmarkets.ph is the official online store of SM Markets, covering SM Supermarket, SM Hypermarket, and SM Savemore. It allows customers to order online from participating branches.
                  </Text>

                  <Text fontWeight='bold'>3. How do you use SM Markets Online?</Text>
                  <Text>
                    Visit smmarkets.ph, select your preferred store, add items to your cart, sign up or log in, then checkout and confirm your order including delivery/pick-up method and payment.
                  </Text>

                  <Text fontWeight='bold'>4. Is SM Markets Online available in all stores?</Text>
                  <Text>
                    SM Markets Online is available in numerous stores across the Philippines, including SM Supermarket, SM Hypermarket, Savemore, and Mindpro Supermarket branches. (Refer to your store list for details.)
                  </Text>

                  <Text fontWeight='bold'>5. Can I use this anywhere in the Philippines?</Text>
                  <Text>
                    You can order from anywhere in the Philippines, but pick-up and delivery are limited to participating stores and delivery within 5 km from the selected store.
                  </Text>

                  <Text fontWeight='bold'>6. What type of items do you carry?</Text>
                  <Text>
                    We currently offer top-selling grocery items optimized for online shopping. More products will be added in the future.
                  </Text>

                  <Text fontWeight='bold'>7. If we have further questions about a product, who should we ask?</Text>
                  <Text>
                    The website lists only the product name, picture, and variants. Please contact the item's brand or manufacturer for more details.
                  </Text>

                  <Text fontWeight='bold'>8. Are the products in smmarkets.ph stores different from the ones online?</Text>
                  <Text>
                    Products listed online are generally the same as in-store. Not all store products are online yet, but we are continuously adding more.
                  </Text>
                </Stack>
              </Stack>

              {/* Ordering */}
              <Stack spacing={3}>
                <Heading as='h2' size='lg' color='blue.600'>Ordering</Heading>
                <Stack spacing={2}>
                  <Text fontWeight='bold'>1. Do you offer Bulk Order? Or do you have a maximum or minimum order?</Text>
                  <Text>
                    Most items have a maximum order of 20 pieces, though some may be lower due to availability. There is no minimum or maximum peso amount.
                  </Text>

                  <Text fontWeight='bold'>2. What if I decide not to buy some items in my order?</Text>
                  <Text>
                    For pick-up, items can be removed upon collection. For deliveries, see the Returns & Refunds section or contact support.
                  </Text>

                  <Text fontWeight='bold'>3. Will orders be cancelled if the customer doesn’t pick them up?</Text>
                  <Text>
                    Orders may be canceled if no one is available to pick up the order at the scheduled time. Please select a suitable time slot.
                  </Text>

                  <Text fontWeight='bold'>4. What bag will you use for my groceries?</Text>
                  <Text>
                    Pick-up items are packed at the store; you may specify packaging preferences subject to store policies. Delivery items may be packed in cartons or plastic bags depending on local policies.
                  </Text>

                  <Text fontWeight='bold'>5. Can someone else pay and pick-up an order for me?</Text>
                  <Text>
                    Yes, indicate their full name in order comments and ensure they present an ID at pick-up.
                  </Text>

                  <Text fontWeight='bold'>6. What if the item I ordered is no longer in stock?</Text>
                  <Text>
                    You may be contacted for possible replacements. If no response is received, the order will proceed without missing items.
                  </Text>

                  <Text fontWeight='bold'>7. Can I view my previous orders?</Text>
                  <Text>
                    Yes, log in and check your order history in the "my account" section.
                  </Text>

                  <Text fontWeight='bold'>8. Can I quickly reorder the same items as my previous order?</Text>
                  <Text>
                    Yes, from your order history as long as all items are in stock and not on hold.
                  </Text>

                  <Text fontWeight='bold'>9. Can I save items to order in the future?</Text>
                  <Text>
                    Use the "add shopping list" feature in your account.
                  </Text>

                  <Text fontWeight='bold'>10. How do I search for an item?</Text>
                  <Text>
                    Use the search bar at the top of the website.
                  </Text>

                  <Text fontWeight='bold'>11. Are all orders final?</Text>
                  <Text>
                    Orders are subject to stock availability and approval. SM Markets may cancel orders at its discretion.
                  </Text>

                  <Text fontWeight='bold'>12. How do I change or cancel my order?</Text>
                  <Text>
                    Changes before checkout can be made in your cart. After placing an order, email support@smmarkets.ph. Changes/cancellations are subject to store discretion and may incur price adjustments.
                  </Text>
                </Stack>
              </Stack>

              {/* Shipping & Delivery */}
              <Stack spacing={3}>
                <Heading as='h2' size='lg' color='blue.600'>Shipping & Delivery</Heading>
                <Stack spacing={2}>
                  <Text fontWeight='bold'>1. How much is the delivery fee?</Text>
                  <Text>Flat rate of 150 pesos, 5 km limit from selected store.</Text>

                  <Text fontWeight='bold'>2. What areas or cities do you offer delivery?</Text>
                  <Text>Delivery is available within 5 km of participating stores in Metro Manila. Use "search nearby stores" to see options.</Text>

                  <Text fontWeight='bold'>3. How soon can I get my order?</Text>
                  <Text>
                    Earliest pick-up is 2 hours from now; earliest delivery is 3 hours from now. Slots depend on store capacity.
                  </Text>

                  <Text fontWeight='bold'>4. Can I track my order?</Text>
                  <Text>
                    Check your order history and use the Grab Express tracking link provided in order details.
                  </Text>

                  <Text fontWeight='bold'>5. Can I change my delivery address after placing an order?</Text>
                  <Text>
                    Changes must be requested via email; approval is subject to store discretion and may incur charges.
                  </Text>

                  <Text fontWeight='bold'>6. What happens if I am not home when my order arrives?</Text>
                  <Text>
                    Select a time slot when someone can receive your order. Otherwise, orders may be canceled and fees applied.
                  </Text>

                  <Text fontWeight='bold'>7. What should I do if my order hasn't arrived?</Text>
                  <Text>Email support@smmarkets.ph to report the incident for investigation.</Text>
                </Stack>
              </Stack>

              {/* Pricing */}
              <Stack spacing={3}>
                <Heading as='h2' size='lg' color='blue.600'>Pricing</Heading>
                <Stack spacing={2}>
                  <Text fontWeight='bold'>1. Are prices the same as in the store?</Text>
                  <Text>Yes, except for special online items, promos, or errors. In-store prices on the day of pick-up/delivery prevail.</Text>

                  <Text fontWeight='bold'>2. What if I purchased an item on promo but pick up after it ends?</Text>
                  <Text>Prices, inventory, and promos are based on the day of pick-up/delivery unless otherwise specified.</Text>
                </Stack>
              </Stack>

              {/* Returns & Refunds */}
              <Stack spacing={3}>
                <Heading as='h2' size='lg' color='blue.600'>Returns & Refunds</Heading>
                <Stack spacing={2}>
                  <Text fontWeight='bold'>1. How do I return an item?</Text>
                  <Text>Bring the item with the official receipt to the store where it was picked up. Returns are subject to store policy.</Text>

                  <Text fontWeight='bold'>2. Can I change the item I ordered and have it replaced in other stores?</Text>
                  <Text>No, replacements must be made at the store of purchase.</Text>

                  <Text fontWeight='bold'>3. The item I received was damaged, wrong, or missing. What should I do?</Text>
                  <Text>
                    Take a photo of the receipt and items, and ask the rider to return the items for adjustment. For post-delivery issues, email support@smmarkets.ph.
                  </Text>
                </Stack>
              </Stack>

              {/* Payment, SMAC Points & Discounts */}
              <Stack spacing={3}>
                <Heading as='h2' size='lg' color='blue.600'>Payment, SMAC Points & Discounts</Heading>
                <Stack spacing={2}>
                  <Text fontWeight='bold'>1. What are the payment methods?</Text>
                  <Text>
                    In-store: Cash, credit/debit card, GCash, PayMaya, SM GC.<br/>
                    Online: VISA, Mastercard, JCB, Amex.<br/>
                    Delivery: Cash only.
                  </Text>

                  <Text fontWeight='bold'>2. What to do if my payment was declined?</Text>
                  <Text>Email support@smmarkets.ph. Reorder using a valid payment method if declined.</Text>

                  <Text fontWeight='bold'>3. Can I use my SMAC points?</Text>
                  <Text>Yes, in-store and by entering your SMAC number online. Not applicable for other payment/delivery methods.</Text>

                  <Text fontWeight='bold'>4. Can I avail PWD or Senior Citizen discounts?</Text>
                  <Text>
                    In-store: Yes, present valid ID; items must be rescanned. Not applicable for delivery or other payment methods.
                  </Text>

                  <Text fontWeight='bold'>5. Can I use more than one discount code?</Text>
                  <Text>Only one discount code per transaction.</Text>
                </Stack>
              </Stack>

              {/* Customer Support */}
              <Stack spacing={3}>
                <Heading as='h2' size='md' color='blue.600'>Customer Support</Heading>
                <Stack spacing={2}>
                  <Text fontWeight='bold'>1. What time is online customer support available?</Text>
                  <Text>Email support is available 9 AM – 5:30 PM on weekdays, excluding holidays. Chat support is currently unavailable.</Text>
                </Stack>
              </Stack>

            </Stack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </>
  );
}
