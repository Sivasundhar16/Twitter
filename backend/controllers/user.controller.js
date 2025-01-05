import User from "../models/user.model.js";

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
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
