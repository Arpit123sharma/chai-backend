import {v2 as cloudinary, v2} from "cloudinary"
import fs from "fs"



cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ");
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary =async (publicId,resourceType)=>{
     try {
        if(!publicId || !resourceType) return null

        const deleteResult = await v2.uploader.destroy(publicId,{
            resource_type:resourceType
        })
        return deleteResult
     } catch (error) {
        console.error("error in deleting the image from cloudinary: ",error);
        return null
     }
}



export {uploadOnCloudinary,deleteFromCloudinary}