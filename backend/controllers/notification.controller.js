import Notification from "../models/notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg", //itha namma array va ah kooda kudukalam
    });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notification);
  } catch (error) {
    console.log(`Error in notification read ${error.message}`);
    return res.status(500).json({ error: "Internal server Error" });
  }
};
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notification deleted Successfully" });
  } catch (error) {
    console.log(`Error in notification delete ${error.message}`);
    return res.status(500).json({ error: "Internal server Error" });
  }
};
