import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getprofile = async (req, res) => {
  try {
    const { username } = req.params;
    const existUser = await User.findOne({ username });

    if (!existUser) {
      res.status(404).json({ error: "User not found" });
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
        .json({ message: "You can't unfollow and follow yourself" });
    }

    if (!usertoModidfy || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);
    //avan namala follow panna unfollow pananum. follow panalana follow pananum
    if (isFollowing) {
      //isFollowing true na unfollow pannanum

      await User.findByIdAndUpdate(
        { _id: id }, //avan id. url la irunthu namaku kedakum
        { $pull: { followers: req.user._id } } //ithu namma id
      ); //avan id ah kandupudichu avan followers la irunthu namala remove pananum
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $pull: { following: id } }
      ); //namma id ah kandupudichu namma following la irunthu avana remove pananum
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
    const userfollwedbyme = await User.findById(userId).select("-password"); //getting logged user details without password

    // Fetch 10 random users excluding the logged-in user
    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } }, //document la irukura detais la intha condition ah satisfy panura document ah thavara ellem varum(login la irukura user ah thavala ellem varum)
      { $sample: { size: 10 } },
    ]);

    // Filter users not followed by the logged-in user
    const following = userfollwedbyme.following || [];
    const filteredUser = users.filter((user) => !following.includes(user._id)); //ena follow panuravanga laam true ah varuvanga. but follow panathavangala eduka munadi ! iruku

    // console.log(filteredUser);

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

export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    let user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      username,
      email,
      fullName,
      currentPassword,
      newPassword,
      bio,
      link,
      profileImg,
      coverImg,
    } = req.body;
    // const { profileImg, coverImg } = req.body;

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({ message: "Provide all password Field" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current Password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Enter password minimam 6 character" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // if (profileImg) {
    //   //https://res.cloudinary.com/dcp7ypbt/image/upload/v172681/cld-sample-5.jpg
    //   //  namaku last ah irukura cld-sample-5 matum taan venum . so atha thaniya eduka ipudi panurom
    //   if (user.profileImg) {
    //     await cloudinary.uploader.destroy(
    //       user.profileImg.split("/").pop().split(".")[0]
    //     );
    //   }
    //   const uploadedResponse = await cloudinary.uploader.upload(profileImg);
    //   profileImg = uploadedResponse.secure_url;
    // }

    // if (coverImg) {
    //   if (user.coverImg) {
    //     await cloudinary.uploader.destroy(
    //       user.coverImg.split("/").pop().split(".")[0]
    //     );
    //   }
    //   const uploadedResponse = await cloudinary.uploader.upload(coverImg);
    //   coverImg = uploadedResponse.secure_url;
    // }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    // user.profileImg = profileImg || user.profileImg;
    // user.coverImg = coverImg || user.coverImg;
    user.link = link || user.link;

    user = await user.save();
    user.password = null;
    //inga response kaka password ah null ah canghe panurom.so mongodb database ah affect panathu. save panna taan affect pannum
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Server Error in update user" });
  }
};
