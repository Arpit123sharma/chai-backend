import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!videoId) {
        throw new ApiError(400,"videoid is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"video id is not a valid id")
    }

    const comments = await Comment.find({
        video:videoId
    }).skip((page-1)*limit).limit(Number(limit))
    if (!comments) {
        throw new ApiError(400,"this video dont have comments")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,comments,"comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if (!videoId) {
        throw new ApiError(400,"videoid is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"video id is not a valid id")
    }
    if(!content){
        throw new ApiError(400,"content is required")
    }
    const comment = await Comment.create({
        content:content,
        video:videoId,
        owner:req.user?._id
    })
    if (!comment) {
        throw new ApiError(500,"something went wrong while creating a comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,comment,"comment is created successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if ( !commentId) {
        throw new ApiError(400,"commentId is required")
    }
    
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400,"comment id is not a valid id")
    }
    if(!content){
        throw new ApiError(400,"content is required")
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        $set:{content:content}
    },{new:true})
    if (!updatedComment) {
        throw new ApiError(500,"something went wrong while updating a comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedComment,"comment is updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if ( !commentId) {
        throw new ApiError(400,"commentId is required")
    }
    
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400,"comment id is not a valid id")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if (!deletedComment) {
        throw new ApiError(200,"something went wrong while deleting a comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"comment is deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
