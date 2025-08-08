require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'https://farhashireen.github.io' })); // ✅ Your frontend origin

const YT_API_KEY = process.env.YT_API_KEY;

app.get('/channel', async (req, res) => {
  const { name } = req.query;

  try {
    // Get channel ID
    const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: name,
        type: 'channel',
        key: YT_API_KEY
      }
    });

    const channelId = searchRes.data.items[0].snippet.channelId;

    // Get channel stats
    const statsRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: YT_API_KEY
      }
    });

    // Get recent videos
    const videoRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        channelId,
        maxResults: 50,
        order: 'date',
        type: 'video',
        key: YT_API_KEY
      }
    });

    const videoIds = videoRes.data.items.map(item => item.id.videoId).join(',');

    const videoStatsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics',
        id: videoIds,
        key: YT_API_KEY
      }
    });

    res.json({
      channel: statsRes.data.items[0],
      videos: videoStatsRes.data.items
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch channel data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
