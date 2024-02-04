import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const validVideo = isValidObjectId(videoId)
    if (!validVideo) {
        throw new ApiError(400,"invalid video id")
    }
    const likeExists = await Like.find({
        video:videoId,
        likedBy:req.user?._id
    })
    if (likeExists) {
        await Like.findByIdAndDelete(likeExists._id);
        return res
        .status(200)
        .json(new ApiResponse(200,{},"like was remove from this video successfully"))
    }
    else{
        const like = await Like.create({
            video:videoId,
            likedBy:req.user?._id
        })
        
        return res
        .status(200)
        .json(new ApiResponse(200,like,"video liked successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400,"comment id is missing")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400,"video id is not valid")
    }
    const likeExists = await Like.find({
        comment:commentId,
        likedBy:req.user?._id
    })
    if (likeExists) {
        await Like.findByIdAndDelete(likeExists._id);
        return res.status(200)
        .json(new ApiResponse(200,{},"like from this comment was removed"))
    }
    else{
        const like = await Like.create({
            comment:commentId,
            likedBy:req.user?._id
        })
        
        return res.status(200)
        .json(new ApiResponse(200,like,"comment liked successfully"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(400,"tweet id is not there")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"tweet is is not valid")
    }
    const likeExists = await Like.find({
        tweet:tweetId,
        likedBy:req.user?._id
    })
    if (likeExists) {
        await Like.findByIdAndDelete(likeExists._id);
        return res.status(200)
        .json(new ApiResponse(200,{},"like from this tweet was removed"))
    }
    else{
        const like = await Like.create({
            tweet:tweetId,
            likedBy:req.user?._id
        })
        
        return res.status(200)
        .json(new ApiResponse(200,like,"tweet liked successfully"))
    }
    }

)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likeVideos = await Like.aggregate([
        {
            $match: {
                likedBy:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $unwind:"$videos"
        },
        {
            $lookup:{
                from:"likes",
                localField:"$videos._id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                }
            }
        },
        {
            $project:{
                _id:"$videos._id",
                title:"$videos.title",
                description:"$videos.description",
                duration:"$videos.duration",
                videoFile:"$videos.videoFile",
                thumbnail:"$videos.thumbnail",
                views:"$videos.views",
                owner:"$videos.owner",
                likescount:"$likescount"
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,likeVideos,"liked videofetched successfully!!"))
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}