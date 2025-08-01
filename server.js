const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const YT_API_KEY = process.env.YT_API_KEY;


app.get('/channel', async (req, res) => {
  const { name } = req.query;

  try {
    // Step 1: Get channel ID
    const searchRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          q: name,
          type: 'channel',
          key: YT_API_KEY
        }
      }
    );
    const channelId = searchRes.data.items[0].snippet.channelId;

    // Step 2: Get channel stats
    const statsRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels`, {
        params: {
          part: 'snippet,statistics',
          id: channelId,
          key: YT_API_KEY
        }
      }
    );
    const channelData = statsRes.data.items[0];

    // Step 3: Get recent video IDs
    const uploadsRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          channelId: channelId,
          order: 'date',
          maxResults: 6,
          key: YT_API_KEY
        }
      }
    );

    const videoIds = uploadsRes.data.items
      .filter(item => item.id.videoId)
      .map(item => item.id.videoId)
      .join(',');

    // Step 4: Get stats for those videos
    const videosRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: 'snippet,statistics',
          id: videoIds,
          key: YT_API_KEY
        }
      }
    );

    res.json({
      channel: channelData,
      videos: videosRes.data.items
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('✅ Server is running on http://localhost:3001');
});
