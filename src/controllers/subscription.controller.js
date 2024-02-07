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
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}