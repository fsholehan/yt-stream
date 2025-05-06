import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { Innertube } from "youtubei.js";
import { getPoToken } from "./utils/getPoToken.js";

const app = express();
const port = 3000;

app.use(cors());

app.get("/stream/:videoId", async (req, res) => {
  const { po_token, visitor_data } = await getPoToken();
  const youtube = await Innertube.create({ visitor_data, po_token });
  try {
    const videoId = req.params.videoId;

    const info = await youtube.getBasicInfo(videoId);
    const format = info.chooseFormat({ type: "audio", quality: "best" });

    if (!format) {
      return res.status(404).send("Audio format not found.");
    }

    let url = format?.decipher(youtube.session.player);

    if (!url) {
      return res.status(500).send("Failed to get the audio stream URL.");
    }

    // Streaming data ke client
    fetch(url.toString())
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch audio stream.");
        }
        res.setHeader("Content-Type", "audio/mpeg");
        response.body.pipe(res);
      })
      .catch((error) => {
        res.status(500).send(error.message);
      });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
