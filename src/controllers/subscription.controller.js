import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(400,"channelid is required")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400,"channelid is not valid")
    }
    if(channelId.toString()===req.user._id.toString()){
        throw new ApiError(400,"user cannot subscribe to his channel")
    }
    const subscribedOrNot = await Subscription.findOne({
        subscriber:req.user?._id,
        channel:channelId
    })
    if (subscribedOrNot) {
        await Subscription.findByIdAndDelete(subscribedOrNot._id)
        return res
        .status(200)
        .json(new ApiResponse(200,{},"user unsubscribe this channel successfully"))
    }
    else{
       const subscribe = await Subscription.create({
        subscriber:req.user?._id,
        channel:channelId
       })
       if (!subscribe) {
          throw new ApiError(500,"while subscribing to this channel something went wrong")
       }
       return res.status(200)
       .json(new ApiResponse(200,subscribe,"user subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!channelId.trim()) {
        throw new ApiError(400,"channel id is required")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400,"channel id is invalid")
    }
    const subscribers = await Subscription.find({
        channel:channelId
    })
    if (!subscribers) {
        throw new ApiError(400,"this channel has no subscribers")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,subscribers,"subscribers list fetched successfully!!"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId.trim()) {
        throw new ApiError(400,"subscriber id is required")
    }
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400,"subscriber id is invalid")
    }
    const channels = await Subscription.find({
        subscriber:subscriberId
    })
    if (!channels) {
        throw new ApiError(400,"user does not subscribed to any channel")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,channels,"channel list fetched successfully!!"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}