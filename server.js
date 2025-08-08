require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'https://farhashireen.github.io' })); // ✅ Your frontend

const YT_API_KEY = process.env.YT_API_KEY;

app.get('/channel', async (req, res) => {
  const { name } = req.query;

  try {
    // Step 1: Search for the channel
    const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: name,
        type: 'channel',
        key: YT_API_KEY
      }
    });

    const searchItems = searchRes.data.items;
    if (!searchItems || searchItems.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channelId = searchItems[0].snippet.channelId;

    // Step 2: Get channel stats
    const statsRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: YT_API_KEY
      }
    });

    // Step 3: Get recent videos
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

    const videoIds = videoRes.data.items
      .map(item => item.id.videoId)
      .filter(Boolean)
      .join(',');

    let videos = [];
    if (videoIds.length > 0) {
      const videoStatsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,statistics',
          id: videoIds,
          key: YT_API_KEY
        }
      });
      videos = videoStatsRes.data.items;
    }

    res.json({
      channel: statsRes.data.items[0],
      videos
    });
  } catch (err) {
    console.error('Backend Error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch channel data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
