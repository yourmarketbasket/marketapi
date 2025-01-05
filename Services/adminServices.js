const StaticImage = require('../models/staticImages'); // Assuming the model is in the 'models' directory
const mongoose = require('mongoose');
const Driver = require('../models/driver');
const EventEmitService = require('./eventService');
const Store = require('../models/stores');
const User = require('../models/user');
const NotificationService = require('./notificationService');
const CronService = require('../Services/cronService')

class AdminServices {
    static async addStaticImages(data, io) {
        try {
            // Destructure incoming data
            const {
                managerId,
                imageUrl,
                category,
                fileSize
            } = data;

            // Validate required fields
            if (!mongoose.Types.ObjectId.isValid(managerId)) {
                return { success: false, message: 'Invalid managerId' };
            }

            if (!['brand', 'categories', 'carousel'].includes(category)) {
                return { success: false, message: `Invalid category: must be one of 'brand', 'categories', 'carousel'` };
            }


            

            // Create new StaticImage instance
            const newStaticImage = new StaticImage({
                managerId,
                imageUrl,
                category,
                fileSize,
            });

            // Save the static image to the database
            const savedImage = await newStaticImage.save();

            // Emit an event via the provided socket.io instance, if available
            if (io) {
                io.emit('newStaticImage', savedImage);
            }

            return { success: true, message: "Upload successful!", data: savedImage };
        } catch (error) {
            console.error('Error adding static image:', error.message);
            return { success: false, data: error.message };
        }
    }
    static async getCarouselStaticImages() {
        try {
            // Fetch all static images from the database
            const images = await StaticImage.find({category: 'carousel'});
    
            // Return the fetched images
            return { success: true, data: images };
        } catch (error) {
            console.error('Error fetching static images:', error.message);
            return { success: false, data: error.message };
        }
    }
   // register driver

   static async registerDeliveryDriver(data, io) {
        try {

            // Extract the data from the incoming registration form
            const { 
                userID,
                storeID,
                vehicleDetails, 
                licenseDetails, 
                emergencyContact
            } = data;
            // ensure no missing data
            
            if (!data.userid || !data.storeid || !data.vehicleDetails.registrationNumber || !data.licenseDetails.licenseNumber) {
                return {
                    success: false,
                    message: 'Required fields are missing: userID, storeID registrationNumber, or licenseNumber.',
                };
            }

            // Check if the driver is already registered using vehicle registration number or contact number
            const existingDriver = await Driver.findOne({
                $or: [
                    { 'vehicleDetails.registrationNumber': vehicleDetails.registrationNumber },
                    { 'licenseDetails.licenseNumber': licenseDetails.licenseNumber },
                    {userID: data.userid}
                ],
            });
            if (existingDriver) {
                return {
                    success: false,
                    message: 'Driver already registered.',
                };
            }
            

            // Prepare the data to insert into the database
            const driverData = {
                userID: data.userid,
                storeID: data.storeid,
                vehicleDetails: {
                    registrationNumber: vehicleDetails.registrationNumber,
                    model: vehicleDetails.model,
                    type: vehicleDetails.type,
                    color: vehicleDetails.color,
                    insuranceNumber: vehicleDetails.insuranceNumber,
                    insuranceExpiry: vehicleDetails.insuranceExpiryDate,
                    insuranceDocument:vehicleDetails.insuranceDocument,
                },
                licenseDetails: {
                    licenseNumber: licenseDetails.licenseNumber,
                    issuingCountry: licenseDetails.issuingCountry,
                    issueDate: licenseDetails.issueDate,
                    expiryDate: licenseDetails.licenseExpiry,
                    licenseDocument: licenseDetails.license
                },
                emergencyContact: {
                    name: emergencyContact.emergencyName,
                    contactNumber: emergencyContact.emergencyContactNumber, // Default to an empty string if no email
                },
                bankDetails: {
                    accountNumber:  "", // Optional
                    bankName: "", // Optional
                    branchCode: "", // Optional
                },
                verificationStatus: {
                    identityVerified: false, // Set to false until verified
                    vehicleVerified: false, // Set to false until verified
                    backgroundCheck: false, // Set to false until background check is done
                },
                ratingsAndFeedback: {
                    averageRating: 5, // Default rating
                    feedback: [] // Empty feedback array initially
                },
                availability: {
                    isAvailable: true, // Default to true if not provided
                    workingHours: { start: '09:00 AM', end: '06:00 PM' }, // Default working hours
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Create a new Driver in the database
            const newDriver = new Driver(driverData);
            await newDriver.save();

            
            EventEmitService.emitEventMethod(io, 'add-driver-event', {userid:data.storeid, message:"New driver added" });

            // Return a success response
            return { success: true, message: 'Driver successfully registered', userid: data.userid };
        } catch (error) {
            console.error('Error registering driver:', error);
            // Emit error event if something goes wrong
            io.emit('registrationError', { message: 'Error registering driver', error: error.message });

            // Return an error response
            return { success:false, message: 'Failed to register driver', error: error.message };
        }
    }
    // get driver details
    static async getStoreDrivers(storeid) {
        try {
            // Fetch drivers associated with the store
            const drivers = await Driver.find({ storeID: storeid});
    
            if (!drivers || drivers.length === 0) {
                throw new Error('No Drivers Found');
            }
    
            // Fetch user details for each driver
            const driverDetails = await Promise.all(
                drivers.map(async (driver) => {
                    const user = await User.findById(driver.userID, {
                        fname: 1,
                        lname: 1,
                        phone: 1,
                        zipcode: 1,
                        city: 1,
                        address: 1,
                        gender: 1,
                        avatar: 1
                    });
    
                    if (!user) {
                        throw new Error(`User not found for userID: ${driver.userID}`);
                    }
    
                    return {
                        ...driver.toObject(), // Include driver details
                        userDetails: user, // Add user details
                    };
                })
            );
    
            return { success: true, data: driverDetails };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    // update driver details
    static async updateDriverInfo(data, io){
        try{
            const updateDriver = await Driver.updateOne({userID: data.userID}, {
                backgroundCheckDocument: data.bgCheckDoc,
                identityVerificationDocument: data.idVerificationDoc,
                vehicleVerificationDocument: data.vehicleVerificationDoc,
                'bankDetails.accountNumber': data.account,
                'bankDetails.bankName': data.bank,
                'verificationStatus.identityVerified': data.identityVerification,
                'verificationStatus.vehicleVerified': data.vehicleVerification,
                'verificationStatus.backgroundCheck': data.backgroundCheck
            });

            if(updateDriver){
                const thisDriver = await Driver.findOne({userID: data.userID});
                if(thisDriver){
                    const notificationData = {
                        userId: data.userID,
                        message: "Driver Account Verification: Your account has been successfully verified.",
                        type: 'success',
                    }
                    NotificationService.addNotification(notificationData, io, 'add-driver-event')
                    
                    return {success: true, data: thisDriver}

                }else{
                    throw new Error("Could not find the driver");
                }
                
            }else{
                throw new Error("could not update driver information");
            }

        }catch(e){
            return {success: false, message: e.message}
        }
    }
    // activate/deactivate driver panel for the driver
    static async activateDriverPanel(userid, io){
        try{
            const update = await User.updateOne({_id: userid}, {
                driver: true
            });

            if(update){
                const data = {
                    userId: userid,
                    message: "Delivery Panel Activated. Your delivery panel has been activated. You can view your active jobs and process deliveries through this panel",
                    type: "success",
                    link: '/dashboard/delivery-panel',
                }
                NotificationService.addNotification(data, io, 'delivery-panel-activated')
                return {success: true, message: "Driver Panel Actived"}
            }

        }catch(e){
            return {success: false, message: e.message}
        }

    }

    // check if delivery panel is active
    static async checkDeliveryPanelIsActive(userid){
        try{
            const active = await User.findOne({_id: userid});
            if(active){
                return {success: true, active: active.driver}
            }else{
                throw new Error("Could not find driver");
            }
        }catch(e){
            return {success: false, message: e.message}
        }
    }
    // get driver by thier userid
    static async getDriverByUserID(userid) {
        try {
            // Fetch the driver info first
            const driver = await Driver.findOne({ userID: userid });
            if (!driver) {
                throw new Error("Driver could not be found.");
            }
    
            // Fetch the corresponding user info
            const user = await User.findOne({ _id: userid });
            if (!user) {
                throw new Error("User could not be found.");
            }
    
            // Combine the results by adding bio info to the driver
            const bioInfo = {
                fname: user.fname,
                lname: user.lname,
                avatar: user.avatar,
                location: user.location,
                phone: user.phone,
                zipcode: user.zipcode

            };
            const driverWithBio = {
                ...driver.toObject(), // Convert Mongoose document to plain object
                bio: bioInfo,
            };
    
            return { success: true, data: driverWithBio };
        } catch (error) {
            console.error("Error in getDriverByUserID:", error);
            return { success: false, message: error.message || "An unexpected error occurred." };
        }
    }
    // update driver details
    static async updateDriverDetails(data, io) {
        try {
            const { action, userID, dates, document, workingHours } = data;

            // Validate the required parameters
            if (!action || !userID) {
                throw new Error("Action and userID are required.");
            }

            // Find the driver by userID
            const driver = await Driver.findOne({ userID });
            if (!driver) {
                throw new Error("Driver not found.");
            }

            // Perform updates based on the action
            switch (action) {
                case 1: // Update working hours
                    if (!workingHours || !workingHours.start || !workingHours.end) {
                        throw new Error("Working hours data is required for action 1.");
                    }

                    driver.availability.workingHours = {
                        start: workingHours.start,
                        end: workingHours.end
                    };
                    break;

                case 2: // Update insurance
                    if (!data.dates || !data.dates.insuranceExpiry || !data.document) {
                        throw new Error("Insurance expiry date and document are required for action 2.");
                    }

                    driver.vehicleDetails.insuranceExpiry = new Date(dates.insuranceExpiry);
                    driver.vehicleDetails.insuranceDocument = document;
                    driver.vehicleDetails.insuranceNumber = data.insuranceNo
                    break;

                case 3: // Update license
                    if (!dates || !dates.issueDate || !dates.expiryDate || !document) {
                        throw new Error("License issue date, expiry date, and document are required for action 3.");
                    }

                    driver.licenseDetails.issueDate = new Date(dates.issueDate);
                    driver.licenseDetails.expiryDate = new Date(dates.expiryDate);
                    driver.licenseDetails.licenseDocument = document;
                    driver.licenseDetails.licenseNumber = data.licenseNo;
                    break;

                default:
                    throw new Error("Invalid action provided.");
            }

            // Update the updatedAt field and save the changes
            driver.updatedAt = new Date();
            await driver.save();
            CronService.checkExpiryDates(io);

            return {
                success: true,
                message: "Driver details updated successfully.",
                driver
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    // add store assistant
    static async addStoreAssistant(data, io) {
        try {
            // Find the user by their `userid`
            const user = await User.findById(data.userid);

            if (!user) {
                throw new Error('User not found');
            }

            // Check if the user is already an assistant for the store
            if (user.assistant.storeid.includes(data.storeid)) {
                return {
                    success: false,
                    message: 'User is already registered as an assistant for this store.',
                };
            }

            // Add the storeid to the assistant's `storeid` array
            user.assistant.storeid.push(data.storeid);

            // Mark the assistant as active
            user.assistant.active = true;

            // Save the updated user document
            await user.save();

            // Use the `NotificationService` to notify the user
            const notificationData = {
                userId: data.userid,
                message: `New Assistant Registration. You have been assigned to store ID: ${data.storeid} as an assistant.`,
                type: 'success', // Custom notification type
                link: `/dashboard/assistants`, // Optional link for more details
            };

            const notificationResponse = await NotificationService.addNotification(notificationData, io, 'new-assistant', data.storeid);

            // Return success response with notification status
            return {
                success: true,
                message: 'Store assistant added successfully.',
                notification: notificationResponse,
            };
        } catch (error) {
            console.error(error);
            return { success: false, message: error.message };
        }
    }
    // get store assistants
    static async getAssistantsForStore(storeId) {
        try {
            // Find users where the specified storeId exists in the assistant.storeid array
            const assistants = await User.find({
                'assistant.storeid': storeId,
                'assistant.active': true, // Optional: Only include active assistants
            }).select('fname active lname phone assistant.rating assistant.packed'); // Select specific fields if necessary

            // Check if assistants were found
            if (assistants.length === 0) {
                return { success: false, message: 'No assistants found for the given store ID.' };
            }

            // Return the list of assistants
            return { success: true, data: assistants };
        } catch (error) {
            console.error(error);
            return { success: false, message: error.message };
        }
    }
    // get the stores assigned to a store assistant
    static getStoresAssignedToAssistant(userid) {
        return new Promise((resolve, reject) => {
            User.findById(userid).select('assistant')
                .then(user => {
                    if (!user) {
                        return resolve({ success: false, message: 'User not found' });
                    }
    
                    // Get the store ids
                    const storePromises = user.assistant.storeid.map(id => {
                        return Store.findById(id).select('storename')
                            .then(store => {
                                if (!store) {
                                    return { success: false, message: "Could not match stores" };
                                }
                                return { storename: store.storename, storeid: id };
                            });
                    });
    
                    // Wait for all store lookups to complete
                    Promise.all(storePromises)
                        .then(storeData => {
                            // Filter out any stores that could not be found
                            const validStores = storeData.filter(store => store.storename);
                            return resolve({ success: true, data: validStores });
                        })
                        .catch(error => {
                            return reject({ success: false, message: error.message });
                        });
                })
                .catch(error => {
                    return reject({ success: false, message: error.message });
                });
        });
    }
    // get store drivers who are unoccupied
    static async getUnoccupiedDrivers(storeId) {
        try {
            // Step 1: Fetch drivers that match the criteria
            const drivers = await Driver.find({
                storeID: storeId,
            }).lean(); // Use `.lean()` for better performance
    
            if (!drivers || drivers.length === 0) {
                return { success: false, data: [] }; // No drivers found
            }
    
            // Step 2: Extract the userIDs from the drivers
            const userIds = drivers.map(driver => driver.userID);
    
            // Step 3: Fetch user details for the extracted userIDs
            const users = await User.find({ _id: { $in: userIds } }).lean();
    
            // Step 4: Combine driver and user details
            const result = drivers.map(driver => {
                const user = users.find(u => u._id.toString() === driver.userID.toString());
                return user
                    ? {
                        driverId: driver._id,
                        userID: driver.userID,
                        fname: user.fname,
                        lname: user.lname,
                        phone: user.phone,
                        avatar: user.avatar,
                        vehicleType: driver.vehicleDetails?.type || '',
                        vehicleModel: driver.vehicleDetails?.model || '',
                        vehicleColor: driver.vehicleDetails?.color || '',
                        vehicleNumber: driver.vehicleDetails?.registrationNumber || '',
                    }
                    : null; // If no user is found for the driver
            }).filter(entry => entry !== null); // Remove any null entries (if user doesn't exist)
    
            return { success: true, data: result };
        } catch (error) {
            console.error(error.message);
            return { success: false, message: error.message };
        }
    }
    // dispatch order
    static async dispatchOrder(data, io) {
        try {
            const { orderId, driverId, storeId, assistantId } = data;
    
            // Step 1: Check if the order is already assigned to a driver who has not declined it
            const existingDriver = await Driver.findOne({
                "assignment.orders": { 
                    $elemMatch: { orderid: orderId, declined: false } 
                }
            });
    
            if (existingDriver) {
                return { 
                    success: false, 
                    message: `Order ${orderId} is already assigned to driver ${existingDriver.userID}, who has not declined it.` 
                };
            }
    
            // Step 2: Find the new driver by userID
            const driver = await Driver.findOne({ userID: driverId });
    
            if (!driver) {
                return { success: false, message: `Driver not found` };
            }
    
            // Step 3: Ensure the `assignment` field is initialized
            if (!driver.assignment || typeof driver.assignment !== 'object') {
                driver.assignment = {
                    assigned: true,
                    orders: [],
                };
            }
    
            // Step 4: Check if the order is already assigned to this driver
            const existingOrder = driver.assignment.orders.find(order => order.orderid === orderId);
            if (existingOrder) {
                return { 
                    success: false, 
                    message: `Order ${orderId} is already assigned to driver ${driverId}.` 
                };
            }
    
            // Step 5: Add the new order to the driver's assignments
            driver.assignment.orders.push({ orderid: orderId, accepted: false, declined: false });
    
            // Step 6: Save the updated driver document
            await driver.save();
    
            // Step 7: Notify all parties
            await NotificationService.addNotification(
                {
                    userId: driverId,
                    message: `ORDER ASSIGNMENT. You have been assigned to deliver order ${orderId}. Please check your dashboard.`,
                    type: "success",
                    link: null,
                },
                io,
                "new-notification",
                driverId, // Receiver is the driver's userID
                [storeId], // Institution is the storeID
                assistantId // Assistant ID
            );
    
            return { success: true, message: `Order ${orderId} assigned to driver ${driverId} successfully` };
        } catch (error) {
            console.error(`Error in dispatchOrder: ${error.message}`);
            return { success: false, message: `An error occurred: ${error.message}` };
        }
    }
    
    
    

    
    
    
    
    
    
    
    
    
    



    
}

module.exports = AdminServices;
