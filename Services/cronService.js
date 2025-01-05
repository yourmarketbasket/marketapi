const cron = require('node-cron');
const Driver = require('../models/driver'); // Driver model
const EventLog = require('../models/eventLogs'); // EventLog model
const NotificationService = require('./notificationService'); // Assuming NotificationService is in the same directory
const User = require('../models/user');

class CronService {
  constructor() {}

  startCronJob(io) {
        /*
    // setInterval(async () => {
    //     console.log('Running the cron job to check expiry dates (test run every 30 seconds)...');
    //     await this.checkExpiryDates(io);
    //   }, 30 * 1000);*/

    cron.schedule('* * * * * *', async () => {
      await this.checkDispatchRequestExpiry(io);
    });
    
    


    cron.schedule('0 */6 * * *', async () => {
      await this.checkExpiryDates(io);
    });
  }

  // Check expiry dates and notify drivers if necessary
  async checkExpiryDates(io) {
    try {
      const currentDate = new Date();

      // Fetch all drivers
      const drivers = await Driver.find();

      for (const driver of drivers) {
        const { licenseDetails, vehicleDetails } = driver;

        // Check if license or insurance is expired
        const isLicenseExpired =
          licenseDetails && licenseDetails.expiryDate < currentDate;
        const isInsuranceExpired =
          vehicleDetails &&
          vehicleDetails.insuranceExpiry &&
          vehicleDetails.insuranceExpiry < currentDate;

        // Determine if the driver should be active based on document status
        const isActive = !(isLicenseExpired || isInsuranceExpired);

        // Ensure the `active` field exists and is up to date
        if (driver.active === undefined || driver.active === '') {
          console.log("Driver has no active status");
          // Add the `active` field if it's missing
          await this.logEvent({
            type: 'system',
            message: `Driver with ID: ${driver._id} did not have an 'active' field. Adding it now and setting to ${isActive}.`,
            meta: {
              driverId: driver._id,
              licenseExpiry: licenseDetails?.expiryDate,
              insuranceExpiry: vehicleDetails?.insuranceExpiry,
              activeStatus: isActive,
            },
          });

          driver.active = isActive; // Add the field
          driver.updatedAt = currentDate; // Update timestamp
          await driver.save(); // Save the driver

          // Send notification if the driver is inactive due to expired documents
          if (!isActive) {
            await NotificationService.addNotification(
              {
                userId: driver.userID,
                message: 'Your license or insurance has expired. Your account is now inactive.',
                type: 'expiry',
              },
              io
            );
          }
        } else if (driver.active !== isActive) {
          // Update the `active` field if the value needs to change
          await this.logEvent({
            type: 'system',
            message: `Driver with ID: ${driver._id} is now ${
              isActive ? 'active' : 'inactive'
            } due to ${
              isLicenseExpired ? 'expired license' : 'expired insurance'
            }.`,
            meta: {
              driverId: driver._id,
              licenseExpiry: licenseDetails?.expiryDate,
              insuranceExpiry: vehicleDetails?.insuranceExpiry,
              previousActiveStatus: driver.active,
              newActiveStatus: isActive,
            },
          });

          // Send notification if the driver is inactive due to expired documents
          if (!isActive) {
            await NotificationService.addNotification(
              {
                userId: driver.userID,
                message: 'Document Expiry. Your license or insurance has expired. Your account is now inactive.',
                type: 'expiry',
              },
              io
            );
          }

          driver.active = isActive; // Update the field
          driver.updatedAt = currentDate; // Update timestamp
          await driver.save(); // Save the driver

          
        } else {
          // Log that the driver remains unchanged
          await this.logEvent({
            type: 'system',
            message: `Driver with ID: ${driver._id} remains ${
              driver.active ? 'active' : 'inactive'
            }.`,
            meta: {
              driverId: driver._id,
              licenseExpiry: licenseDetails?.expiryDate,
              insuranceExpiry: vehicleDetails?.insuranceExpiry,
            },
          });
        }
      }

      // Log the completion of the check
      await this.logEvent({
        type: 'system',
        message: 'Driver document expiry check completed successfully.',
      });
    } catch (error) {
      // Log any errors
      await this.logEvent({
        type: 'error',
        message: 'Error in checking expiry dates.',
        meta: { error: error.message, stack: error.stack },
      });
    }
  }

  // check expiry the dispatch request expired before driver accepts it, mark as expired and send notification
  async checkDispatchRequestExpiry(io) {
    try {
      const currentDate = new Date(); // Current timestamp
  
      // Fetch all drivers with assignments
      const drivers = await Driver.find({ "assignment.orders": { $exists: true, $not: { $size: 0 } } });
  
      for (const driver of drivers) {
        const orders = driver.assignment.orders;
  
        for (const order of orders) {
          // Calculate the time elapsed since the order was placed (in seconds and minutes)
          const elapsedTimeSeconds = (currentDate - order.time) / 1000; // Convert to seconds
          const elapsedTimeMinutes = Math.floor(elapsedTimeSeconds / 60); // Convert to full minutes
  
          // Check if the order is not accepted or declined, and expiry is not true
          if (!order.accepted && !order.declined && !order.expired) {
            // Send notification at 5, 10, or 15 minutes
            if ([0,5, 10, 15].includes(elapsedTimeMinutes)) {
              
              // Send notification to driver
              const notificationResponse = await NotificationService.addNotification(
                {
                  userId: driver.userID,
                  message: elapsedTimeMinutes === 15 
                    ? `Dispatch Request Expired. Order with ID: ${order.orderid} has expired.`
                    : `Dispatch Request Expires in ${(15 - elapsedTimeMinutes)} minutes. Order with ID: ${order.orderid} is approaching expiry.`,

                  type: 'error',
                  link: `/orders/${order.orderid}`, // Optional link to order details
                },
                io,
                'new-notification', // Event name
                driver.userID // Receiver
              );
              
            }
  
            // If more than 15 minutes have passed, mark the order as expired
            if (elapsedTimeMinutes > 15) {
              // Mark the order as expired if not already marked
              if (!order.expired) {
                order.expired = true;
  
                // Log the event for order expiration
                await this.logEvent({
                  type: 'system',
                  message: `Order with ID: ${order.orderid} has expired for driver: ${driver._id}.`,
                  meta: {
                    driverId: driver._id,
                    orderId: order.orderid,
                    timePlaced: order.time,
                    expiry: order.expiry,
                    elapsedTime: elapsedTimeSeconds,
                  },
                });
  
              }
            }
          } 
        }
  
        // Save changes to the driver document if any orders were updated
        driver.updatedAt = currentDate;
        await driver.save();
      }
  
      // Log the completion of the expiry check
      await this.logEvent({
        type: 'system',
        message: 'Dispatch request expiry check completed successfully.',
      });
    } catch (error) {
      // Log any errors
      await this.logEvent({
        type: 'error',
        message: 'Error in checking dispatch request expiry.',
        meta: { error: error.message, stack: error.stack },
      });
    }
  }
  
  
  
  
  
  
  

      // Fetch all dispatch requests


  // Helper method to log events
  async logEvent({ type, ip, route, method, statusCode, message, userId, meta }) {
    try {
      const eventLog = new EventLog({
        type,
        ip,
        route,
        method,
        statusCode,
        message,
        userId,
        meta,
      });

      await eventLog.save();
    } catch (error) {
      console.error('Error saving event log:', error);
    }
  }
}

module.exports = new CronService();
