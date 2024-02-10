import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name || !description) {
        throw new ApiError(400,"every field is required")
    }
    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner:req.user?._id
    })
    if (!playlist) {
        throw new ApiError(500,"something went wrong while creating playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist created successfully"))

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!userId.trim()) {
        throw new ApiError(400,"user id is required")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"user id is invalid")
    }
    const playlists = await Playlist.find({
        owner:userId
    })
    if (!playlists) {
        throw new ApiError(500,"something went wrong while fetchinging users playlists")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlists,"playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!playlistId.trim()) {
        throw new ApiError(400,"playlist id is required")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400,"playlist id is invalid")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(500,"something went wrong while fetchinging  playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(400,"playlist and video id is required")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400,"playlist id is invalid")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"playlist id is invalid")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(500,"playlist not found")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(500,"video not found")
    }
    playlist.videos.push(videoId)
    const updatedPlaylist = await playlist.save({
        validateBeforeSave:false
    })
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"video added to the playlist succesfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!playlistId || !videoId) {
        throw new ApiError(400,"playlist and video id is required")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400,"playlist id is invalid")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"playlist id is invalid")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(500,"playlist not found")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(500,"video not found")
    }
    playlist.videos.pull(videoId)
    const updatedPlaylist = await playlist.save({
        validateBeforeSave:false
    })
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"video remove from the playlist succesfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId.trim()) {
        throw new ApiError(400,"playlist id is required")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400,"playlist id is invalid")
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!deletedPlaylist) {
        throw new ApiError(500,"playlist did'nt found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"playlist deleted succesfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId.trim()) {
        throw new ApiError(400,"playlist id is required")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400,"playlist id is invalid")
    }
    if (!name || !description) {
        throw new ApiError(400,"every field is required")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{name:name,description:description}
    },{new:true})
    if (!updatePlaylist) {
        throw new ApiError(500,"something went wrong while updating playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"playlist updated succesfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
