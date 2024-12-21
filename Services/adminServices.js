const StaticImage = require('../models/staticImages'); // Assuming the model is in the 'models' directory
const mongoose = require('mongoose');
const Driver = require('../models/driver');
const EventEmitService = require('./eventService');
const Store = require('../models/stores');
const User = require('../models/user');

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
    // console.log(data)
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
                ],
            });
            if (existingDriver) {
                return {
                    success: false,
                    message: 'Driver already registered with the same vehicle registration number or license number.',
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

            
            EventEmitService.emitEventMethod(io, 'add-driver-event', {userid:data.storeownderid, message:"New driver added" });

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
            const drivers = await Driver.find({ storeID: storeid, active: true});
    
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



    
}

module.exports = AdminServices;
