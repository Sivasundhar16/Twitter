import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getprofile = async (req, res) => {
  try {
    const { username } = req.params;
    const existUser = await User.findOne({ username });

    if (!existUser) {
      res.status(400).json({ error: "User not found" });
    }
    res.status(200).json({ existUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server Error" });
  }
};

export const followUnfollow = async (req, res) => {
  try {
    const { id } = req.params;

    const usertoModidfy = await User.findById({ _id: id }); //ithu vanthu namma follow and unfollow panna neankira person. vaara url la irunthu id ah cachu avan id ah find panurom
    const currentUser = await User.findById({ _id: req.user._id }); //ithu vanthu namma. req la irunthu namma id ah find panurom

    if (id === req.user._id) {
      //namala namale follow and unfollow pannama irukurathu. because of namalala apudi panna mudiyathu
      return res
        .status(400)
        .json({ message: "You can't unfollow and follow your self" });
    }

    if (!usertoModidfy || !currentUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //isFollowing true na unfollow pannanum

      await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { followers: req.user._id } }
      ); //avan id ah kandupudichu avan followers la irunthu namal remove pananum
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $pull: { following: id } }
      ); //nama id ah kandupudichu namma following la irunthu anana remove pananum
      res.status(200).json({ message: "Unfollow successfully" });
    } else {
      //isFollowing false an follow pannanum
      await User.findByIdAndUpdate(
        { _id: id },
        { $push: { followers: req.user._id } }
      ); //ithu vanthu namma avana follow panna avan followers la namma id ah push panna

      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $push: { following: id } }
      ); //ithu vanthu namma following la avan id ah push panna

      res.status(200).json({ message: "You followed successfully" });

      //notification send pannanum//////$$$$$$$4

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: usertoModidfy._id, //inga direct ah id uhm kudukalam
      });
      await newNotification.save();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

export const suggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the logged-in user's data
    const userfollwedbyme = await User.findById(userId).select("-password");

    // Fetch 10 random users excluding the logged-in user
    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 10 } },
    ]);

    // Filter users not followed by the logged-in user
    const following = userfollwedbyme.following || [];
    const filteredUser = users.filter((user) => !following.includes(user._id));

    // Pick the first 4 suggested users and remove passwords
    const suggestedUser = filteredUser.slice(0, 4).map((user) => ({
      ...user,
      password: null, // Safely nullify password
    }));

    if (suggestedUser.length === 0) {
      return res.status(200).json({ message: "No suggested users found" });
    }

    res.status(200).json(suggestedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in suggested User" });
  }
};
