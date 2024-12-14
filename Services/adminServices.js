const StaticImage = require('../models/staticImages'); // Assuming the model is in the 'models' directory
const mongoose = require('mongoose');

class StaticImageService {
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
    
}

module.exports = StaticImageService;
