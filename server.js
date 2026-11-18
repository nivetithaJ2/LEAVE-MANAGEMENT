import "dotenv/config";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log(error));

const leaveSchema = new mongoose.Schema({
  employeeName: String,
  leaveType: String,
  startDate: String,
  endDate: String,
  reason: String,
  status: {
    type: String,
    default: "Pending",
  },
});

const Leave = mongoose.model("Leave", leaveSchema);

app.get("/leaves", async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leaves" });
  }
});

app.post("/leaves", async (req, res) => {
  try {
    const leave = new Leave(req.body);
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Failed to apply leave" });
  }
});

app.patch("/leaves/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

app.delete("/leaves/:id", async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete leave" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
