import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const videoStats = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$views"
                },
                totalVideos:{
                    $sum:1
                }
            }
        }
    ])
    if (!videoStats) {
        throw new ApiError(500,"something went wrong while fetching videoStats ")
    }
    const totalLikes = await Like.countDocuments({
        video:{$in:await Video.find({owner:req.user?._id},"_id")}
    })
    if (!totalLikes) {
        throw new ApiError(500,"something went wrong while fetching totalLikes ")
    }
    const totalSubscribers = await Subscription.countDocuments({ channel: req.user._id });
    // if (!totalSubscribers) {
    //     throw new ApiError(500,"something went wrong while fetching totalsubscribers ")
    // }
    return res
    .status(200)
    .json(new ApiResponse(200,{
        totallikes:totalLikes,
        totalSubscribers:totalSubscribers,
        totalVideos:videoStats[0].totalVideos,
        totalViews:videoStats[0].totalViews
    },"stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find({
        owner:req.user?._id
    })
    if (!videos) {
        throw new ApiError(500,"user dont have any video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,videos,"videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }