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
      return res.status(200).json({ message: "Post unliked successfully" });
    } else {
      //like
      post.likes.push(userId);
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
    const posts = await Post.find().sort({ createdAt: -1 });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in get Post ${error.message}`);
    return res.status(500).json({ error: "Internal server Error" });
  }
};
