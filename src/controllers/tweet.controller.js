import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if (!content) {
        throw new ApiError(400,"there is no tweet")
    }
    const tweet = await Tweet.create({
        content:content,
        owner:req.user?._id
    })
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"tweeted successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if (!userId) {
        throw new ApiError(400,"user id is missing")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"user id is invalid")
    }
    const tweets = await Tweet.find({
        owner:userId
    })
    if (!tweets) {
        throw new ApiError(400,"user has zero tweets")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,tweets,"tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if (!content) {
        throw new ApiError(400,"content is missing ")
    }
    if (!tweetId?.trim()) {
        throw new ApiError(400,"tweet id is missing")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"tweet id is invalid")
    }
    const tweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content},
        
    },
    {
        new:true
    })

    if (!tweet) {
        throw new ApiError(500,"something went wrong while updating the tweet")
    }

    return res 
    .status(200)
    .json(new ApiResponse(200,tweet,"tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if (!tweetId?.trim()) {
        throw new ApiError(400,"tweet id is missing")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"tweet id is invalid")
    }
    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deleteTweet){
        throw new ApiError(500,"something went wrong while deleting tweet")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
