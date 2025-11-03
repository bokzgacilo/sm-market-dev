import { Box, Card, Heading, Link, Stack, Text } from '@chakra-ui/react';
import Head from 'next/head';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';

export default function TermsAndConditions() {
  return (
    <>
      <Head>
        <title>Terms and Conditions</title>
        <meta
          name='description'
          content='Terms and conditions of SM Markets platform'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Stack gap={6} p={4}>
        <CustomBreadcrumb
          data={{ root: 'home', first: 'terms-and-conditions' }}
        />

        <Heading size='3xl' color='#0030FF'>
          Terms and Condition
        </Heading>

        <Card.Root>
          <Card.Body p={0}>
            <Stack gap={6} p={4}>
              <Text>
                The following Terms of Use shall govern your use and access of
                the Platform and of the services therein. The term “Platform”
                pertains to the web and mobile versions of the website jointly
                operated and/or owned by Supervalue, Inc., Sanford Marketing
                Corporation, and Super Shopping Market, Inc., hereby
                collectively referred to as ("SM Markets" or "We" or "Us") at SM
                Markets and the mobile applications made available by us. By
                accessing the Platform and/or using any of the services therein,
                you represent that you are at least 18 years old and agree,
                without limitation or qualification, to be bound by these Terms
                of Use.
              </Text>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Additional Terms and Conditions
                </Heading>
                <Text>
                  SM Market’s Privacy Policy, which can be found here, applies
                  to your use of the Platform and of the services therein.
                  Additional policies, guidelines, and terms and conditions may
                  apply to certain content, features, products, and services
                  available on the Platform, such as but not limited to that for
                  SM Advantage Card. The terms of SM Market’s Privacy Policy and
                  such other policies, guidelines, and terms and conditions in
                  relation thereto are made integral part of these Terms of Use.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Products, Pricing, Content and Specifications
                </Heading>
                <Text>
                  The products and services featured on the Platform
                  (collectively, the "Products") and their contents,
                  specifications, and prices are subject to change at any time,
                  without need of prior notice. The prices of the Products may
                  be different from that in SM Markets physical stores.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Payment
                </Heading>
                <Text fontWeight='bold'>In-store payments:</Text>
                <Text>
                  Currently, we are accepting cash, credit card, or debit card
                  payments in-store under our “Click and Collect” system for
                  items ordered through this Platform for pick-up at our
                  designated pick-up counter in our physical stores.
                </Text>
                <Text fontWeight='bold'>Online payments:</Text>
                <Text>
                  Credit card payments are likewise being honored for purchases
                  made through this Platform for pick-up at our physical stores
                  or delivery to the delivery address you provided. Credit card
                  payments shall be processed by the payment gateway, Paynamics.
                </Text>
                <Text fontWeight='bold'>Cash on Delivery:</Text>
                <Text>
                  You may also pay cash on delivery through our 3rd party
                  logistics courier.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Invoicing
                </Heading>
                <Text>
                  Upon pick-up or delivery of goods, we will provide you the
                  Sales Invoice from our cashier for the goods actually
                  delivered or picked-up.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Shipping, Delivery and Store Pickup Limitations
                </Heading>
                <Text fontWeight='bold'>Delivery:</Text>
                <Text>
                  In selected stores and for a minimal delivery fee, you may opt
                  to have the goods you purchased delivered to the delivery
                  address you specified at checkout. The estimated delivery time
                  you selected is an approximation which may vary depending on
                  third-party logistics and road traffic.
                </Text>
                <Text fontWeight='bold'>Store Pickup:</Text>
                <Text>
                  Product(s) may be picked up at your chosen participating
                  branches of SM Markets. You will receive an order confirmation
                  and tracking number via SMS or email. When collecting the
                  goods, customer or agent should provide the customer name,
                  government-issued ID, tracking number, and authorization
                  letter (if necessary).
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Failure to Pay
                </Heading>
                <Text>
                  If a Customer fails to make any payment using the selected
                  payment method or payment is cancelled for any reason, SM
                  Markets shall cancel the order and/or suspend delivery or deny
                  the collection of the Products from the participating store
                  until payment is made in full.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Return Policy
                </Heading>
                <Text>
                  All returns/exchanges must be done in-store at the
                  participating SM Markets branch from which the delivery was
                  dispatched or picked-up. Only returns and exchanges made in
                  accordance with the Consumer Act of the Philippines and its
                  implementing rules and regulations shall be honored by SM
                  Markets.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Accuracy of Information
                </Heading>
                <Text>
                  SM Markets endeavors to provide an accurate description of the
                  Products, but we do not warrant that such description, color,
                  information, price or other content available on the Site are
                  accurate, complete, reliable, current, or free from error.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Acceptance of Order
                </Heading>
                <Text>
                  While it is our practice to confirm orders by email or SMS,
                  your receipt of a confirmation does not constitute acceptance
                  of your offer. We reserve the right to limit order quantity,
                  cancel orders, and require verification prior to
                  acceptance/shipment.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Use of the Platform
                </Heading>
                <Text>
                  You agree to use the Platform only for lawful purposes,
                  provide accurate information, and maintain confidentiality of
                  your account. You are responsible for all activities under
                  your account.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Intellectual Property
                </Heading>
                <Text>
                  All information and content available on the Platform,
                  including trademarks, logos, software, and text, are protected
                  by local and international laws and may not be used without
                  prior written consent.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Optional Tools and Third Party Links
                </Heading>
                <Text>
                  The Platform may contain third-party tools and links. These
                  are provided solely as a convenience and are not endorsed by
                  SM Markets. Use at your own risk.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  User Information
                </Heading>
                <Text>
                  Any material, information, suggestions, idea, concept, or
                  communication you transmit ("User Communications") are
                  considered non-confidential. SM Markets may use them for
                  commercial or non-commercial purposes. You consent to
                  monitoring but SM Markets is not obligated to respond.
                </Text>
              </Box>

              <Box>
                <Heading as='h2' size='md' color='blue.600'>
                  Additional Sections
                </Heading>
                <Text>
                  Alcohol Listing: Only those 18 and above may purchase.
                </Text>
                <Text>
                  Nexcess Web Hosting: This platform is hosted on Nexcess.Net,
                  LLC. You consent to personal information being processed by
                  Nexcess.
                </Text>
                <Text>
                  Local Laws: Accessing the Site from locations where its
                  contents are illegal is prohibited.
                </Text>
                <Text>
                  Limitations of Liability: SM Markets and affiliates are not
                  liable for interruptions, errors, or damages from use of the
                  Platform.
                </Text>
                <Text>
                  Force Majeure: SM Markets is not liable for losses caused by
                  events beyond control such as natural disasters, war, strikes,
                  or system failures.
                </Text>
                <Text>
                  Revisions to Terms: We may revise these Terms at any time.
                  Users should review periodically.
                </Text>
                <Text>
                  Termination: Accounts may be suspended or terminated at any
                  time. Users are responsible for charges incurred prior to
                  termination.
                </Text>
                <Text>
                  Additional Assistance: For questions, email{' '}
                  <Link
                    href='mailto:support@smsupermarket.com'
                    color='blue.500'
                  >
                    support@smsupermarket.com
                  </Link>
                  .
                </Text>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </>
  );
}
