exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err) => {
      if (err) {
        return res.status(403).json({
          message: "Expired refresh token",
        });
      }

      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (err) {
    console.error("❌ Refresh Token Error:", err);
    res.status(500).json({
      message: "Could not refresh token",
    });
  }
};
