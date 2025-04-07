import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ message: "Post must have Image or Text" });
    }

    if (img) {
      uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text: text,
      img: img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error in create post ${error.message}`);
    res.status(500).json({ error: "Internal server Error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById({ _id: id });
    if (!post) {
      return res.status(404).json({ message: "Post is not found" });
    }

    // user can delete their own post only
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You are not allowed to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete({ _id: id });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(`Error in delete Post ${error.message}`);
    res.status(500).json({ error: "Internal server Error" });
  }
};
export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Text is requird for comment " });
    }

    const post = await Post.findById({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: userId,
      text: text,
    };

    post.comments.push(comment);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log(`Error in comment Post ${error.message}`);
    res.status(500).json({ error: "Internal server Error" });
  }
};
export const likeUnlike = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    //user already like poturuntha unlike pannanum. podalana like pananum
    if (userLikedPost) {
      //unlike
      await Post.findByIdAndUpdate(
        { _id: postId },
        { $pull: { likes: userId } }
      );
      await User.updateOne({ _id: userId }, { $pull: { likedPost: postId } });
      return res.status(200).json({ message: "Post unliked successfully" });
    } else {
      //like
      post.likes.push(userId);
      await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { likedPost: postId } }
      );
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      return res.status(200).json({ message: "You liked the post" });
    }
  } catch (error) {
    console.log(`Error in like Post ${error.message}`);
    return res.status(500).json({ error: "Internal server Error" });
  }
};

export const getallPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: [
          "-password",
          "-email",
          "-following",
          "-followers",
          "-bio",
          "-link",
        ],
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in get Post ${error.message}`);
    return res.status(500).json({ error: "Internal server Error" });
  }
};

export const getLikedPost = async (req, res) => {
  try {
    // const { userId } = req.user;
    const { id: userId } = req.params;
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    //particular user like panna post ah inga edukurom
    const likedPosts = await Post.find({
      _id: { $in: user.likedPost },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: [
          "-password",
          "-email",
          "-following",
          "-followers",
          "-bio",
          "-link",
        ],
      });
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log(`Error in get all post ${error.message}`);
    return res.status(500).json({ error: "Internal server Error" });
  }
};

export const getFollowingPost = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    // Find the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the list of following users
    const { following } = user;
    if (following.length === 0) {
      return res.status(200).json([]); // Return empty array if not following anyone
    }

    // Fetch posts from following users
    const feedPosts = await Post.find({ user: { $in: following } }) // Use Post model here
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password", // Populate post owner's data excluding password
      })
      .populate({
        path: "comments.user",
        select: "-password", // Populate commenters' data excluding password
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.error(`Error in getFollowingPost: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.error(`Error in get user Post: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
