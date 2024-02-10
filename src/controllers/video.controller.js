import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import { extractPublicId } from "cloudinary-build-url"


const getAllVideos = asyncHandler(async (req, res) => {
       
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
        //TODO: get all videos based on query, sort, pagination
        let videoQuery = {}
        if (query) {
            videoQuery = {...videoQuery, title:new RegExp(query,'i')}
        }
        if (userId) {
            if (!isValidObjectId(userId)) {
                throw new ApiError(400,"userId is not valid")
            }
            videoQuery = { ...videoQuery,owner:userId }
        }
        const totalVideos = await Video.countDocuments(videoQuery)
        
        const sortQuery = {}
    
        if (sortBy) {
            sortQuery[sortBy] = sortType === "desc"?-1:1
        }
        const videos = await Video.find(videoQuery)
        .sort(sortQuery)
        .skip((page-1)*limit)
        .limit(Number(limit))

        if (!videos) {
            throw new ApiError(500,"something went wrong when fetching the videos")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(200,{
            totalVideos,
            videos
        },"videos fetched successfully!!!"))
       
})

const publishAVideo = asyncHandler(async (req, res) => {
    
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400,"all fields are required")
    }
    const videoPath = req.files?.videoFile[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path
    if (!videoPath) {
        throw new ApiError(400,"videopath is required")
    }
    if (!thumbnailPath) {
        throw new ApiError(400,"thumbnail is required")
    }
    
        // console.log("video uploading started");
        const videoUpload = await uploadOnCloudinary(videoPath);
        // console.log("video uploading ended");
        if (!videoUpload) {
            throw new ApiError(400,"videopath is required")
        }
        // console.log(videoUpload);
        // console.log(videoUpload.duration);
        // console.log("thumbnail uploading started");
        const thumbnailUpload = await uploadOnCloudinary(thumbnailPath);
        // console.log("thumbnail uploading ended");
        if (!thumbnailUpload) {
            throw new ApiError(400,"thumbnail is required")
        }
        // console.log(thumbnailUpload);
    
    
    const video = await Video.create({
        videoFile:videoUpload?.url,
        thumbnail:thumbnailUpload?.url,
        title:title,
        description:description,
        duration:videoUpload?.duration,
        owner:req.user?._id
    })
    if (!video) {
        throw new ApiError(500,"something went wrong while uploading a video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video uploaded successfully"))
   
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(400,"videoId is needed")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"videoId is not valid")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(500,"error in fetching a video")
    }
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(500,"something went wrong while req user")
    }
    user.watchHistory.push(videoId)
    await user.save({
        validateBeforeSave:false
    })
    video.views+=1
    const views = await video.save({
        validateBeforeSave:false
    })
    if (!views) {
        throw new ApiError(500,"something went wrong while fetching views")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video fetched successfully!"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log("api hit");
    //TODO: update video details like title, description, thumbnail
    console.log(videoId);
    if (!videoId) {
        throw new ApiError(400,"videoId is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"videoId is invalid")
    }
    const video = await Video.findById(videoId)
    const {title,description} = req.body
    if (!title || !description) {
        throw new ApiError(400,"one field is required to update")
    }
    
    const thumbnailPath = req.file?.path
    if (!thumbnailPath) {
        throw new ApiError(400,"thumbnail path is missing")
    }
    const publicId = extractPublicId(video.thumbnail)
    const deletionResult = await deleteFromCloudinary(publicId,"image")
    if (!deletionResult) {
        throw new ApiError(500,"error in deleting the old thumbnail")
    }
    const newThumbnail = await uploadOnCloudinary(thumbnailPath)
    if (!newThumbnail) {
        throw new ApiError(200,"error in uploading new thumbnail")
    }
    const updatedVideo = await Video.findByIdAndUpdate(videoId,{
        $set:{title,description,thumbnail:newThumbnail?.url}
    },{
        new:true
    })
    return res
    .status(200)
    .json(new ApiResponse(200,updateVideo,"video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId.trim()) {
        throw new ApiError(400,"video id is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"video id is not valid")
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if (!deletedVideo) {
        throw new ApiError(500,"video not found")
    }
    const publicId = extractPublicId(deletedVideo.videoFile)
    const deleteVideoFromCloud = await deleteFromCloudinary(publicId,"video")
    if (!deleteVideoFromCloud) {
        throw new ApiError(500,"something went wrong while deleting the video")
    }
    const tId = extractPublicId(deletedVideo.thumbnail)
    const deleteThumbnailFromCloud = await deleteFromCloudinary(tId,"image")
    if (!deleteThumbnailFromCloud) {
        throw new ApiError(500,"something went wrong while deleting the thumbnail")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId.trim()) {
        throw new ApiError(400,"video id is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"video id is not valid")
    }
    const video = await Video.findById(videoId)
    video.isPublished = !video.isPublished
    await video.save()
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
